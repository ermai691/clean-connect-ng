// Real (backend-backed) authentication + profile for CleanConnect customers.
// Passwords are never stored in the frontend — they live only in the auth provider.

import { supabase } from "@/integrations/supabase/client";
import { setUser as setLocalUser, logout as clearLocalUser } from "@/lib/auth";

export type CustomerProfile = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  date_of_birth: string | null;
  gender: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  wallet_balance: number;
  loyalty_points: number;
  referral_code: string | null;
  referral_count: number;
  referral_rewards: number;
  notify_email: boolean;
  notify_sms: boolean;
  notify_bookings: boolean;
  notify_promotions: boolean;
  language: string;
};

function makeReferralCode(name: string) {
  const base = (name || "CC").replace(/[^a-zA-Z]/g, "").slice(0, 4).toUpperCase() || "CC";
  return `${base}${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
}

/** Creates the profile row + customer role for the signed-in user if missing. */
export async function ensureCustomerRecords(fullName?: string) {
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user) return null;

  const { data: existing } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();

  if (!existing) {
    const name = fullName || (user.user_metadata?.["full_name"] as string) || user.email?.split("@")[0] || "Customer";
    await supabase.from("profiles").insert({
      id: user.id,
      full_name: name,
      email: user.email ?? "",
      referral_code: makeReferralCode(name),
    });
  }

  const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
  if (!roles || roles.length === 0) {
    await supabase.from("user_roles").insert({ user_id: user.id, role: "customer" });
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  return (profile as CustomerProfile | null) ?? null;
}

export async function signUpCustomer(input: { name: string; email: string; password: string }) {
  const { data, error } = await supabase.auth.signUp({
    email: input.email.trim().toLowerCase(),
    password: input.password,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/customer`,
      data: { full_name: input.name.trim() },
    },
  });
  if (error) return { ok: false as const, error: error.message };
  if (!data.session) {
    return { ok: false as const, error: "Check your email to confirm your account, then log in." };
  }
  const profile = await ensureCustomerRecords(input.name.trim());
  mirrorSession(profile?.full_name ?? input.name, data.user?.email ?? input.email);
  return { ok: true as const };
}

export async function signInCustomer(email: string, password: string, remember = true) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });
  if (error || !data.user) return { ok: false as const, error: error?.message ?? "Incorrect email or password." };

  const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: data.user.id, _role: "admin" });
  if (isAdmin) {
    await supabase.auth.signOut();
    return { ok: false as const, error: "This is an administrator account. Use the Administrator Login." };
  }

  const profile = await ensureCustomerRecords();
  mirrorSession(profile?.full_name ?? "Customer", data.user.email ?? email, remember);
  return { ok: true as const };
}

/** Keeps the site-wide navigation in sync with the real session (no credentials stored). */
function mirrorSession(name: string, email: string, remember = true) {
  setLocalUser({ name, email, role: "customer" }, remember);
}

export async function signOutCustomer() {
  await supabase.auth.signOut();
  clearLocalUser();
}

export async function currentCustomer(): Promise<{ id: string; email: string } | null> {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: data.user.id, _role: "admin" });
  if (isAdmin) return null;
  return { id: data.user.id, email: data.user.email ?? "" };
}

export async function changePassword(newPassword: string) {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  return error ? { ok: false as const, error: error.message } : { ok: true as const };
}
