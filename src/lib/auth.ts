// Client-side mock auth with roles, "remember me" and password reset.
// Not production-grade — replace with real auth (Lovable Cloud) later.

export type Role = "customer" | "provider" | "admin";
export type User = { name: string; email: string; role: Role };

const KEY = "cleanconnect_user";
const ACCOUNTS_KEY = "cleanconnect_accounts";
const RESET_KEY = "cleanconnect_reset";
const RESET_TTL_MS = 15 * 60 * 1000;

type Account = { name: string; email: string; password: string; role: Role };

// No seeded credentials: administrators authenticate against the real backend
// (see src/lib/admin-auth.ts), never against this client-side store.
const SEED: Account[] = [];

function isBrowser() {
  return typeof window !== "undefined";
}

function readAccounts(): Account[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(ACCOUNTS_KEY);
    const list = raw ? (JSON.parse(raw) as Account[]) : [];
    const merged = [...list];
    for (const seed of SEED) {
      if (!merged.some((a) => a.email.toLowerCase() === seed.email)) merged.push(seed);
    }
    return merged;
  } catch {
    return [...SEED];
  }
}

function writeAccounts(list: Account[]) {
  window.localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(list));
}

export function getUser(): User | null {
  if (!isBrowser()) return null;
  try {
    const raw =
      window.localStorage.getItem(KEY) ?? window.sessionStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<User>;
    if (!parsed?.email) return null;
    return { name: parsed.name ?? "User", email: parsed.email, role: (parsed.role as Role) ?? "customer" };
  } catch {
    return null;
  }
}

export function setUser(user: User, remember = true) {
  const raw = JSON.stringify(user);
  if (remember) {
    window.localStorage.setItem(KEY, raw);
    window.sessionStorage.removeItem(KEY);
  } else {
    window.sessionStorage.setItem(KEY, raw);
    window.localStorage.removeItem(KEY);
  }
  window.dispatchEvent(new Event("cc-auth-change"));
}

export function logout() {
  window.localStorage.removeItem(KEY);
  window.sessionStorage.removeItem(KEY);
  window.dispatchEvent(new Event("cc-auth-change"));
}

export function isAuthenticated(): boolean {
  return !!getUser();
}

export function dashboardPathFor(role: Role): "/customer" | "/provider" | "/admin" {
  if (role === "provider") return "/provider";
  if (role === "admin") return "/admin";
  return "/customer";
}

export function authPathFor(role: Role) {
  return `/auth/${role}`;
}

/* ------------------------- credentials ------------------------- */

export function signUp(input: { name: string; email: string; password: string; role: Exclude<Role, "admin"> }) {
  const email = input.email.trim().toLowerCase();
  const accounts = readAccounts();
  if (accounts.some((a) => a.email.toLowerCase() === email)) {
    return { ok: false as const, error: "An account with that email already exists." };
  }
  const account: Account = { name: input.name.trim(), email, password: input.password, role: input.role };
  writeAccounts([...accounts, account]);
  return { ok: true as const, user: { name: account.name, email: account.email, role: account.role } };
}

export function signIn(input: { email: string; password: string; role: Role }) {
  const email = input.email.trim().toLowerCase();
  const account = readAccounts().find((a) => a.email.toLowerCase() === email);
  if (!account || account.password !== input.password) {
    return { ok: false as const, error: "Incorrect email or password." };
  }
  if (account.role !== input.role) {
    return { ok: false as const, error: `This account is not registered as a ${input.role}.` };
  }
  return { ok: true as const, user: { name: account.name, email: account.email, role: account.role } };
}

/* ------------------------- password reset ------------------------- */

type ResetToken = { token: string; email: string; role: Role; expires: number };

function makeToken() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

/** Always succeeds from the caller's perspective (no account enumeration). */
export function requestPasswordReset(identifier: string, role: Role) {
  const value = identifier.trim().toLowerCase();
  const account = readAccounts().find((a) => a.email.toLowerCase() === value);
  if (!account) return { token: null as string | null };
  const entry: ResetToken = {
    token: makeToken(),
    email: account.email,
    role: account.role,
    expires: Date.now() + RESET_TTL_MS,
  };
  window.localStorage.setItem(RESET_KEY, JSON.stringify(entry));
  return { token: entry.token };
}

export function validateResetToken(token: string): { ok: boolean; role?: Role } {
  if (!isBrowser()) return { ok: false };
  try {
    const raw = window.localStorage.getItem(RESET_KEY);
    if (!raw) return { ok: false };
    const entry = JSON.parse(raw) as ResetToken;
    if (entry.token !== token) return { ok: false };
    if (Date.now() > entry.expires) return { ok: false };
    return { ok: true, role: entry.role };
  } catch {
    return { ok: false };
  }
}

export function resetPassword(token: string, newPassword: string) {
  const check = validateResetToken(token);
  if (!check.ok) return { ok: false as const, error: "This reset link is invalid or has expired." };
  const raw = window.localStorage.getItem(RESET_KEY)!;
  const entry = JSON.parse(raw) as ResetToken;
  const accounts = readAccounts().map((a) =>
    a.email.toLowerCase() === entry.email.toLowerCase() ? { ...a, password: newPassword } : a
  );
  writeAccounts(accounts);
  window.localStorage.removeItem(RESET_KEY);
  return { ok: true as const, role: entry.role };
}

export function passwordChecks(pw: string) {
  return {
    length: pw.length >= 8,
    upper: /[A-Z]/.test(pw),
    lower: /[a-z]/.test(pw),
    number: /[0-9]/.test(pw),
    special: /[^A-Za-z0-9]/.test(pw),
  };
}

export function passwordScore(pw: string) {
  return Object.values(passwordChecks(pw)).filter(Boolean).length;
}
