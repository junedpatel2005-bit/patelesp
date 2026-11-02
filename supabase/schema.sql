-- ==============================================================================
-- PATELESP - Free Fire Esports Tournament Platform
-- Supabase PostgreSQL Database Schema
--
-- How to apply:
-- 1. Open: https://supabase.com/dashboard/project/qintzlgeicjemcprkwtl/sql/new
-- 2. Paste this entire script into the query editor
-- 3. Click "RUN" (or Ctrl + Enter)
-- ==============================================================================

-- 1. TOURNAMENT CONFIG TABLE
CREATE TABLE IF NOT EXISTS public.tournaments (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  tagline TEXT NOT NULL,
  game TEXT NOT NULL,
  map TEXT NOT NULL,
  mode TEXT NOT NULL,
  entry_fee INTEGER NOT NULL DEFAULT 50,
  first_prize INTEGER NOT NULL DEFAULT 1000,
  second_prize INTEGER NOT NULL DEFAULT 500,
  per_kill_prize INTEGER NOT NULL DEFAULT 0,
  total_prize_pool INTEGER NOT NULL DEFAULT 1500,
  max_slots INTEGER NOT NULL DEFAULT 48,
  match_date TEXT NOT NULL,
  match_time TEXT NOT NULL,
  upi_id TEXT NOT NULL,
  upi_name TEXT NOT NULL,
  room_id TEXT DEFAULT '',
  room_password TEXT DEFAULT '',
  room_announced BOOLEAN NOT NULL DEFAULT FALSE,
  rules JSONB NOT NULL DEFAULT '[]'::jsonb,
  contact_number TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. TEAMS / SQUAD REGISTRATIONS TABLE
CREATE TABLE IF NOT EXISTS public.teams (
  id TEXT PRIMARY KEY, -- e.g. "PTL-8841"
  team_name TEXT NOT NULL,
  captain_phone TEXT NOT NULL,
  captain_email TEXT,
  players JSONB NOT NULL,
  substitute_player JSONB,
  utr_number TEXT NOT NULL,
  entry_fee_paid INTEGER NOT NULL DEFAULT 50,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  status TEXT NOT NULL DEFAULT 'pending',
  slot_number INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Index for searching tickets fast by ID or Captain phone
CREATE INDEX IF NOT EXISTS idx_teams_captain_phone ON public.teams (captain_phone);
CREATE INDEX IF NOT EXISTS idx_teams_status ON public.teams (status);
CREATE INDEX IF NOT EXISTS idx_teams_created_at ON public.teams (created_at DESC);

-- 3. ADMIN NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.admin_notifications (
  id TEXT PRIMARY KEY,
  team_id TEXT NOT NULL,
  team_name TEXT NOT NULL,
  captain_phone TEXT NOT NULL,
  utr_number TEXT NOT NULL,
  amount INTEGER NOT NULL DEFAULT 50,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.admin_notifications (read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.admin_notifications (created_at DESC);

-- ==============================================================================
-- 4. ENABLE ROW LEVEL SECURITY (RLS) & FULL ACCESS POLICIES
-- ==============================================================================
ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "App full access tournaments" ON public.tournaments;
CREATE POLICY "App full access tournaments"
  ON public.tournaments FOR ALL
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "App full access teams" ON public.teams;
CREATE POLICY "App full access teams"
  ON public.teams FOR ALL
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "App full access notifications" ON public.admin_notifications;
CREATE POLICY "App full access notifications"
  ON public.admin_notifications FOR ALL
  USING (true)
  WITH CHECK (true);

-- ==============================================================================
-- 5. INITIAL SEED DATA (Uses jsonb_build_array to avoid newline character errors)
-- ==============================================================================
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
  'India''s Ultimate Free Fire Battle Royale Arena',
  'Free Fire Max / Free Fire',
  'Bermuda',
  'Squad Battle Royale (4 Players)',
  50,
  1000,
  500,
  0,
  1500,
  48,
  '2026-11-08',
  '08:30 PM IST',
  'patelesp@upi',
  'Patel Esports Arena',
  '',
  '',
  FALSE,
  jsonb_build_array(
    'Squad must strictly consist of the 4 registered players. No sudden substitutes without admin notice.',
    'Mobile players only. PC / Emulators are strictly prohibited and will be kicked from the custom room.',
    'Custom Room ID and Password will appear exclusively on your Team Ticket page 15 minutes prior to match time.',
    'Teaming up with enemy squads, third-party gfx tools, or hacking will result in an immediate ban with zero refund.',
    'Prize money (1st: ₹1,000, 2nd: ₹500) will be transferred instantly via UPI after final score verification.',
    'The winning captain must take a clear screenshot of the final Booyah scoreboard.'
  ),
  '+91 98765 43210'
) ON CONFLICT (id) DO NOTHING;


-- ==============================================================================
-- 5. MIGRATIONS FOR PAYMENT & UPI EXPANSIONS
-- Run these safe idempotent statements to add payment tracking columns
-- ==============================================================================
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS payment_status TEXT NOT NULL DEFAULT 'unpaid';
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS entry_fee_paid INTEGER NOT NULL DEFAULT 100;
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS utr_number TEXT DEFAULT '';
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS payment_time TIMESTAMPTZ;
ALTER TABLE public.tournaments ADD COLUMN IF NOT EXISTS upi_id TEXT DEFAULT '9054358668@ybl';
ALTER TABLE public.tournaments ADD COLUMN IF NOT EXISTS upi_name TEXT DEFAULT 'Juned Rafik Patel';
