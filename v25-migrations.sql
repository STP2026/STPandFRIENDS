-- ============================================================
-- v25 Migrations
-- REIHENFOLGE: SQL ZUERST ausführen, dann Code deployen
-- ============================================================

-- 1) Multi-Foto: 2 zusätzliche Foto-Spalten in dogs
ALTER TABLE dogs
  ADD COLUMN IF NOT EXISTS photo_url_2 text,
  ADD COLUMN IF NOT EXISTS photo_url_3 text;

-- 2) dogs_public View neu erstellen (mit photo_url_2 + photo_url_3)
-- HINWEIS: Diese View wird komplett ersetzt
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
  -- reporter_name aus profiles (maskiert reported_by UUID)
  p.display_name AS reporter_name
FROM dogs d
LEFT JOIN profiles p ON p.id = d.reported_by;

