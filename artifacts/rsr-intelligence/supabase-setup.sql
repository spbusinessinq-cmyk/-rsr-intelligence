-- RSR Intelligence Network — Supabase Database Schema
-- Run this in the Supabase SQL Editor: https://supabase.com/dashboard/project/YOUR_PROJECT/sql

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  handle TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'ANALYST',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CHANNELS TABLE
CREATE TABLE IF NOT EXISTS room_channels (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_private BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. MESSAGES TABLE
CREATE TABLE IF NOT EXISTS room_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id TEXT NOT NULL REFERENCES room_channels(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  handle TEXT NOT NULL,
  role TEXT,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. SEED CHANNELS
INSERT INTO room_channels (id, slug, name, description) VALUES
  ('general',         'general',         'general',         'General coordination'),
  ('investigations',  'investigations',  'investigations',  'Active investigation threads'),
  ('west-coast-case', 'west-coast-case', 'west-coast-case', 'West Coast operation'),
  ('signals',         'signals',         'signals',         'Signal monitoring and alerts'),
  ('off-grid',        'off-grid',        'off-grid',        'Off-network discussions')
ON CONFLICT (id) DO NOTHING;

-- 5. ROW LEVEL SECURITY
ALTER TABLE room_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_channels ENABLE ROW LEVEL SECURITY;

-- 6. RLS POLICIES

-- Messages: authenticated users can read all, insert their own
DROP POLICY IF EXISTS "Authenticated can read messages" ON room_messages;
CREATE POLICY "Authenticated can read messages"
  ON room_messages FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Authenticated can insert messages" ON room_messages;
CREATE POLICY "Authenticated can insert messages"
  ON room_messages FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Profiles: authenticated users can read all, manage their own
DROP POLICY IF EXISTS "Authenticated can read profiles" ON profiles;
CREATE POLICY "Authenticated can read profiles"
  ON profiles FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Users manage own profile" ON profiles;
CREATE POLICY "Users manage own profile"
  ON profiles FOR ALL TO authenticated
  USING (auth.uid() = id);

-- Channels: authenticated users can read
DROP POLICY IF EXISTS "Anyone can read channels" ON room_channels;
CREATE POLICY "Anyone can read channels"
  ON room_channels FOR SELECT TO authenticated USING (true);

-- 7. ENABLE REALTIME on room_messages
-- In Supabase Dashboard: Database → Replication → enable supabase_realtime for room_messages
-- Or run:
ALTER PUBLICATION supabase_realtime ADD TABLE room_messages;
