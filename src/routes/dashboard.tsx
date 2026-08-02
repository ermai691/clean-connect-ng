import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { dashboardPathFor, getUser } from "@/lib/auth";

export const Route = createFileRoute("/dashboard")({
  ssr: false,
  component: DashboardRedirect,
});

function DashboardRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    const user = getUser();
    if (!user) navigate({ to: "/auth/$role", params: { role: "customer" }, replace: true });
    else navigate({ to: dashboardPathFor(user.role), replace: true });
  }, [navigate]);

  return (
    <div className="auth-shell">
      <div className="auth-card" style={{ textAlign: "center" }}>
        <p className="sub"><i className="fas fa-spinner fa-spin" /> Taking you to your dashboard…</p>
      </div>
    </div>
  );
}
