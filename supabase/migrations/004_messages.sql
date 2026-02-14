-- ============================================
-- Migration 004: Messages Table for Real-time Chat
-- ============================================

-- Messages table
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (char_length(content) > 0 AND char_length(content) <= 2000),
  created_at TIMESTAMPTZ DEFAULT now(),
  read_at TIMESTAMPTZ,
  is_deleted BOOLEAN DEFAULT false
);

-- Indexes for performance
CREATE INDEX idx_messages_match ON messages(match_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_created ON messages(match_id, created_at DESC);
CREATE INDEX idx_messages_unread ON messages(match_id, read_at) WHERE read_at IS NULL;

-- Enable Row Level Security
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is part of a match
CREATE OR REPLACE FUNCTION is_match_participant(p_match_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM matches
    WHERE id = p_match_id
    AND (user1_id = p_user_id OR user2_id = p_user_id)
    AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies for Messages

-- Users can view messages in matches they are part of
CREATE POLICY "Users can view messages in their matches"
  ON messages
  FOR SELECT
  TO authenticated
  USING (
    is_match_participant(match_id, auth.uid())
  );

-- Users can send messages in matches they are part of
CREATE POLICY "Users can send messages in their matches"
  ON messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = sender_id
    AND is_match_participant(match_id, auth.uid())
  );

-- Users can update their own messages (for read receipts or soft delete)
CREATE POLICY "Users can update messages in their matches"
  ON messages
  FOR UPDATE
  TO authenticated
  USING (
    is_match_participant(match_id, auth.uid())
  );

-- Enable Realtime for messages table
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- Function to get chat messages with pagination
CREATE OR REPLACE FUNCTION get_chat_messages(
  p_match_id UUID,
  p_user_id UUID,
  p_limit INT DEFAULT 50,
  p_before TIMESTAMPTZ DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  match_id UUID,
  sender_id UUID,
  content TEXT,
  created_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  is_deleted BOOLEAN,
  is_own_message BOOLEAN
) AS $$
BEGIN
  -- Verify user is part of this match
  IF NOT is_match_participant(p_match_id, p_user_id) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  RETURN QUERY
  SELECT 
    m.id,
    m.match_id,
    m.sender_id,
    CASE WHEN m.is_deleted THEN '[Message deleted]' ELSE m.content END,
    m.created_at,
    m.read_at,
    m.is_deleted,
    (m.sender_id = p_user_id) AS is_own_message
  FROM messages m
  WHERE m.match_id = p_match_id
    AND (p_before IS NULL OR m.created_at < p_before)
  ORDER BY m.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark messages as read
CREATE OR REPLACE FUNCTION mark_messages_read(
  p_match_id UUID,
  p_user_id UUID
)
RETURNS INT AS $$
DECLARE
  updated_count INT;
BEGIN
  -- Verify user is part of this match
  IF NOT is_match_participant(p_match_id, p_user_id) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  -- Mark all unread messages from the OTHER user as read
  UPDATE messages
  SET read_at = now()
  WHERE match_id = p_match_id
    AND sender_id != p_user_id
    AND read_at IS NULL;

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get unread message count per match
CREATE OR REPLACE FUNCTION get_unread_counts(p_user_id UUID)
RETURNS TABLE (
  match_id UUID,
  unread_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.match_id,
    COUNT(*)::BIGINT AS unread_count
  FROM messages m
  JOIN matches mt ON mt.id = m.match_id
  WHERE (mt.user1_id = p_user_id OR mt.user2_id = p_user_id)
    AND mt.is_active = true
    AND m.sender_id != p_user_id
    AND m.read_at IS NULL
  GROUP BY m.match_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Anti-spam: Rate limiting function (returns true if rate limit exceeded)
CREATE OR REPLACE FUNCTION check_message_rate_limit(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  recent_count INT;
BEGIN
  -- Count messages in last minute
  SELECT COUNT(*) INTO recent_count
  FROM messages
  WHERE sender_id = p_user_id
    AND created_at > now() - INTERVAL '1 minute';

  -- Allow max 30 messages per minute
  RETURN recent_count >= 30;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
