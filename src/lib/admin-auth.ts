// Real (backend-backed) authentication for the CleanConnect administrator.
// Passwords are never stored or read here — they live only in the auth provider.

import { supabase } from "@/integrations/supabase/client";

export async function currentAdmin(): Promise<{ id: string; email: string; name: string } | null> {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  const { data: isAdmin } = await supabase.rpc("has_role", {
    _user_id: data.user.id,
    _role: "admin",
  });
  if (!isAdmin) return null;
  return {
    id: data.user.id,
    email: data.user.email ?? "",
    name: (data.user.user_metadata?.["full_name"] as string) ?? "CleanConnect Admin",
  };
}

export async function signInAdmin(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });
  if (error) {
    const message = /email not confirmed/i.test(error.message)
      ? "Please confirm your email address — check your inbox for the verification link."
      : "Incorrect email or password.";
    return { ok: false as const, error: message };
  }
  const { data: isAdmin } = await supabase.rpc("has_role", {
    _user_id: data.user.id,
    _role: "admin",
  });
  if (!isAdmin) {
    await supabase.auth.signOut();
    return { ok: false as const, error: "Administrator access required." };
  }
  return {
    ok: true as const,
    user: {
      id: data.user.id,
      email: data.user.email ?? "",
      name: (data.user.user_metadata?.["full_name"] as string) ?? "CleanConnect Admin",
    },
  };
}

export async function signOutAdmin() {
  await supabase.auth.signOut();
}

export async function updateAdminPassword(password: string) {
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { ok: false as const, error: error.message };
  return { ok: true as const };
}

/**
 * Detects whether the current browser session came from a password-recovery link.
 * Supabase puts tokens in the URL hash (#access_token=...&type=recovery) or as a
 * code query param. We must exchange/establish the session before updateUser works.
 */
export async function hasRecoverySession(): Promise<boolean> {
  if (typeof window === "undefined") return false;

  // 1. If URL has a code (PKCE flow), exchange it for a session
  const url = new URL(window.location.href);
  const code = url.searchParams.get("code");
  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data.session) {
      // Clean the code from the URL so refresh doesn't re-exchange
      url.searchParams.delete("code");
      window.history.replaceState({}, document.title, url.pathname + url.search);
      return true;
    }
  }

  // 2. Hash-based tokens (implicit / older flow): type=recovery
  const hash = window.location.hash?.replace(/^#/, "") ?? "";
  if (hash) {
    const params = new URLSearchParams(hash);
    const type = params.get("type");
    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");

    if (type === "recovery" && accessToken) {
      const { data, error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken ?? "",
      });
      // Clear hash so the tokens aren't left in the address bar
      window.history.replaceState({}, document.title, url.pathname + url.search);
      if (!error && data.session) return true;
    }
  }

  // 3. Already have an active session (user landed after tokens were processed)
  const { data } = await supabase.auth.getSession();
  return !!data.session;
}
