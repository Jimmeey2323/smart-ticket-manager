// Re-export from the integrations client for backwards compatibility
export { supabase } from "@/integrations/supabase/client";

export async function getAccessToken(): Promise<string | null> {
  try {
    const { supabase } = await import("@/integrations/supabase/client");
    const { data } = await supabase.auth.getSession();
    return data?.session?.access_token ?? null;
  } catch (err) {
    console.error('Error getting access token:', err);
    return null;
  }
}
