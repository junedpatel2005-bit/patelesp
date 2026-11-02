-- ==============================================================================
-- PATELESP - Free Fire Esports Tournament Platform
-- Supabase PostgreSQL Database Schema & PostgREST Schema Reload
--
-- How to apply:
-- 1. Go to your Supabase Dashboard -> SQL Editor
-- 2. Click "New Query"
-- 3. Paste this entire script
-- 4. Click "Run" (or Ctrl + Enter)
-- ==============================================================================

-- 1. TOURNAMENT CONFIG TABLE
CREATE TABLE IF NOT EXISTS public.tournaments (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL DEFAULT 'PATELESP FREE FIRE SQUAD SHOWDOWN',
  tagline TEXT NOT NULL DEFAULT 'Saturday',
  game TEXT NOT NULL DEFAULT 'Free Fire Max / Free Fire',
  map TEXT NOT NULL DEFAULT 'Bermuda',
  mode TEXT NOT NULL DEFAULT 'Squad Battle Royale (4 Players)',
  entry_fee INTEGER NOT NULL DEFAULT 40,
  first_prize INTEGER NOT NULL DEFAULT 180,
  second_prize INTEGER NOT NULL DEFAULT 100,
  per_kill_prize INTEGER NOT NULL DEFAULT 60,
  total_prize_pool INTEGER NOT NULL DEFAULT 340,
  max_slots INTEGER NOT NULL DEFAULT 48,
  match_date TEXT NOT NULL DEFAULT '07 November 2026',
  match_time TEXT NOT NULL DEFAULT '09:00 PM IST',
  upi_id TEXT NOT NULL DEFAULT 'junedpatel2005@okaxis',
  upi_name TEXT NOT NULL DEFAULT 'Juned Rafik Patel',
  room_id TEXT DEFAULT '',
  room_password TEXT DEFAULT '',
  room_announced BOOLEAN NOT NULL DEFAULT FALSE,
  rules JSONB NOT NULL DEFAULT '{}'::jsonb,
  contact_number TEXT NOT NULL DEFAULT '+918849596369',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. TEAMS / SQUAD REGISTRATIONS TABLE
CREATE TABLE IF NOT EXISTS public.teams (
  id TEXT PRIMARY KEY,
  team_name TEXT NOT NULL,
  captain_phone TEXT NOT NULL,
  captain_email TEXT,
  players JSONB NOT NULL,
  substitute_player JSONB,
  utr_number TEXT NOT NULL,
  entry_fee_paid INTEGER NOT NULL DEFAULT 40,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  status TEXT NOT NULL DEFAULT 'pending',
  slot_number INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_teams_captain_phone ON public.teams (captain_phone);
CREATE INDEX IF NOT EXISTS idx_teams_status ON public.teams (status);
CREATE INDEX IF NOT EXISTS idx_teams_slot_number ON public.teams (slot_number);
CREATE INDEX IF NOT EXISTS idx_teams_created_at ON public.teams (created_at DESC);

-- 3. ADMIN NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.admin_notifications (
  id TEXT PRIMARY KEY,
  team_id TEXT NOT NULL,
  team_name TEXT NOT NULL,
  captain_phone TEXT NOT NULL,
  utr_number TEXT NOT NULL,
  amount INTEGER NOT NULL DEFAULT 40,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.admin_notifications (read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.admin_notifications (created_at DESC);

-- 4. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

-- 5. CREATE FULL PERMISSIVE ACCESS POLICIES
DROP POLICY IF EXISTS "Public full access tournaments" ON public.tournaments;
CREATE POLICY "Public full access tournaments"
  ON public.tournaments FOR ALL
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access teams" ON public.teams;
CREATE POLICY "Public full access teams"
  ON public.teams FOR ALL
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access notifications" ON public.admin_notifications;
CREATE POLICY "Public full access notifications"
  ON public.admin_notifications FOR ALL
  USING (true)
  WITH CHECK (true);

-- 6. GRANT API ROLE PERMISSIONS (Required for PostgREST API)
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO anon, authenticated, service_role;

-- 7. SEED INITIAL TOURNAMENT RECORD
INSERT INTO public.tournaments (
  id,
  title,
  tagline,
  game,
  map,
  mode,
  entry_fee,
  first_prize,
  second_prize,
  per_kill_prize,
  total_prize_pool,
  max_slots,
  match_date,
  match_time,
  upi_id,
  upi_name,
  room_id,
  room_password,
  room_announced,
  rules,
  contact_number
) VALUES (
  'patel-ff-season-1',
  'PATELESP FREE FIRE SQUAD SHOWDOWN',
  'Saturday',
  'Free Fire Max / Free Fire',
  'Bermuda',
  'Squad Battle Royale (4 Players)',
  40,
  180,
  100,
  60,
  340,
  48,
  '07 November 2026',
  '09:00 PM IST',
  'junedpatel2005@okaxis',
  'Juned Rafik Patel',
  '',
  '',
  FALSE,
  '{"entryTime": "08:45 PM IST", "hidePointsTable": true, "whatsappGroupLink": "https://chat.whatsapp.com/invite"}'::jsonb,
  '+918849596369'
) ON CONFLICT (id) DO UPDATE SET
  entry_fee = EXCLUDED.entry_fee,
  first_prize = EXCLUDED.first_prize,
  second_prize = EXCLUDED.second_prize,
  per_kill_prize = EXCLUDED.per_kill_prize,
  total_prize_pool = EXCLUDED.total_prize_pool,
  updated_at = timezone('utc'::text, now());

-- 8. RELOAD POSTGREST SCHEMA CACHE (Fixes "Could not find table in schema cache")
NOTIFY pgrst, 'reload schema';
