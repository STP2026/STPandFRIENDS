-- ============================================================
-- v28 Security Fixes
-- 1. RLS-Policy für stray/vaccination_wish auf Helper/Admin beschränken
-- 2. dogs_public View mit korrekter WHERE-Klausel dokumentieren
-- ============================================================

-- ----------------------------------------------------------------
-- 1. RLS-Fix: stray + vaccination_wish nur für Helper/Admin
-- ----------------------------------------------------------------
-- Die alte Policy erlaubte allen eingeloggten Usern den direkten
-- Zugriff auf stray/vaccination_wish über die dogs-Basistabelle.
-- Das umgeht die dogs_public-View und den Frontend-Filter.

DROP POLICY IF EXISTS "Authenticated users can view approved strays" ON public.dogs;
DROP POLICY IF EXISTS "Approved strays visible to all" ON public.dogs;

CREATE POLICY "Only helpers can view strays and vaccination wishes"
ON public.dogs FOR SELECT
USING (
  report_type IN ('stray', 'vaccination_wish')
  AND public.is_helper_or_admin(auth.uid())
);

-- ----------------------------------------------------------------
-- 2. is_helper_or_admin() ohne Parameter (nutzt auth.uid() intern)
--    Wird von der View benötigt (security_invoker = on)
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_helper_or_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT public.is_helper_or_admin(auth.uid());
$$;

-- ----------------------------------------------------------------
-- 3. dogs_public View neu erstellen mit vollständiger Sicherheits-
--    Logik (report_type-basierte Sichtbarkeit + alle v25-Spalten)
-- ----------------------------------------------------------------
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
  p.display_name AS reporter_name
FROM public.dogs d
LEFT JOIN public.profiles p ON p.id = d.reported_by
WHERE
  -- 'save': nur wenn approved, für alle eingeloggten User
  (d.report_type = 'save' AND d.is_approved = true AND auth.uid() IS NOT NULL)
  OR
  -- 'stray', 'vaccination_wish', 'sos': nur Helper/Admin
  (d.report_type IN ('stray', 'vaccination_wish', 'sos') AND public.is_helper_or_admin());

