-- v100: Absender-Pflicht (Name + E-Mail) + echter Meldezeitpunkt
-- Bereits manuell im SQL Editor ausgeführt (09/2026) — Datei dient der
-- Migrations-Historie. Idempotent (IF NOT EXISTS), gefahrlos wiederholbar.

ALTER TABLE public.guest_reports
  ADD COLUMN IF NOT EXISTS reporter_email TEXT,
  ADD COLUMN IF NOT EXISTS reported_at TIMESTAMPTZ DEFAULT now();

ALTER TABLE public.dogs
  ADD COLUMN IF NOT EXISTS reporter_email TEXT,
  ADD COLUMN IF NOT EXISTS reported_at TIMESTAMPTZ DEFAULT now();

-- Bewusst KEIN NOT NULL: Bestandsdaten und alte Offline-Queues haben keine
-- Absenderdaten. Die Pflicht wird auf App-Ebene (Formular-Validierung) erzwungen.
--
-- SICHERHEIT: reporter_email NIEMALS in die dogs_public-View aufnehmen.
-- Die View nutzt eine explizite Spaltenliste — neue Spalten bleiben
-- automatisch draußen, solange sie nicht explizit ergänzt werden.
