import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const mailtrapToken = Deno.env.get("MAILTRAP_API_TOKEN");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  type: "assignment" | "status_change" | "escalation" | "closure" | "comment";
  ticketNumber: string;
  ticketTitle: string;
  recipientEmail: string;
  recipientName?: string;
  assigneeName?: string;
  oldStatus?: string;
  newStatus?: string;
  studioName?: string;
  priority?: string;
  category?: string;
  escalationReason?: string;
  ticketUrl?: string;
}

const getEmailContent = (data: NotificationRequest) => {
  const baseUrl = "https://brumbzbtvqkslzhlpsxh.lovable.app";
  const ticketUrl = data.ticketUrl || `${baseUrl}/tickets`;
  
  switch (data.type) {
    case "assignment":
      return {
        subject: `🎫 New Ticket Assigned: ${data.ticketNumber} - ${data.ticketTitle}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f4f4f5; margin: 0; padding: 20px; }
              .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
              .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 24px; text-align: center; }
              .header h1 { margin: 0; font-size: 24px; }
              .content { padding: 24px; }
              .ticket-info { background: #f9fafb; border-radius: 8px; padding: 16px; margin: 16px 0; }
              .ticket-info p { margin: 8px 0; color: #374151; }
              .label { font-weight: 600; color: #6b7280; }
              .priority-critical { color: #dc2626; font-weight: bold; }
              .priority-high { color: #ea580c; font-weight: bold; }
              .priority-medium { color: #ca8a04; }
              .priority-low { color: #16a34a; }
              .btn { display: inline-block; background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin-top: 16px; }
              .footer { padding: 16px 24px; background: #f9fafb; text-align: center; color: #6b7280; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎫 New Ticket Assignment</h1>
              </div>
              <div class="content">
                <p>Hi ${data.recipientName || 'there'},</p>
                <p>A new ticket has been assigned to you and requires your attention.</p>
                <div class="ticket-info">
                  <p><span class="label">Ticket Number:</span> ${data.ticketNumber}</p>
                  <p><span class="label">Title:</span> ${data.ticketTitle}</p>
                  <p><span class="label">Priority:</span> <span class="priority-${data.priority}">${data.priority?.toUpperCase()}</span></p>
                  <p><span class="label">Category:</span> ${data.category || 'N/A'}</p>
                  <p><span class="label">Studio:</span> ${data.studioName || 'N/A'}</p>
                </div>
                <a href="${ticketUrl}" class="btn">View Ticket</a>
              </div>
              <div class="footer">
                <p>Physique 57 Ticket System • Do not reply to this email</p>
              </div>
            </div>
          </body>
          </html>
        `,
      };

    case "escalation":
      return {
        subject: `🚨 ESCALATION: ${data.ticketNumber} - ${data.ticketTitle}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f4f4f5; margin: 0; padding: 20px; }
              .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
              .header { background: linear-gradient(135deg, #dc2626 0%, #ea580c 100%); color: white; padding: 24px; text-align: center; }
              .header h1 { margin: 0; font-size: 24px; }
              .content { padding: 24px; }
              .alert-box { background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px; margin: 16px 0; }
              .ticket-info { background: #f9fafb; border-radius: 8px; padding: 16px; margin: 16px 0; }
              .ticket-info p { margin: 8px 0; color: #374151; }
              .label { font-weight: 600; color: #6b7280; }
              .btn { display: inline-block; background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin-top: 16px; }
              .footer { padding: 16px 24px; background: #f9fafb; text-align: center; color: #6b7280; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🚨 Ticket Escalation Alert</h1>
              </div>
              <div class="content">
                <p>Hi ${data.recipientName || 'Manager'},</p>
                <div class="alert-box">
                  <strong>⚠️ This ticket has been automatically escalated and requires immediate attention.</strong>
                  <p><strong>Reason:</strong> ${data.escalationReason || 'Priority ticket unassigned or unresolved past SLA'}</p>
                </div>
                <div class="ticket-info">
                  <p><span class="label">Ticket Number:</span> ${data.ticketNumber}</p>
                  <p><span class="label">Title:</span> ${data.ticketTitle}</p>
                  <p><span class="label">Priority:</span> <span style="color: #dc2626; font-weight: bold;">${data.priority?.toUpperCase()}</span></p>
                  <p><span class="label">Studio:</span> ${data.studioName || 'N/A'}</p>
                </div>
                <a href="${ticketUrl}" class="btn">Take Action Now</a>
              </div>
              <div class="footer">
                <p>Physique 57 Ticket System • Escalation Alert</p>
              </div>
            </div>
          </body>
          </html>
        `,
      };

    case "status_change":
      return {
        subject: `📋 Ticket Update: ${data.ticketNumber} - Status Changed to ${data.newStatus}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f4f4f5; margin: 0; padding: 20px; }
              .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; }
              .header { background: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%); color: white; padding: 24px; text-align: center; }
              .content { padding: 24px; }
              .status-change { display: flex; align-items: center; justify-content: center; gap: 16px; margin: 20px 0; }
              .status-badge { padding: 8px 16px; border-radius: 20px; font-weight: 600; }
              .old-status { background: #e5e7eb; color: #374151; }
              .new-status { background: #dcfce7; color: #166534; }
              .btn { display: inline-block; background: #0ea5e9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; }
              .footer { padding: 16px 24px; background: #f9fafb; text-align: center; color: #6b7280; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>📋 Ticket Status Update</h1>
              </div>
              <div class="content">
                <p>The status of ticket <strong>${data.ticketNumber}</strong> has been updated.</p>
                <p><strong>${data.ticketTitle}</strong></p>
                <div class="status-change">
                  <span class="status-badge old-status">${data.oldStatus}</span>
                  <span>→</span>
                  <span class="status-badge new-status">${data.newStatus}</span>
                </div>
                <a href="${ticketUrl}" class="btn">View Ticket</a>
              </div>
              <div class="footer">
                <p>Physique 57 Ticket System</p>
              </div>
            </div>
          </body>
          </html>
        `,
      };

    case "closure":
      return {
        subject: `✅ Ticket Resolved: ${data.ticketNumber} - ${data.ticketTitle}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f4f4f5; margin: 0; padding: 20px; }
              .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; }
              .header { background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: white; padding: 24px; text-align: center; }
              .content { padding: 24px; text-align: center; }
              .checkmark { font-size: 48px; margin: 20px 0; }
              .btn { display: inline-block; background: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; }
              .footer { padding: 16px 24px; background: #f9fafb; text-align: center; color: #6b7280; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>✅ Ticket Resolved</h1>
              </div>
              <div class="content">
                <div class="checkmark">✓</div>
                <p>Ticket <strong>${data.ticketNumber}</strong> has been resolved and closed.</p>
                <p><strong>${data.ticketTitle}</strong></p>
                <p style="color: #6b7280; margin-top: 20px;">Thank you for your patience.</p>
                <a href="${ticketUrl}" class="btn">View Details</a>
              </div>
              <div class="footer">
                <p>Physique 57 Ticket System</p>
              </div>
            </div>
          </body>
          </html>
        `,
      };

    default:
      return {
        subject: `Ticket Update: ${data.ticketNumber}`,
        html: `<p>Ticket ${data.ticketNumber} has been updated.</p>`,
      };
  }
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: NotificationRequest = await req.json();

    if (!mailtrapToken) {
      console.error("MAILTRAP_API_TOKEN not configured");
      throw new Error("Email service not configured");
    }

    const emailContent = getEmailContent(data);

    const response = await fetch("https://send.api.mailtrap.io/api/send", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${mailtrapToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: {
          email: "info@physique57india.com",
          name: "Physique 57 Support",
        },
        to: [
          {
            email: data.recipientEmail,
            name: data.recipientName || undefined,
          },
        ],
        subject: emailContent.subject,
        html: emailContent.html,
        category: `ticket-${data.type}`,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Mailtrap API error:", response.status, errorText);
      throw new Error(`Email send failed: ${response.status}`);
    }

    const result = await response.json();
    console.log("Email sent successfully:", result);

    return new Response(JSON.stringify({ success: true, messageId: result.message_ids?.[0] }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in send-ticket-notification:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
