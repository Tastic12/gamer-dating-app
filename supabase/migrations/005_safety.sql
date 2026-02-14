-- ============================================
-- Migration 005: Blocks, Reports, and Admin Users
-- ============================================

-- Blocks table
CREATE TABLE public.blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  blocked_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(blocker_id, blocked_id),
  CHECK (blocker_id != blocked_id)
);

-- Reports table
CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reported_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN (
    'inappropriate_content',
    'harassment',
    'spam',
    'fake_profile',
    'underage',
    'other'
  )),
  description TEXT CHECK (char_length(description) <= 1000),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  admin_notes TEXT,
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  CHECK (reporter_id != reported_id)
);

-- Admin users table
CREATE TABLE public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  role TEXT NOT NULL DEFAULT 'moderator' CHECK (role IN ('moderator', 'admin', 'super_admin')),
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES profiles(id)
);

-- Indexes
CREATE INDEX idx_blocks_blocker ON blocks(blocker_id);
CREATE INDEX idx_blocks_blocked ON blocks(blocked_id);
CREATE INDEX idx_reports_reporter ON reports(reporter_id);
CREATE INDEX idx_reports_reported ON reports(reported_id);
CREATE INDEX idx_reports_status ON reports(status) WHERE status = 'pending';
CREATE INDEX idx_admin_users_user ON admin_users(user_id);

-- Enable RLS
ALTER TABLE blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users WHERE user_id = p_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is blocked
CREATE OR REPLACE FUNCTION is_blocked(p_user1 UUID, p_user2 UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM blocks
    WHERE (blocker_id = p_user1 AND blocked_id = p_user2)
       OR (blocker_id = p_user2 AND blocked_id = p_user1)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies for Blocks

-- Users can view their own blocks
CREATE POLICY "Users can view own blocks"
  ON blocks
  FOR SELECT
  TO authenticated
  USING (auth.uid() = blocker_id);

-- Users can create blocks
CREATE POLICY "Users can create blocks"
  ON blocks
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = blocker_id);

-- Users can delete their own blocks (unblock)
CREATE POLICY "Users can delete own blocks"
  ON blocks
  FOR DELETE
  TO authenticated
  USING (auth.uid() = blocker_id);

-- RLS Policies for Reports

-- Users can view their own reports (as reporter)
CREATE POLICY "Users can view own reports"
  ON reports
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = reporter_id
    OR is_admin(auth.uid())
  );

-- Users can create reports
CREATE POLICY "Users can create reports"
  ON reports
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = reporter_id);

-- Admins can update reports
CREATE POLICY "Admins can update reports"
  ON reports
  FOR UPDATE
  TO authenticated
  USING (is_admin(auth.uid()));

-- RLS Policies for Admin Users

-- Admins can view admin users
CREATE POLICY "Admins can view admin users"
  ON admin_users
  FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));

-- Only super admins can manage admin users
CREATE POLICY "Super admins can manage admin users"
  ON admin_users
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE user_id = auth.uid() AND role = 'super_admin'
    )
  );

-- Update discovery function to exclude blocked users
CREATE OR REPLACE FUNCTION get_discovery_profiles(
  p_user_id UUID,
  p_limit INT DEFAULT 20,
  p_offset INT DEFAULT 0,
  p_platforms TEXT[] DEFAULT NULL,
  p_genres TEXT[] DEFAULT NULL,
  p_playstyle TEXT DEFAULT NULL,
  p_voice_chat BOOLEAN DEFAULT NULL,
  p_regions TEXT[] DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  display_name TEXT,
  date_of_birth DATE,
  pronouns TEXT,
  region TEXT,
  bio TEXT,
  platforms TEXT[],
  favorite_genres TEXT[],
  top_games TEXT[],
  playstyle TEXT,
  voice_chat BOOLEAN,
  typical_play_times TEXT[],
  photo_urls TEXT[],
  compatibility_score INT
) AS $$
DECLARE
  user_platforms TEXT[];
  user_genres TEXT[];
  user_playstyle TEXT;
  user_voice_chat BOOLEAN;
BEGIN
  -- Get current user's preferences for scoring
  SELECT p.platforms, p.favorite_genres, p.playstyle, p.voice_chat
  INTO user_platforms, user_genres, user_playstyle, user_voice_chat
  FROM profiles p
  WHERE p.id = p_user_id;

  RETURN QUERY
  SELECT 
    p.id,
    p.display_name,
    p.date_of_birth,
    p.pronouns,
    p.region,
    p.bio,
    p.platforms,
    p.favorite_genres,
    p.top_games,
    p.playstyle,
    p.voice_chat,
    p.typical_play_times,
    p.photo_urls,
    (
      (SELECT COUNT(*) * 2 FROM unnest(p.platforms) AS plat WHERE plat = ANY(user_platforms))::INT +
      (SELECT COUNT(*) FROM unnest(p.favorite_genres) AS genre WHERE genre = ANY(user_genres))::INT +
      CASE WHEN p.playstyle = user_playstyle THEN 3 ELSE 0 END +
      CASE WHEN p.voice_chat = user_voice_chat THEN 2 ELSE 0 END
    ) AS compatibility_score
  FROM profiles p
  WHERE 
    p.id != p_user_id
    AND p.is_active = true
    AND p.is_banned = false
    AND p.onboarding_completed = true
    -- Exclude already swiped
    AND NOT EXISTS (
      SELECT 1 FROM swipes s 
      WHERE s.swiper_id = p_user_id AND s.swiped_id = p.id
    )
    -- Exclude matched
    AND NOT EXISTS (
      SELECT 1 FROM matches m 
      WHERE m.is_active = true
      AND ((m.user1_id = p_user_id AND m.user2_id = p.id) 
           OR (m.user1_id = p.id AND m.user2_id = p_user_id))
    )
    -- Exclude blocked users (BOTH directions)
    AND NOT EXISTS (
      SELECT 1 FROM blocks b
      WHERE (b.blocker_id = p_user_id AND b.blocked_id = p.id)
         OR (b.blocker_id = p.id AND b.blocked_id = p_user_id)
    )
    -- Apply filters
    AND (p_platforms IS NULL OR p.platforms && p_platforms)
    AND (p_genres IS NULL OR p.favorite_genres && p_genres)
    AND (p_playstyle IS NULL OR p.playstyle = p_playstyle)
    AND (p_voice_chat IS NULL OR p.voice_chat = p_voice_chat)
    AND (p_regions IS NULL OR p.region = ANY(p_regions))
  ORDER BY 
    compatibility_score DESC,
    RANDOM()
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get admin statistics
CREATE OR REPLACE FUNCTION get_admin_stats()
RETURNS TABLE (
  total_users BIGINT,
  active_users BIGINT,
  banned_users BIGINT,
  pending_reports BIGINT,
  total_matches BIGINT,
  total_messages BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM profiles)::BIGINT AS total_users,
    (SELECT COUNT(*) FROM profiles WHERE is_active = true AND is_banned = false)::BIGINT AS active_users,
    (SELECT COUNT(*) FROM profiles WHERE is_banned = true)::BIGINT AS banned_users,
    (SELECT COUNT(*) FROM reports WHERE status = 'pending')::BIGINT AS pending_reports,
    (SELECT COUNT(*) FROM matches WHERE is_active = true)::BIGINT AS total_matches,
    (SELECT COUNT(*) FROM messages)::BIGINT AS total_messages;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to ban a user (admin only)
CREATE OR REPLACE FUNCTION ban_user(p_admin_id UUID, p_user_id UUID, p_reason TEXT DEFAULT NULL)
RETURNS BOOLEAN AS $$
BEGIN
  -- Verify admin
  IF NOT is_admin(p_admin_id) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  -- Ban the user
  UPDATE profiles
  SET is_banned = true, updated_at = now()
  WHERE id = p_user_id;

  -- Deactivate all their matches
  UPDATE matches
  SET is_active = false, unmatched_at = now()
  WHERE (user1_id = p_user_id OR user2_id = p_user_id) AND is_active = true;

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to unban a user (admin only)
CREATE OR REPLACE FUNCTION unban_user(p_admin_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  IF NOT is_admin(p_admin_id) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  UPDATE profiles
  SET is_banned = false, updated_at = now()
  WHERE id = p_user_id;

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Rate limiting for reports (max 5 per day per user)
CREATE OR REPLACE FUNCTION check_report_rate_limit(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  recent_count INT;
BEGIN
  SELECT COUNT(*) INTO recent_count
  FROM reports
  WHERE reporter_id = p_user_id
    AND created_at > now() - INTERVAL '24 hours';

  RETURN recent_count >= 5;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
