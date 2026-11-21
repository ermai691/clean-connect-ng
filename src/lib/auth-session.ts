/**
 * Shared helpers to establish a Supabase session from email links
 * (signup confirmation, password recovery, magic links).
 */

import { supabase } from "@/integrations/supabase/client";

/**
 * Reads tokens from the current URL (hash or ?code=) and establishes a session.
 * Safe to call on any page load. Cleans the URL afterwards.
 *
 * Returns true if a session is now active.
 */
export async function establishSessionFromUrl(): Promise<boolean> {
  if (typeof window === "undefined") return false;

  const url = new URL(window.location.href);

  // PKCE: ?code=...
  const code = url.searchParams.get("code");
  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    url.searchParams.delete("code");
    // Also drop common noise params
    url.searchParams.delete("type");
    window.history.replaceState({}, document.title, url.pathname + url.search + url.hash);
    if (!error && data.session) return true;
  }

  // Implicit / older flow: #access_token=...&type=signup|recovery|...
  const hash = window.location.hash?.replace(/^#/, "") ?? "";
  if (hash.includes("access_token")) {
    const params = new URLSearchParams(hash);
    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token") ?? "";
    if (accessToken) {
      const { data, error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
      window.history.replaceState({}, document.title, url.pathname + url.search);
      if (!error && data.session) return true;
    }
  }

  // Already have a session
  const { data } = await supabase.auth.getSession();
  return !!data.session;
}
