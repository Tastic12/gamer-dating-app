-- ============================================
-- Migration 003: Swipes and Matches Tables
-- ============================================

-- Swipe actions (like/pass)
CREATE TABLE public.swipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  swiper_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  swiped_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('like', 'pass')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(swiper_id, swiped_id)
);

-- Matches (created when mutual like)
CREATE TABLE public.matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  user2_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  matched_at TIMESTAMPTZ DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  unmatched_by UUID REFERENCES profiles(id),
  unmatched_at TIMESTAMPTZ,
  UNIQUE(user1_id, user2_id),
  CHECK (user1_id < user2_id) -- enforce ordering to prevent duplicates
);

-- Indexes for performance
CREATE INDEX idx_swipes_swiper ON swipes(swiper_id);
CREATE INDEX idx_swipes_swiped ON swipes(swiped_id);
CREATE INDEX idx_swipes_action ON swipes(swiper_id, action);
CREATE INDEX idx_matches_user1 ON matches(user1_id) WHERE is_active = true;
CREATE INDEX idx_matches_user2 ON matches(user2_id) WHERE is_active = true;

-- Enable Row Level Security
ALTER TABLE swipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Swipes

-- Users can view their own swipes
CREATE POLICY "Users can view own swipes"
  ON swipes
  FOR SELECT
  TO authenticated
  USING (auth.uid() = swiper_id);

-- Users can create their own swipes
CREATE POLICY "Users can create own swipes"
  ON swipes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = swiper_id);

-- RLS Policies for Matches

-- Users can view matches they are part of
CREATE POLICY "Users can view own matches"
  ON matches
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Users can update matches they are part of (for unmatching)
CREATE POLICY "Users can update own matches"
  ON matches
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Function to check and create match when mutual like occurs
CREATE OR REPLACE FUNCTION check_and_create_match()
RETURNS TRIGGER AS $$
DECLARE
  match_user1 UUID;
  match_user2 UUID;
BEGIN
  -- Only process likes
  IF NEW.action = 'like' THEN
    -- Check if the other user already liked this user
    IF EXISTS (
      SELECT 1 FROM swipes 
      WHERE swiper_id = NEW.swiped_id 
      AND swiped_id = NEW.swiper_id 
      AND action = 'like'
    ) THEN
      -- Determine user1 and user2 (user1 < user2 for consistency)
      IF NEW.swiper_id < NEW.swiped_id THEN
        match_user1 := NEW.swiper_id;
        match_user2 := NEW.swiped_id;
      ELSE
        match_user1 := NEW.swiped_id;
        match_user2 := NEW.swiper_id;
      END IF;
      
      -- Create the match (ignore if already exists)
      INSERT INTO matches (user1_id, user2_id)
      VALUES (match_user1, match_user2)
      ON CONFLICT (user1_id, user2_id) DO NOTHING;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create matches on mutual like
CREATE TRIGGER on_swipe_check_match
  AFTER INSERT ON swipes
  FOR EACH ROW
  EXECUTE FUNCTION check_and_create_match();

-- Function to get discovery profiles with scoring
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
    -- Calculate compatibility score
    (
      -- Platform overlap (2 points each)
      (SELECT COUNT(*) * 2 FROM unnest(p.platforms) AS plat WHERE plat = ANY(user_platforms))::INT +
      -- Genre overlap (1 point each)
      (SELECT COUNT(*) FROM unnest(p.favorite_genres) AS genre WHERE genre = ANY(user_genres))::INT +
      -- Same playstyle (3 points)
      CASE WHEN p.playstyle = user_playstyle THEN 3 ELSE 0 END +
      -- Same voice chat preference (2 points)
      CASE WHEN p.voice_chat = user_voice_chat THEN 2 ELSE 0 END
    ) AS compatibility_score
  FROM profiles p
  WHERE 
    -- Exclude self
    p.id != p_user_id
    -- Only active, non-banned, onboarded users
    AND p.is_active = true
    AND p.is_banned = false
    AND p.onboarding_completed = true
    -- Exclude already swiped users
    AND NOT EXISTS (
      SELECT 1 FROM swipes s 
      WHERE s.swiper_id = p_user_id AND s.swiped_id = p.id
    )
    -- Exclude already matched users
    AND NOT EXISTS (
      SELECT 1 FROM matches m 
      WHERE m.is_active = true
      AND ((m.user1_id = p_user_id AND m.user2_id = p.id) 
           OR (m.user1_id = p.id AND m.user2_id = p_user_id))
    )
    -- Exclude blocked users (both directions) - will be added in Phase 5
    -- Apply filters if provided
    AND (p_platforms IS NULL OR p.platforms && p_platforms)
    AND (p_genres IS NULL OR p.favorite_genres && p_genres)
    AND (p_playstyle IS NULL OR p.playstyle = p_playstyle)
    AND (p_voice_chat IS NULL OR p.voice_chat = p_voice_chat)
    AND (p_regions IS NULL OR p.region = ANY(p_regions))
  ORDER BY 
    compatibility_score DESC,
    RANDOM() -- Randomize within same score
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
