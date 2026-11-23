/**
 * Shared helpers to establish a Supabase session from email links
 * (signup confirmation, password recovery, magic links).
 */

import { supabase } from "@/integrations/supabase/client";

export type AuthLinkResult = {
  session: boolean;
  /** signup | recovery | magiclink | invite | email_change | null */
  type: string | null;
  error: string | null;
};

function readHashParams() {
  if (typeof window === "undefined") return new URLSearchParams();
  return new URLSearchParams(window.location.hash.replace(/^#/, ""));
}

/**
 * Reads tokens from the current URL (hash or ?code=) and establishes a session.
 * Cleans the URL afterwards. Safe to call on any page.
 */
export async function consumeAuthLink(): Promise<AuthLinkResult> {
  if (typeof window === "undefined") return { session: false, type: null, error: null };

  const url = new URL(window.location.href);
  const hashParams = readHashParams();
  const hashType = hashParams.get("type");
  const hashError = hashParams.get("error_description") || hashParams.get("error");

  if (hashError && !hashParams.get("access_token")) {
    window.history.replaceState({}, document.title, url.pathname + url.search);
    return { session: false, type: hashType, error: decodeURIComponent(hashError.replace(/\+/g, " ")) };
  }

  const code = url.searchParams.get("code");
  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    url.searchParams.delete("code");
    url.searchParams.delete("type");
    window.history.replaceState({}, document.title, url.pathname + url.search);
    if (!error && data.session) return { session: true, type: hashType, error: null };
    return { session: false, type: hashType, error: error?.message ?? "Could not complete the email link." };
  }

  const accessToken = hashParams.get("access_token");
  const refreshToken = hashParams.get("refresh_token") ?? "";
  if (accessToken) {
    const { data, error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    window.history.replaceState({}, document.title, url.pathname + url.search);
    if (!error && data.session) return { session: true, type: hashType, error: null };
    return { session: false, type: hashType, error: error?.message ?? "This email link is invalid or expired." };
  }

  const { data } = await supabase.auth.getSession();
  return { session: !!data.session, type: null, error: null };
}

/** True when a Supabase session exists after processing any tokens in the URL. */
export async function establishSessionFromUrl(): Promise<boolean> {
  const result = await consumeAuthLink();
  return result.session;
}
