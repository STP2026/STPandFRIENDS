-- Add vaccination_passport column to dogs table
ALTER TABLE public.dogs ADD COLUMN vaccination_passport TEXT;

-- Update the dogs_public view to include vaccination_passport
DROP VIEW IF EXISTS public.dogs_public;

CREATE VIEW public.dogs_public WITH (security_invoker = on) AS
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
  p.display_name AS reporter_name
FROM public.dogs d
LEFT JOIN public.profiles p ON d.reported_by = p.user_id;