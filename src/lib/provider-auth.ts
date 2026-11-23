import { supabase } from "@/integrations/supabase/client";
import { logout as clearLocalUser, setUser as setLocalUser } from "@/lib/auth";

function friendly(message: string) {
  if (/email not confirmed/i.test(message)) {
    return "Please confirm your email address, then log in again.";
  }
  if (/invalid login credentials/i.test(message)) return "Incorrect email or password.";
  return message;
}

function mirror(name: string, email: string) {
  setLocalUser({ name, email, role: "provider" }, true);
}

async function isProvider(userId: string) {
  const { data, error } = await supabase.rpc("has_role", {
    _user_id: userId,
    _role: "provider",
  });
  if (error) return false;
  return !!data;
}

export async function currentProvider(): Promise<{ id: string; email: string; name: string } | null> {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  if (!(await isProvider(data.user.id))) return null;
  const name = (data.user.user_metadata?.["full_name"] as string | undefined) ?? "Provider";
  mirror(name, data.user.email ?? "");
  return { id: data.user.id, email: data.user.email ?? "", name };
}

export async function signInProvider(email: string, password: string) {
  const value = email.trim().toLowerCase();
  const { data, error } = await supabase.auth.signInWithPassword({ email: value, password });
  if (error || !data.user) {
    return { ok: false as const, error: friendly(error?.message ?? "Incorrect email or password.") };
  }
  if (!(await isProvider(data.user.id))) {
    await supabase.auth.signOut();
    clearLocalUser();
    return {
      ok: false as const,
      error: "This account is not a provider. Apply on Become a Provider, or log in as a customer.",
    };
  }
  const name = (data.user.user_metadata?.["full_name"] as string | undefined) ?? "Provider";
  mirror(name, data.user.email ?? value);
  return { ok: true as const, user: { id: data.user.id, email: data.user.email ?? value, name } };
}

export async function signOutProvider() {
  await supabase.auth.signOut();
  clearLocalUser();
}
