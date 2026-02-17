-- Drop and recreate the dogs_public view with security_invoker enabled
DROP VIEW IF EXISTS public.dogs_public;

CREATE VIEW public.dogs_public
WITH (security_invoker=on) AS
SELECT 
    d.id,
    d.name,
    d.ear_tag,
    d.photo_url,
    d.latitude,
    d.longitude,
    d.location,
    d.is_vaccinated,
    d.vaccination1_date,
    d.vaccination2_date,
    d.vaccination_passport,
    d.additional_info,
    d.is_approved,
    d.report_type,
    d.urgency_level,
    d.created_at,
    d.updated_at,
    d.sponsor_name,
    p.display_name AS reporter_name
FROM public.dogs d
LEFT JOIN public.profiles p ON d.reported_by = p.user_id;