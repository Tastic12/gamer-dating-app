-- ============================================
-- Migration 006: GDPR Data Export and Deletion
-- ============================================

-- Deletion requests table (for 30-day grace period)
CREATE TABLE public.deletion_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  requested_at TIMESTAMPTZ DEFAULT now(),
  scheduled_deletion_at TIMESTAMPTZ DEFAULT (now() + INTERVAL '30 days'),
  cancelled_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'cancelled', 'completed'))
);

CREATE INDEX idx_deletion_requests_user ON deletion_requests(user_id);
CREATE INDEX idx_deletion_requests_scheduled ON deletion_requests(scheduled_deletion_at) WHERE status = 'pending';

ALTER TABLE deletion_requests ENABLE ROW LEVEL SECURITY;

-- Users can view/manage their own deletion requests
CREATE POLICY "Users can view own deletion requests"
  ON deletion_requests
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create deletion requests"
  ON deletion_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own deletion requests"
  ON deletion_requests
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to export all user data (GDPR compliance)
CREATE OR REPLACE FUNCTION export_user_data(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
  profile_data JSONB;
  swipes_data JSONB;
  matches_data JSONB;
  messages_data JSONB;
  blocks_data JSONB;
  reports_data JSONB;
BEGIN
  -- Verify the user is requesting their own data
  IF auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  -- Get profile data
  SELECT to_jsonb(p.*) INTO profile_data
  FROM profiles p
  WHERE p.id = p_user_id;

  -- Get swipes (both directions for transparency)
  SELECT COALESCE(jsonb_agg(to_jsonb(s.*)), '[]'::jsonb) INTO swipes_data
  FROM swipes s
  WHERE s.swiper_id = p_user_id;

  -- Get matches
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'id', m.id,
    'matched_at', m.matched_at,
    'is_active', m.is_active,
    'other_user_id', CASE WHEN m.user1_id = p_user_id THEN m.user2_id ELSE m.user1_id END
  )), '[]'::jsonb) INTO matches_data
  FROM matches m
  WHERE m.user1_id = p_user_id OR m.user2_id = p_user_id;

  -- Get messages sent by user
  SELECT COALESCE(jsonb_agg(to_jsonb(msg.*)), '[]'::jsonb) INTO messages_data
  FROM messages msg
  WHERE msg.sender_id = p_user_id;

  -- Get blocks made by user
  SELECT COALESCE(jsonb_agg(to_jsonb(b.*)), '[]'::jsonb) INTO blocks_data
  FROM blocks b
  WHERE b.blocker_id = p_user_id;

  -- Get reports made by user
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'id', r.id,
    'category', r.category,
    'description', r.description,
    'status', r.status,
    'created_at', r.created_at
  )), '[]'::jsonb) INTO reports_data
  FROM reports r
  WHERE r.reporter_id = p_user_id;

  -- Build final result
  result := jsonb_build_object(
    'export_date', now(),
    'user_id', p_user_id,
    'profile', profile_data,
    'swipes', swipes_data,
    'matches', matches_data,
    'messages_sent', messages_data,
    'blocks', blocks_data,
    'reports_made', reports_data
  );

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to request account deletion
CREATE OR REPLACE FUNCTION request_account_deletion(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  deletion_date TIMESTAMPTZ;
  request_id UUID;
BEGIN
  IF auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  -- Check if there's already a pending request
  SELECT id INTO request_id
  FROM deletion_requests
  WHERE user_id = p_user_id AND status = 'pending';

  IF request_id IS NOT NULL THEN
    RAISE EXCEPTION 'Deletion request already pending';
  END IF;

  deletion_date := now() + INTERVAL '30 days';

  -- Create deletion request
  INSERT INTO deletion_requests (user_id, scheduled_deletion_at)
  VALUES (p_user_id, deletion_date)
  RETURNING id INTO request_id;

  -- Deactivate profile immediately
  UPDATE profiles
  SET is_active = false, updated_at = now()
  WHERE id = p_user_id;

  -- Deactivate all matches
  UPDATE matches
  SET is_active = false, unmatched_at = now()
  WHERE (user1_id = p_user_id OR user2_id = p_user_id) AND is_active = true;

  RETURN jsonb_build_object(
    'request_id', request_id,
    'scheduled_deletion_at', deletion_date,
    'message', 'Your account will be permanently deleted in 30 days. You can cancel this request by logging back in.'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to cancel deletion request
CREATE OR REPLACE FUNCTION cancel_account_deletion(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  IF auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  -- Cancel the pending request
  UPDATE deletion_requests
  SET status = 'cancelled', cancelled_at = now()
  WHERE user_id = p_user_id AND status = 'pending';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'No pending deletion request found';
  END IF;

  -- Reactivate profile
  UPDATE profiles
  SET is_active = true, updated_at = now()
  WHERE id = p_user_id;

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check deletion status
CREATE OR REPLACE FUNCTION get_deletion_status(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  IF auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  SELECT jsonb_build_object(
    'has_pending_request', true,
    'requested_at', dr.requested_at,
    'scheduled_deletion_at', dr.scheduled_deletion_at,
    'days_remaining', EXTRACT(DAY FROM (dr.scheduled_deletion_at - now()))::INT
  ) INTO result
  FROM deletion_requests dr
  WHERE dr.user_id = p_user_id AND dr.status = 'pending';

  IF result IS NULL THEN
    result := jsonb_build_object('has_pending_request', false);
  END IF;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
