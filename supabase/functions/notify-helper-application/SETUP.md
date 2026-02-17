# E-Mail-Benachrichtigung für Helfer-Bewerbungen

Wenn jemand eine Helfer-Bewerbung abschickt, bekommst du automatisch eine E-Mail.
Der DB-Eintrag in `helper_applications` bleibt erhalten – du kannst weiterhin im Admin-Dashboard genehmigen/ablehnen.

---

## Architektur

```
Nutzer füllt BecomeHelperPage aus
        ↓
Eintrag in helper_applications (Supabase DB)
        ↓
Supabase Database Webhook (INSERT trigger)
        ↓
Edge Function: notify-helper-application
        ↓
Resend API → E-Mail an dich
```

---

## Einrichtung (einmalig, ~10 Minuten)

### Schritt 1 – Resend vorbereiten

1. [resend.com](https://resend.com) → Login
2. **API Keys** → neuen Key erstellen → kopieren
3. **Domains** → deine Domain verifizieren (oder `onboarding@resend.dev` für Tests nutzen)

### Schritt 2 – Edge Function deployen

```bash
# Supabase CLI installieren (falls noch nicht vorhanden)
npm install -g supabase

# Login
supabase login

# Mit deinem Projekt verbinden
supabase link --project-ref acdwmmzaeuxuxldwjrpl

# Edge Function deployen
supabase functions deploy notify-helper-application

# Secrets setzen (EINMALIG, werden sicher in Supabase gespeichert)
supabase secrets set RESEND_API_KEY=re_dein_key_hier
supabase secrets set ADMIN_NOTIFY_EMAIL=deine@email.com
supabase secrets set RESEND_FROM_EMAIL=noreply@deinedomain.com
```

> **Hinweis:** `SUPABASE_URL` und `SUPABASE_SERVICE_ROLE_KEY` werden von Supabase automatisch in Edge Functions injiziert – du musst diese nicht manuell setzen.

### Schritt 3 – Database Webhook einrichten

Im Supabase Dashboard:

1. **Database → Webhooks** → „Create a new hook"
2. Einstellungen:
   ```
   Name:    notify-on-helper-application
   Table:   helper_applications
   Events:  ✅ Insert
   Type:    Supabase Edge Functions
   Function: notify-helper-application
   ```
3. Speichern

### Schritt 4 – Testen

1. Öffne die App als normaler (nicht-Admin) eingeloggter Nutzer
2. Gehe zu `/become-helper` und schick eine Test-Bewerbung ab
3. Du solltest innerhalb weniger Sekunden eine E-Mail erhalten
4. Im Admin-Dashboard siehst du die Bewerbung weiterhin unter dem „Helfer"-Tab

---

## Fehlersuche

**Keine E-Mail erhalten?**
```bash
# Edge Function Logs ansehen
supabase functions logs notify-helper-application
```

**Webhook nicht gefeuert?**
→ Supabase Dashboard → Database → Webhooks → prüfe ob der Hook aktiv ist

**Resend-Fehler?**
→ Prüfe ob `RESEND_API_KEY` korrekt gesetzt ist:
```bash
supabase secrets list
```

---

## E-Mail-Vorschau

Die E-Mail enthält:
- Name und E-Mail-Adresse des Bewerbers
- Datum und Uhrzeit der Bewerbung
- Den vollständigen Bewerbungstext
- Direktlink zum Admin-Dashboard
