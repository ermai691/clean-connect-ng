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
  return message;
}

function mirrorSession(name: string, email: string) {
  // Navigation convenience only. Supabase Auth remains the source of truth.
  setLocalUser({ name, email, role: "customer" }, true);
}

async function provisionRole(fullName?: string) {
  const result = await provisionCustomerRole({ data: { fullName: fullName?.trim() || undefined } });
  return result.ok ? result : { ok: false as const, error: result.error };
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

export async function ensureCustomerRecords(fullName?: string): Promise<CustomerProfile | null> {
  await provisionRole(fullName);
  return null;
}

export async function signUpCustomer(input: { name: string; email: string; password: string }) {
  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();
  if (!name) return { ok: false as const, error: "Full name is required." };
  if (input.password.length < 8) {
    return { ok: false as const, error: "Password must be at least 8 characters." };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password: input.password,
    options: {
      emailRedirectTo: authRedirectUrl(),
      data: { full_name: name },
    },
  });
  if (error) return { ok: false as const, error: friendlyAuthError(error.message) };

  // Email confirmation required — this is expected, not a failure
  if (!data.session) {
    return {
      ok: false as const,
      needsConfirmation: true as const,
      error:
        "Account created successfully. Open the confirmation email we just sent, click the link, then come back here to log in.",
    };
  }

  // Session already active (confirmations disabled in Supabase)
  const role = await provisionRole(name);
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
        message: "If the account needs confirmation, a new verification email has been sent. Check your inbox and spam folder.",
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

  const role = await provisionRole(
    (data.user.user_metadata?.["full_name"] as string | undefined) ?? undefined,
  );
  if (!role.ok) {
    await supabase.auth.signOut();
    return { ok: false as const, error: role.error };
  }
  mirrorSession(
    (data.user.user_metadata?.["full_name"] as string | undefined) ?? "Customer",
    data.user.email ?? value,
  );
  return { ok: true as const };
}

/**
 * Called when landing on /auth/customer (including after email confirmation link).
 * Processes URL tokens, ensures email is confirmed, provisions role, mirrors session.
 */
export async function finishCustomerSession() {
  // Process confirmation / OAuth tokens from the URL if present
  await establishSessionFromUrl();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  if (!data.user.email_confirmed_at) return null;

  const role = await provisionRole(
    (data.user.user_metadata?.["full_name"] as string | undefined) ?? undefined,
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
