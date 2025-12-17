import { useState, useEffect } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithProvider = async (provider: string) => {
    await supabase.auth.signInWithOAuth({ 
      provider: provider as any, 
      options: { redirectTo: window.location.origin } 
    });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  return {
    user,
    session,
    isLoading,
    isAuthenticated: !!user,
    signInWithProvider,
    signOut,
  };
}
