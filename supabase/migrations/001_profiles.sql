-- ============================================
-- Migration 001: Profiles Table
-- ============================================

-- Create profiles table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  pronouns TEXT,
  region TEXT NOT NULL,
  bio TEXT,
  platforms TEXT[] NOT NULL DEFAULT '{}',
  favorite_genres TEXT[] NOT NULL DEFAULT '{}',
  top_games TEXT[] NOT NULL DEFAULT '{}',
  playstyle TEXT CHECK (playstyle IN ('casual', 'competitive', 'both')),
  voice_chat BOOLEAN DEFAULT false,
  typical_play_times TEXT[] DEFAULT '{}',
  photo_urls TEXT[] DEFAULT '{}',
  photo_approved BOOLEAN DEFAULT false,
  show_online_status BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  is_banned BOOLEAN DEFAULT false,
  email_verified BOOLEAN DEFAULT false,
  onboarding_completed BOOLEAN DEFAULT false,
  last_active_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_profiles_region ON profiles(region);
CREATE INDEX idx_profiles_platforms ON profiles USING GIN(platforms);
CREATE INDEX idx_profiles_genres ON profiles USING GIN(favorite_genres);
CREATE INDEX idx_profiles_active ON profiles(is_active, is_banned, onboarding_completed);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Allow users to read active, non-banned profiles
CREATE POLICY "Public profiles are viewable by authenticated users"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (is_active = true AND is_banned = false);

-- Allow users to read their own profile regardless of status
CREATE POLICY "Users can view own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Allow users to insert their own profile
CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to handle new user signup
-- Creates a minimal profile entry when user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Don't auto-create profile - let onboarding handle it
  -- This function is here as a placeholder for future use
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup (optional - commented out for now)
-- CREATE TRIGGER on_auth_user_created
--   AFTER INSERT ON auth.users
--   FOR EACH ROW
--   EXECUTE FUNCTION handle_new_user();
