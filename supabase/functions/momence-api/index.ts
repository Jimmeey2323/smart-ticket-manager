import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const momenceToken = Deno.env.get("MOMENCE_API_TOKEN");
const MOMENCE_BASE_URL = "https://api.momence.com/api/v2/host";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface MomenceRequest {
  action: "searchMembers" | "getMemberSessions" | "getMemberMemberships" | "getSessions" | "getSessionDetails";
  query?: string;
  memberId?: number;
  sessionId?: number;
  page?: number;
  pageSize?: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!momenceToken) {
      console.error("MOMENCE_API_TOKEN not configured");
      throw new Error("Momence API not configured");
    }

    const { action, query, memberId, sessionId, page = 0, pageSize = 100 }: MomenceRequest = await req.json();
    
    const headers = {
      "accept": "application/json",
      "authorization": `Bearer ${momenceToken}`,
    };

    let url: string;
    let response: Response;

    switch (action) {
      case "searchMembers":
        // Search members by name/email/phone
        url = `${MOMENCE_BASE_URL}/members?page=${page}&pageSize=${pageSize}&sortOrder=DESC&sortBy=lastSeenAt&query=${encodeURIComponent(query || "")}`;
        console.log("Searching members with query:", query);
        response = await fetch(url, { headers });
        break;

      case "getMemberSessions":
        // Get recent sessions for a member
        if (!memberId) throw new Error("memberId is required");
        const currentDate = new Date().toISOString();
        url = `${MOMENCE_BASE_URL}/members/${memberId}/sessions?page=${page}&pageSize=${pageSize}&sortOrder=DESC&sortBy=startsAt&startBefore=${encodeURIComponent(currentDate)}&includeCancelled=false`;
        console.log("Getting sessions for member:", memberId);
        response = await fetch(url, { headers });
        break;

      case "getMemberMemberships":
        // Get active memberships for a member
        if (!memberId) throw new Error("memberId is required");
        url = `${MOMENCE_BASE_URL}/members/${memberId}/bought-memberships/active?page=${page}&pageSize=200`;
        console.log("Getting memberships for member:", memberId);
        response = await fetch(url, { headers });
        break;

      case "getSessions":
        // Get all sessions (for class dropdown)
        url = `${MOMENCE_BASE_URL}/sessions?page=${page}&pageSize=${pageSize}&sortOrder=DESC&sortBy=startsAt&includeCancelled=false&types=`;
        console.log("Getting all sessions");
        response = await fetch(url, { headers });
        break;

      case "getSessionDetails":
        // Get specific session details
        if (!sessionId) throw new Error("sessionId is required");
        url = `${MOMENCE_BASE_URL}/sessions/${sessionId}`;
        console.log("Getting session details:", sessionId);
        response = await fetch(url, { headers });
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Momence API error:", response.status, errorText);
      throw new Error(`Momence API error: ${response.status}`);
    }

    const data = await response.json();
    console.log(`${action} successful, returned ${data.payload?.length || 1} items`);

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in momence-api:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
