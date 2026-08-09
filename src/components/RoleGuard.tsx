import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { dashboardPathFor, getUser, type Role, type User } from "@/lib/auth";
import { currentAdmin } from "@/lib/admin-auth";

/**
 * Route guard.
 * - Admin routes are verified against the real backend session + admin role.
 * - Customer/provider routes keep the existing client session.
 */
export function RoleGuard({ role, children }: { role: Role; children: ReactNode }) {
  const navigate = useNavigate();
  const [state, setState] = useState<{ ready: boolean; user: User | null; denied: boolean }>({
    ready: false,
    user: null,
    denied: false,
  });

  useEffect(() => {
    let active = true;

    const sync = async () => {
      if (role === "admin") {
        const admin = await currentAdmin();
        if (!active) return;
        if (admin) {
          setState({ ready: true, user: { name: admin.name, email: admin.email, role: "admin" }, denied: false });
          return;
        }
        const other = getUser();
        if (other) {
          setState({ ready: true, user: other, denied: true });
          return;
        }
        setState({ ready: true, user: null, denied: false });
        navigate({ to: "/auth/$role", params: { role: "admin" }, replace: true });
        return;
      }

      const user = getUser();
      if (!active) return;
      setState({ ready: true, user, denied: false });
      if (!user) navigate({ to: "/auth/$role", params: { role }, replace: true });
    };

    void sync();
    const onChange = () => void sync();
    window.addEventListener("cc-auth-change", onChange);
    return () => {
      active = false;
      window.removeEventListener("cc-auth-change", onChange);
    };
  }, [navigate, role]);

  if (!state.ready || (!state.user && !state.denied)) {
    return (
      <div className="auth-shell">
        <div className="auth-card" style={{ textAlign: "center" }}>
          <p className="sub"><i className="fas fa-spinner fa-spin" /> Checking your access…</p>
        </div>
      </div>
    );
  }

  if (state.denied || (state.user && state.user.role !== role)) {
    const signedInRole = state.user?.role ?? "customer";
    return (
      <div className="auth-shell">
        <div className="auth-card" style={{ textAlign: "center" }}>
          <div style={{ fontSize: "2.4rem", color: "#dc2626" }}><i className="fas fa-ban" /></div>
          <h1>{role === "admin" ? "Administrator access required." : "403 — Access Denied"}</h1>
          <p className="sub">
            You're signed in as a {signedInRole}. This area is restricted to {role} accounts.
          </p>
          <Link to={dashboardPathFor(signedInRole)} className="btn btn-primary">
            Go to my dashboard
          </Link>
          <div className="auth-alt">
            <Link to="/auth/$role" params={{ role: "admin" }}>Administrator login</Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
