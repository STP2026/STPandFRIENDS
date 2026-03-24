-- ============================================================
-- v85: Eigene Meldungen für registrierte User sichtbar
-- + JOIN-Fix in dogs_public (p.user_id statt p.id)
-- + Gast-Fotos in guest_reports speichern
-- ============================================================

-- 1. dogs_public View neu erstellen
DROP VIEW IF EXISTS public.dogs_public;

CREATE VIEW public.dogs_public
WITH (security_invoker = true)
AS
SELECT
  d.id,
  d.name,
  d.ear_tag,
  d.photo_url,
  d.photo_url_2,
  d.photo_url_3,
  d.latitude,
  d.longitude,
  d.location,
  d.is_vaccinated,
  d.vaccination1_date,
  d.vaccination2_date,
  d.vaccination_passport,
  d.additional_info,
  d.is_approved,
  d.created_at,
  d.updated_at,
  d.report_type,
  d.urgency_level,
  d.sponsor_name,
  d.caretaker,
  d.reported_by,
  p.display_name AS reporter_name
FROM public.dogs d
LEFT JOIN public.profiles p ON p.user_id = d.reported_by  -- FIXED: was p.id
WHERE
  -- Eigene Meldungen: jeder eingeloggte User sieht seine eigenen (egal ob approved)
  (d.reported_by = auth.uid())
  OR
  -- 'save': approved + eingeloggt
  (d.report_type = 'save' AND d.is_approved = true AND auth.uid() IS NOT NULL)
  OR
  -- 'stray', 'vaccination_wish', 'sos': nur Helper/Admin
  (d.report_type IN ('stray', 'vaccination_wish', 'sos') AND public.is_helper_or_admin());

-- 2. guest_reports: TEXT-Spalten für base64-Fotos (falls noch nicht vorhanden)
ALTER TABLE public.guest_reports
  ALTER COLUMN photo_url TYPE TEXT,
  ALTER COLUMN photo_url_2 TYPE TEXT,
  ALTER COLUMN photo_url_3 TYPE TEXT;
