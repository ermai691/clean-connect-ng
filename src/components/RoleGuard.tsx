import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { dashboardPathFor, getUser, type Role, type User } from "@/lib/auth";

/**
 * Client-side role guard for the mock auth system.
 * - Not signed in  → redirect to /auth/{role}
 * - Wrong role     → Access Denied (403) with a link to their own dashboard
 */
export function RoleGuard({ role, children }: { role: Role; children: ReactNode }) {
  const navigate = useNavigate();
  const [state, setState] = useState<{ ready: boolean; user: User | null }>({ ready: false, user: null });

  useEffect(() => {
    const sync = () => {
      const user = getUser();
      setState({ ready: true, user });
      if (!user) navigate({ to: "/auth/$role", params: { role }, replace: true });
    };
    sync();
    window.addEventListener("cc-auth-change", sync);
    return () => window.removeEventListener("cc-auth-change", sync);
  }, [navigate, role]);

  if (!state.ready || !state.user) {
    return (
      <div className="auth-shell">
        <div className="auth-card" style={{ textAlign: "center" }}>
          <p className="sub"><i className="fas fa-spinner fa-spin" /> Checking your access…</p>
        </div>
      </div>
    );
  }

  if (state.user.role !== role) {
    return (
      <div className="auth-shell">
        <div className="auth-card" style={{ textAlign: "center" }}>
          <div style={{ fontSize: "2.4rem", color: "#dc2626" }}><i className="fas fa-ban" /></div>
          <h1>403 — Access Denied</h1>
          <p className="sub">
            You're signed in as a {state.user.role}. This area is restricted to {role} accounts.
          </p>
          <Link to={dashboardPathFor(state.user.role)} className="btn btn-primary">
            Go to my dashboard
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
