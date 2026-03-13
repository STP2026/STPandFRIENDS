-- ============================================================
-- v27b Security Fix: stray + vaccination_wish nur für Helper/Admin
-- ZUERST SQL ausführen, dann Code deployen
-- ============================================================

-- Hilfsfunktion: prüft ob der aktuelle User Helper oder Admin ist
-- (wird in den RLS-Policies verwendet)
CREATE OR REPLACE FUNCTION public.is_helper_or_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    -- Admin oder Moderator via user_roles
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role IN ('admin', 'moderator')
  )
  OR EXISTS (
    -- Approved helper via helper_applications
    SELECT 1 FROM public.helper_applications
    WHERE user_id = auth.uid()
      AND status = 'approved'
  );
$$;

-- ============================================================
-- dogs_public View: report_type-basierte Sichtbarkeit
-- ============================================================
-- Bisherige Logik (falsch): alle approved Dogs für alle Auth-User
-- Neue Logik:
--   save            → alle eingeloggten User (nach Admin-Freigabe)
--   stray           → nur Helper/Admin
--   vaccination_wish → nur Helper/Admin
--   sos             → nur Helper/Admin

DROP VIEW IF EXISTS dogs_public;

CREATE VIEW dogs_public
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
  p.display_name AS reporter_name
FROM dogs d
LEFT JOIN profiles p ON p.id = d.reported_by
WHERE
  -- 'save': nur wenn approved, für alle eingeloggten User
  (d.report_type = 'save' AND d.is_approved = true AND auth.uid() IS NOT NULL)
  OR
  -- 'stray', 'vaccination_wish', 'sos': nur Helper/Admin
  (d.report_type IN ('stray', 'vaccination_wish', 'sos') AND public.is_helper_or_admin());

