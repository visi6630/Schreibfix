-- ================================================================
-- Migration 001: Admin role, API logs, Error logs
-- Run this in Supabase SQL editor
-- ================================================================

-- 1. Add admin + tracking columns to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS registered_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_seen TIMESTAMPTZ DEFAULT now();

-- 2. Populate email and registered_at from auth.users for existing users
UPDATE profiles p
SET email = u.email, registered_at = u.created_at
FROM auth.users u
WHERE p.id = u.id;

-- 3. Set the admin user
UPDATE profiles SET is_admin = true
WHERE id = (SELECT id FROM auth.users WHERE email = 'evisbakiu@evisbakiu.com');

-- 4. RLS: Admins can read all profiles (regular users can already read own row)
CREATE POLICY "Admins can read all profiles"
  ON profiles FOR SELECT
  USING (auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true));

-- 5. RLS: Admins can read all progress rows
CREATE POLICY "Admins can read all progress"
  ON progress FOR SELECT
  USING (auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true));

-- 6. RLS: Admins can read all weak_words rows
CREATE POLICY "Admins can read all weak_words"
  ON weak_words FOR SELECT
  USING (auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true));

-- 7. Create api_logs table
CREATE TABLE IF NOT EXISTS api_logs (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         UUID,
  api_type        TEXT NOT NULL CHECK (api_type IN ('elevenlabs', 'claude', 'internal')),
  endpoint        TEXT,
  tokens_used     INT DEFAULT 0,
  characters_used INT DEFAULT 0,
  cost_estimate   DECIMAL(10, 6) DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE api_logs ENABLE ROW LEVEL SECURITY;

-- Allow server-side inserts (no auth context on server)
CREATE POLICY "Allow all inserts on api_logs"
  ON api_logs FOR INSERT WITH CHECK (true);

-- Only admins can read logs
CREATE POLICY "Admins can read api_logs"
  ON api_logs FOR SELECT
  USING (auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true));

-- 8. Create error_logs table
CREATE TABLE IF NOT EXISTS error_logs (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       UUID,
  error_type    TEXT NOT NULL,
  error_message TEXT NOT NULL,
  page          TEXT,
  created_at    TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all inserts on error_logs"
  ON error_logs FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can read error_logs"
  ON error_logs FOR SELECT
  USING (auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true));
