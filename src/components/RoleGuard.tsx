import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { dashboardPathFor, type Role, type User } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { currentCustomer } from "@/lib/customer-auth";
import { currentAdmin } from "@/lib/admin-auth";
import { currentProvider } from "@/lib/provider-auth";

/**
 * Route guard.
 * Admin, customer, and provider routes are verified against the Supabase session
 * and the matching role. localStorage alone is never enough.
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
        const customer = await currentCustomer();
        const provider = customer ? null : await currentProvider();
        if (!active) return;
        const other = customer
          ? { name: "Customer", email: customer.email, role: "customer" as const }
          : provider
            ? { name: provider.name, email: provider.email, role: "provider" as const }
            : null;
        if (other) {
          setState({ ready: true, user: other, denied: true });
          return;
        }
        setState({ ready: true, user: null, denied: false });
        navigate({ to: "/auth/$role", params: { role: "admin" }, replace: true });
        return;
      }

      if (role === "customer") {
        const customer = await currentCustomer();
        if (!active) return;
        const user = customer ? { name: "Customer", email: customer.email, role: "customer" as const } : null;
        setState({ ready: true, user, denied: false });
        if (!user) navigate({ to: "/auth/$role", params: { role }, replace: true });
        return;
      }

      const provider = await currentProvider();
      if (!active) return;
      const user = provider ? { name: provider.name, email: provider.email, role: "provider" as const } : null;
      setState({ ready: true, user, denied: false });
      if (!user) navigate({ to: "/auth/$role", params: { role: "provider" }, replace: true });
    };

    void sync();
    const onChange = () => void sync();
    window.addEventListener("cc-auth-change", onChange);
    const { data: authListener } = supabase.auth.onAuthStateChange(() => void sync());
    return () => {
      active = false;
      window.removeEventListener("cc-auth-change", onChange);
      authListener.subscription.unsubscribe();
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
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
