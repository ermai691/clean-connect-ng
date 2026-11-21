// Real (backend-backed) authentication for the CleanConnect administrator.
// Passwords are never stored or read here — they live only in the auth provider.

import { supabase } from "@/integrations/supabase/client";
import { establishSessionFromUrl } from "@/lib/auth-session";

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

/** True if a session exists after processing any recovery/confirmation tokens in the URL. */
export async function hasRecoverySession(): Promise<boolean> {
  return establishSessionFromUrl();
}
