import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Called by Supabase Database Webhook when a row in helper_applications is UPDATED
// and the new status is 'approved'.
//
// Setup: Supabase Dashboard → Database → Webhooks → Create new webhook
//   Table: helper_applications | Event: UPDATE
//   URL: https://<project-ref>.supabase.co/functions/v1/notify-helper-approved
//   HTTP Headers: Authorization: Bearer <SUPABASE_ANON_KEY>

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FROM_EMAIL     = Deno.env.get("RESEND_FROM_EMAIL");
const APP_URL        = Deno.env.get("APP_URL") ?? "https://help.save-the-paws.com";

serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const payload = await req.json();

    // Supabase webhook: { type, table, record, old_record, schema }
    const record     = payload?.record;
    const oldRecord  = payload?.old_record;

    if (!record) {
      return new Response("No record in payload", { status: 400 });
    }

    // Only act when status just changed TO 'approved'
    if (record.status !== "approved" || oldRecord?.status === "approved") {
      return new Response(JSON.stringify({ skipped: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { user_id } = record;

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey  = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Fetch applicant details from auth.users
    let applicantEmail = "";
    let applicantName  = "Helfer";

    try {
      const userRes = await fetch(
        `${supabaseUrl}/auth/v1/admin/users/${user_id}`,
        {
          headers: {
            "apikey": serviceKey,
            "Authorization": `Bearer ${serviceKey}`,
          },
        }
      );
      if (userRes.ok) {
        const userData = await userRes.json();
        applicantEmail = userData.email ?? "";
        applicantName  =
          userData.user_metadata?.display_name ??
          userData.email?.split("@")[0] ??
          "Helfer";
      }
    } catch (e) {
      console.warn("Could not fetch user details:", e);
    }

    if (!applicantEmail) {
      console.error("No email found for user_id:", user_id);
      return new Response("No applicant email", { status: 400 });
    }

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #d97740; padding: 24px; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 22px;">
            🐾 Willkommen im Team, ${applicantName}!
          </h1>
        </div>

        <div style="background: #fff; padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
          <p style="font-size: 16px; color: #374151; line-height: 1.6;">
            Deine Bewerbung als Helfer bei <strong>Save The Paws</strong> wurde genehmigt. 🎉
          </p>

          <p style="font-size: 15px; color: #374151; line-height: 1.6;">
            Du hast jetzt Zugang zu erweiterten Funktionen in der App:
          </p>

          <ul style="font-size: 15px; color: #374151; line-height: 1.8; padding-left: 20px;">
            <li>Ausstehende und Attention-Meldungen einsehen</li>
            <li>Hunde-Daten bearbeiten und Bemerkungen hinzufügen</li>
            <li>Team-Nachrichten lesen und schreiben</li>
            <li>Rehab-Spots und Einrichtungen verwalten</li>
          </ul>

          <div style="margin-top: 28px; text-align: center;">
            <a
              href="${APP_URL}"
              style="display: inline-block; background: #d97740; color: white; padding: 12px 28px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 15px;"
            >
              Zur App →
            </a>
          </div>

          <p style="margin-top: 24px; font-size: 13px; color: #6b7280; line-height: 1.6;">
            Bei Fragen kannst du uns jederzeit über WhatsApp oder die App kontaktieren.<br/>
            Wir freuen uns auf die Zusammenarbeit! 🐕
          </p>

          <p style="margin-top: 16px; font-size: 12px; color: #9ca3af; text-align: center;">
            Save The Paws – Taghazout, Morocco
          </p>
        </div>
      </div>
    `;

    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to:   [applicantEmail],
        subject: `🐾 Du wurdest als Helfer bei Save The Paws akzeptiert!`,
        html: emailHtml,
      }),
    });

    if (!resendRes.ok) {
      const err = await resendRes.text();
      console.error("Resend error:", err);
      return new Response(`Resend error: ${err}`, { status: 500 });
    }

    console.log(`✅ Approval notification sent to ${applicantEmail}`);
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("Edge function error:", err);
    return new Response(`Error: ${err}`, { status: 500 });
  }
});
