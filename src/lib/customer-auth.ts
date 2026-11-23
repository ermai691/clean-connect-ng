import { supabase } from "@/integrations/supabase/client";
import { setUser as setLocalUser, logout as clearLocalUser } from "@/lib/auth";
import { provisionCustomerRole } from "@/lib/customer-auth.functions";
import { establishSessionFromUrl } from "@/lib/auth-session";

const authRedirectUrl = () => `${window.location.origin}/auth/customer`;

function friendlyAuthError(message: string) {
  if (/email not confirmed/i.test(message)) {
    return "Please confirm your email address using the verification link, then log in again.";
  }
  if (/invalid login credentials/i.test(message)) return "Incorrect email or password.";
  if (/already registered|already exists/i.test(message)) {
    return "An account with that email already exists. Try logging in.";
  }
  if (/password/i.test(message) && /weak|short|characters/i.test(message)) return message;
  if (/row-level security|permission denied|42501/i.test(message)) {
    return "Your account was created, but the customer role could not be saved. Ask support to run the latest role SQL in Supabase.";
  }
  return message;
}

function mirrorSession(name: string, email: string) {
  setLocalUser({ name, email, role: "customer" }, true);
}

export type CustomerProfile = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  loyalty_points?: number;
  wallet_balance?: number;
  [key: string]: unknown;
};

async function saveOwnProfile(userId: string, fullName: string, email: string, phone?: string | null) {
  await supabase.from("profiles").upsert(
    {
      id: userId,
      full_name: fullName,
      email,
      phone: phone?.trim() || null,
    },
    { onConflict: "id" },
  );
}

async function ensureCustomerRole(
  fullName?: string,
  phone?: string | null,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;
  if (!user) return { ok: false, error: "You must be signed in." };
  if (!user.email_confirmed_at) {
    return { ok: false, error: "Please confirm your email before continuing." };
  }

  const name =
    fullName?.trim() ||
    (user.user_metadata?.["full_name"] as string | undefined) ||
    "Customer";
  const phoneValue =
    phone?.trim() || (user.user_metadata?.["phone"] as string | undefined) || null;

  const { data: existing, error: readError } = await supabase
    .from("user_roles")
    .select("id")
    .eq("user_id", user.id)
    .eq("role", "customer")
    .maybeSingle();

  if (readError) return { ok: false, error: friendlyAuthError(readError.message) };
  if (!existing) {
    let assigned = false;
    let lastError = "Could not set up your customer account.";

    try {
      const result = await provisionCustomerRole({ data: { fullName: name } });
      if (result.ok) assigned = true;
      else lastError = result.error;
    } catch {
      /* server function unavailable — try the database policy next */
    }

    if (!assigned) {
      const { error: insertError } = await supabase.from("user_roles").insert({
        user_id: user.id,
        role: "customer",
      });
      if (!insertError || /duplicate|unique/i.test(insertError.message)) assigned = true;
      else lastError = insertError.message;
    }

    if (!assigned) return { ok: false, error: friendlyAuthError(lastError) };
  }

  await saveOwnProfile(user.id, name, user.email ?? "", phoneValue);
  return { ok: true };
}

export async function ensureCustomerRecords(fullName?: string): Promise<CustomerProfile | null> {
  await ensureCustomerRole(fullName);
  return null;
}

export async function signUpCustomer(input: {
  name: string;
  email: string;
  password: string;
  phone?: string;
}) {
  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();
  const phone = input.phone?.trim() || "";
  if (!name) return { ok: false as const, error: "Full name is required." };
  if (input.password.length < 8) {
    return { ok: false as const, error: "Password must be at least 8 characters." };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password: input.password,
    options: {
      emailRedirectTo: authRedirectUrl(),
      data: { full_name: name, phone },
    },
  });
  if (error) return { ok: false as const, error: friendlyAuthError(error.message) };

  if (!data.session) {
    return {
      ok: false as const,
      needsConfirmation: true as const,
      error:
        "Account created successfully. Open the confirmation email, click the link, then log in here.",
    };
  }

  const role = await ensureCustomerRole(name, phone);
  if (!role.ok) return { ok: false as const, error: role.error };
  mirrorSession(name, data.user?.email ?? email);
  return { ok: true as const };
}

export async function resendCustomerConfirmation(email: string) {
  const value = email.trim().toLowerCase();
  if (!value) return { ok: false as const, error: "Enter your email address first." };
  const { error } = await supabase.auth.resend({
    type: "signup",
    email: value,
    options: { emailRedirectTo: authRedirectUrl() },
  });
  return error
    ? { ok: false as const, error: friendlyAuthError(error.message) }
    : {
        ok: true as const,
        message: "If the account needs confirmation, a new email has been sent. Check inbox and spam.",
      };
}

export async function signInWithGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: authRedirectUrl() },
  });
  return error ? { ok: false as const, error: friendlyAuthError(error.message) } : { ok: true as const };
}

export async function signInCustomer(email: string, password: string) {
  const value = email.trim().toLowerCase();
  const { data, error } = await supabase.auth.signInWithPassword({ email: value, password });
  if (error || !data.user) {
    return {
      ok: false as const,
      error: friendlyAuthError(error?.message ?? "Incorrect email or password."),
    };
  }

  const role = await ensureCustomerRole(
    (data.user.user_metadata?.["full_name"] as string | undefined) ?? undefined,
    (data.user.user_metadata?.["phone"] as string | undefined) ?? undefined,
  );
  if (!role.ok) {
    await supabase.auth.signOut();
    clearLocalUser();
    return { ok: false as const, error: role.error };
  }

  mirrorSession(
    (data.user.user_metadata?.["full_name"] as string | undefined) ?? "Customer",
    data.user.email ?? value,
  );
  return { ok: true as const };
}

export async function finishCustomerSession() {
  await establishSessionFromUrl();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user || !data.user.email_confirmed_at) return null;

  const role = await ensureCustomerRole(
    (data.user.user_metadata?.["full_name"] as string | undefined) ?? undefined,
    (data.user.user_metadata?.["phone"] as string | undefined) ?? undefined,
  );
  if (!role.ok) return null;

  const name = (data.user.user_metadata?.["full_name"] as string | undefined) ?? "Customer";
  mirrorSession(name, data.user.email ?? "");
  return { id: data.user.id, email: data.user.email ?? "", name };
}

export async function signOutCustomer() {
  await supabase.auth.signOut();
  clearLocalUser();
}

export async function currentCustomer() {
  const session = await finishCustomerSession();
  return session ? { id: session.id, email: session.email } : null;
}

export async function changePassword(newPassword: string) {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  return error ? { ok: false as const, error: friendlyAuthError(error.message) } : { ok: true as const };
}
