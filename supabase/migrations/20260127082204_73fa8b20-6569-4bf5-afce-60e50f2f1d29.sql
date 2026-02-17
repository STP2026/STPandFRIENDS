-- Create a public view for dogs that masks the reported_by UUID
-- and shows the reporter's display name instead
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
  d.additional_info,
  d.is_approved,
  d.created_at,
  d.updated_at,
  d.report_type,
  d.urgency_level,
  p.display_name AS reporter_name
FROM public.dogs d
LEFT JOIN public.profiles p ON d.reported_by = p.user_id;