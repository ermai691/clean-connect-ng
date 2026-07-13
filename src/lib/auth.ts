// Simple client-side mock auth using localStorage.
// Not production-grade — replace with real auth (Lovable Cloud) later.

export type User = { name: string; email: string };

const KEY = "cleanconnect_user";

export function getUser(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

export function setUser(user: User) {
  window.localStorage.setItem(KEY, JSON.stringify(user));
  window.dispatchEvent(new Event("cc-auth-change"));
}

export function logout() {
  window.localStorage.removeItem(KEY);
  window.dispatchEvent(new Event("cc-auth-change"));
}

export function isAuthenticated(): boolean {
  return !!getUser();
}
