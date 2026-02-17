-- ============================================================
-- Helper Application Email Notification
-- ============================================================
-- This migration documents the webhook setup.
-- The actual Supabase Database Webhook must be configured
-- manually in the Supabase Dashboard (see SETUP.md).
--
-- What this does:
--   When a row is INSERT-ed into helper_applications,
--   Supabase fires a POST request to the Edge Function
--   "notify-helper-application", which sends an email via Resend.
--
-- No SQL changes needed — the webhook is a Dashboard config.
-- This file serves as documentation in the migration history.
-- ============================================================

-- Optional: Add an index to speed up the admin query
-- (fetches all applications ordered by created_at)
CREATE INDEX IF NOT EXISTS idx_helper_applications_created_at
  ON public.helper_applications (created_at DESC);

-- Optional: Add an index for status filtering
CREATE INDEX IF NOT EXISTS idx_helper_applications_status
  ON public.helper_applications (status)
  WHERE status = 'pending';
