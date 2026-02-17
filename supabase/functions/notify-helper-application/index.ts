import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Called by Supabase Database Webhook when a row is inserted into helper_applications
// Setup: Supabase Dashboard → Database → Webhooks → Create new webhook
//   Table: helper_applications | Event: INSERT | URL: <your-function-url>

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const ADMIN_EMAIL    = Deno.env.get("ADMIN_NOTIFY_EMAIL");   // e.g. you@example.com
const FROM_EMAIL     = Deno.env.get("RESEND_FROM_EMAIL");    // e.g. noreply@yourdomain.com

serve(async (req: Request) => {
  // Only allow POST from Supabase webhook
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const payload = await req.json();

    // Supabase webhook sends { type, table, record, old_record, schema }
    const record = payload?.record;

    if (!record) {
      return new Response("No record in payload", { status: 400 });
    }

    const { id, user_id, message, created_at } = record;

    // Fetch the applicant's email from auth.users via service role
    // (The webhook payload only has the helper_applications row)
    const supabaseUrl  = Deno.env.get("SUPABASE_URL")!;
    const serviceKey   = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    let applicantEmail = "unbekannt";
    let applicantName  = "Unbekannt";

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
        applicantEmail = userData.email ?? "unbekannt";
        applicantName  =
          userData.user_metadata?.display_name ??
          userData.email?.split("@")[0] ??
          "Unbekannt";
      }
    } catch (e) {
      console.warn("Could not fetch user details:", e);
    }

    const formattedDate = new Date(created_at).toLocaleString("de-DE", {
      timeZone: "Europe/Berlin",
      dateStyle: "full",
      timeStyle: "short",
    });

    // Build the notification email
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #d97740; padding: 24px; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 22px;">
            🐾 Neue Helfer-Bewerbung
          </h1>
        </div>

        <div style="background: #fff; padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #6b7280; width: 140px; font-size: 14px;">Name</td>
              <td style="padding: 8px 0; font-weight: 600; font-size: 14px;">${applicantName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">E-Mail</td>
              <td style="padding: 8px 0; font-size: 14px;">
                <a href="mailto:${applicantEmail}" style="color: #d97740;">${applicantEmail}</a>
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Eingegangen am</td>
              <td style="padding: 8px 0; font-size: 14px;">${formattedDate}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Bewerbungs-ID</td>
              <td style="padding: 8px 0; font-size: 12px; color: #9ca3af; font-family: monospace;">${id}</td>
            </tr>
          </table>

          <hr style="border: none; border-top: 1px solid #f3f4f6; margin: 20px 0;" />

          <h2 style="font-size: 16px; color: #374151; margin: 0 0 12px 0;">Nachricht der Bewerberin / des Bewerbers:</h2>
          <div style="background: #f9fafb; border-left: 3px solid #d97740; padding: 16px; border-radius: 4px; font-size: 15px; line-height: 1.6; color: #374151; white-space: pre-wrap;">${message}</div>

          <div style="margin-top: 28px; text-align: center;">
            <a
              href="${supabaseUrl.replace(".supabase.co", "")}/admin"
              style="display: inline-block; background: #d97740; color: white; padding: 12px 28px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 15px;"
            >
              Im Dashboard öffnen →
            </a>
          </div>

          <p style="margin-top: 24px; font-size: 12px; color: #9ca3af; text-align: center;">
            Save The Paws – Taghazout, Morocco
          </p>
        </div>
      </div>
    `;

    // Send via Resend
    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to:   [ADMIN_EMAIL],
        subject: `🐾 Neue Helfer-Bewerbung von ${applicantName}`,
        html: emailHtml,
      }),
    });

    if (!resendRes.ok) {
      const err = await resendRes.text();
      console.error("Resend error:", err);
      return new Response(`Resend error: ${err}`, { status: 500 });
    }

    console.log(`✅ Notification sent for application ${id} from ${applicantEmail}`);
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("Edge function error:", err);
    return new Response(`Error: ${err}`, { status: 500 });
  }
});
