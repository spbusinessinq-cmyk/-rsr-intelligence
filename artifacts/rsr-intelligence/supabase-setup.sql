-- ============================================================
-- RSR INTELLIGENCE NETWORK — SUPABASE SETUP
-- Run this entire file in the Supabase SQL Editor.
-- Safe to run multiple times — all statements are idempotent.
-- Dashboard: https://supabase.com/dashboard/project/YOUR_PROJECT/sql
-- ============================================================

-- ── 1. PROFILES TABLE ────────────────────────────────────────

CREATE TABLE IF NOT EXISTS profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email           TEXT NOT NULL,
  handle          TEXT NOT NULL,
  title           TEXT,
  role            TEXT NOT NULL DEFAULT 'member',
  requested_role  TEXT DEFAULT 'member',
  approval_status TEXT NOT NULL DEFAULT 'pending',
  account_status  TEXT NOT NULL DEFAULT 'active',
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Idempotent column additions for existing databases
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS title           TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS requested_role  TEXT DEFAULT 'member';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS account_status  TEXT NOT NULL DEFAULT 'active';

-- ── 2. CHANNELS TABLE ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS room_channels (
  id          TEXT PRIMARY KEY,
  slug        TEXT UNIQUE NOT NULL,
  name        TEXT NOT NULL,
  description TEXT,
  archived    BOOLEAN DEFAULT FALSE,
  is_private  BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Idempotent column addition for existing databases
ALTER TABLE room_channels ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT FALSE;

-- ── 3. MESSAGES TABLE ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS room_messages (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id TEXT NOT NULL,
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  handle     TEXT NOT NULL,
  role       TEXT,
  body       TEXT NOT NULL,
  pinned     BOOLEAN DEFAULT FALSE,
  edited_at  TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Idempotent column additions
ALTER TABLE room_messages ADD COLUMN IF NOT EXISTS pinned    BOOLEAN DEFAULT FALSE;
ALTER TABLE room_messages ADD COLUMN IF NOT EXISTS edited_at TIMESTAMPTZ;

-- Remove channel FK if it exists (allows messages before channels are seeded)
ALTER TABLE room_messages DROP CONSTRAINT IF EXISTS room_messages_channel_id_fkey;

-- ── 4. INVESTIGATION CASES TABLE ──────────────────────────────

CREATE TABLE IF NOT EXISTS investigation_cases (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ref         TEXT NOT NULL UNIQUE,
  name        TEXT NOT NULL,
  stage       TEXT NOT NULL DEFAULT 'NEW',
  priority    TEXT NOT NULL DEFAULT 'NORMAL',
  channel_id  TEXT,
  description TEXT,
  created_by  UUID,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Idempotent column additions for existing databases (covers older schema versions)
ALTER TABLE investigation_cases ADD COLUMN IF NOT EXISTS channel_id  TEXT;
ALTER TABLE investigation_cases ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE investigation_cases ADD COLUMN IF NOT EXISTS created_by  UUID;
ALTER TABLE investigation_cases ADD COLUMN IF NOT EXISTS updated_at  TIMESTAMPTZ DEFAULT NOW();

-- ── 5. ENABLE ROW LEVEL SECURITY ──────────────────────────────

ALTER TABLE profiles           ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_channels      ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_messages      ENABLE ROW LEVEL SECURITY;
ALTER TABLE investigation_cases ENABLE ROW LEVEL SECURITY;

-- ── 6. RLS POLICIES — PROFILES ────────────────────────────────

DROP POLICY IF EXISTS "Authenticated can read profiles"  ON profiles;
CREATE POLICY "Authenticated can read profiles"
  ON profiles FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Users manage own profile"         ON profiles;
CREATE POLICY "Users manage own profile"
  ON profiles FOR ALL TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can update any profile"    ON profiles;
CREATE POLICY "Admins can update any profile"
  ON profiles FOR UPDATE TO authenticated
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- ── 7. RLS POLICIES — CHANNELS ────────────────────────────────

DROP POLICY IF EXISTS "Authenticated can read channels"  ON room_channels;
CREATE POLICY "Authenticated can read channels"
  ON room_channels FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Anyone can read channels"         ON room_channels;

DROP POLICY IF EXISTS "Authenticated can insert channels" ON room_channels;
CREATE POLICY "Authenticated can insert channels"
  ON room_channels FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can manage channels"       ON room_channels;
CREATE POLICY "Admins can manage channels"
  ON room_channels FOR ALL TO authenticated
  USING  ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin')
  WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

DROP POLICY IF EXISTS "Admins can update channels"       ON room_channels;

-- ── 8. RLS POLICIES — MESSAGES ────────────────────────────────

DROP POLICY IF EXISTS "Authenticated can read messages"        ON room_messages;
CREATE POLICY "Authenticated can read messages"
  ON room_messages FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Authenticated can insert messages"      ON room_messages;
CREATE POLICY "Authenticated can insert messages"
  ON room_messages FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users and admins can update messages"   ON room_messages;
CREATE POLICY "Users and admins can update messages"
  ON room_messages FOR UPDATE TO authenticated
  USING (
    auth.uid() = user_id OR
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

DROP POLICY IF EXISTS "Users and admins can delete messages"   ON room_messages;
CREATE POLICY "Users and admins can delete messages"
  ON room_messages FOR DELETE TO authenticated
  USING (
    auth.uid() = user_id OR
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

-- ── 9. RLS POLICIES — CASES ───────────────────────────────────

DROP POLICY IF EXISTS "Authenticated can read cases"    ON investigation_cases;
CREATE POLICY "Authenticated can read cases"
  ON investigation_cases FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Admins can manage cases"         ON investigation_cases;
CREATE POLICY "Admins can manage cases"
  ON investigation_cases FOR ALL TO authenticated
  USING  ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin')
  WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- ── 10. SEED CHANNELS ─────────────────────────────────────────

INSERT INTO room_channels (id, slug, name, description) VALUES
  ('general',         'general',         'general',         'General coordination'),
  ('investigations',  'investigations',  'investigations',  'Active investigation threads'),
  ('west-coast-case', 'west-coast-case', 'west-coast-case', 'West Coast operation'),
  ('signals',         'signals',         'signals',         'Signal monitoring and alerts'),
  ('off-grid',        'off-grid',        'off-grid',        'Off-network discussions')
ON CONFLICT (id) DO NOTHING;

-- ── 11. SEED CASES ────────────────────────────────────────────

INSERT INTO investigation_cases (ref, name, stage, priority, channel_id, description) VALUES
  ('F-001', 'CLEARWATER',       'BUILDING',   'HIGH',   'investigations',  'Procurement chain investigation — five-layer structure'),
  ('F-003', 'INFLUENCE ARCH',   'REVIEW',     'HIGH',   'investigations',  'Cross-border influence architecture mapping'),
  ('F-009', 'NORTHERN GATEWAY', 'READY',      'NORMAL', 'west-coast-case', 'Beneficial ownership trace — Northern Bridge Consortium'),
  ('F-017', 'ALLIED MEDIA',     'MONITORING', 'HIGH',   'signals',         'Media network equity mapping — Eastern Europe'),
  ('F-019', 'LOBBYING MAP',     'BUILDING',   'NORMAL', 'investigations',  'Foreign-interest lobbying channel documentation'),
  ('D-004', 'MERIDIAN',         'REVIEW',     'HIGH',   'investigations',  'Asia-Pacific acquisition node analysis'),
  ('D-013', 'REGIONAL FUTURES', 'REVIEW',     'NORMAL', 'off-grid',        'Regional Futures Fund equity structure review'),
  ('F-018', 'BOND STRUCTURE',   'NEW',        'NORMAL', 'signals',         'Infrastructure bond capital flow analysis')
ON CONFLICT (ref) DO NOTHING;

-- ── 12. REALTIME ──────────────────────────────────────────────

-- Enable realtime on required tables
-- (If these fail with "already exists", that is fine — they are already enabled)
ALTER PUBLICATION supabase_realtime ADD TABLE room_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;

-- ── 13. ADMIN SETUP ───────────────────────────────────────────

-- After registering your account, run this to grant yourself admin access:
-- UPDATE profiles SET role = 'admin', approval_status = 'approved' WHERE email = 'your@email.com';

-- To approve the test analyst account:
-- UPDATE profiles SET approval_status = 'approved' WHERE handle = 'TEST-ANALYST';
