import { supabase } from '@/integrations/supabase/client';

/**
 * Ensures the current Supabase session has a valid JWT.
 * Mobile browsers suspend background tabs — the token can expire silently,
 * causing RLS failures (auth.uid() = NULL in Postgres).
 *
 * Call this before any DB write (insert/update/delete).
 *
 * @returns true if session is valid (or was refreshed), false if no session / refresh failed
 */
export async function ensureValidSession(): Promise<boolean> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return false;

    const expiresAt = session.expires_at ?? 0;
    const nowSecs = Math.floor(Date.now() / 1000);

    // If token expires within 90s, refresh proactively
    if (expiresAt - nowSecs < 90) {
      const { error } = await supabase.auth.refreshSession();
      if (error) return false;
    }

    return true;
  } catch {
    return false;
  }
}
