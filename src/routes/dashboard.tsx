import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Nav, Footer, useAuthUser } from "@/components/Nav";

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  const user = useAuthUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem("cleanconnect_user");
    if (!raw) navigate({ to: "/login" });
  }, [navigate]);

  if (!user) return null;

  return (
    <div className="page-shell">
      <Nav />
      <div className="page-hero">
        <div className="container-x">
          <h1>Welcome back, {user.name.split(" ")[0]} 👋</h1>
          <p>Your CleanConnect dashboard — bookings, wallet and rewards in one place.</p>
        </div>
      </div>
      <div className="container-x" style={{ paddingBottom: 60 }}>
        <div className="dashboard-grid">
          {[
            { label: "Upcoming Bookings", value: "2", foot: "Next: Tomorrow, 10:00" },
            { label: "Completed", value: "14", foot: "+2 this month" },
            { label: "Wallet Balance", value: "₦12,500", foot: "Loyalty rewards" },
            { label: "Referral Credits", value: "3", foot: "Invite friends" },
          ].map((c) => (
            <div className="dash-card" key={c.label}>
              <div className="label">{c.label}</div>
              <div className="value">{c.value}</div>
              <div className="foot">{c.foot}</div>
            </div>
          ))}
        </div>

        <div className="panel">
          <h3>Upcoming bookings</h3>
          <p className="muted">Track your scheduled cleanings.</p>
          {[
            { s: "House Cleaning", p: "Chidinma A.", d: "Tomorrow · 10:00 AM", st: "Confirmed" },
            { s: "Laundry & Ironing", p: "Fatima B.", d: "Fri · 2:00 PM", st: "Pending pickup" },
          ].map((b) => (
            <div
              key={b.s}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "14px 0",
                borderBottom: "1px solid var(--border)",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              <div>
                <strong>{b.s}</strong>
                <div style={{ color: "var(--muted-foreground)", fontSize: "0.85rem" }}>
                  with {b.p} · {b.d}
                </div>
              </div>
              <span
                style={{
                  padding: "4px 12px",
                  borderRadius: 999,
                  background: "rgba(34,197,94,0.12)",
                  color: "#15803d",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                }}
              >
                {b.st}
              </span>
            </div>
          ))}
        </div>

        <div className="panel">
          <h3>Live provider tracking</h3>
          <p className="muted">Watch your provider en route in real time.</p>
          {/* Replace later with Google Maps */}
          <div
            style={{
              height: 260,
              borderRadius: 16,
              background:
                "linear-gradient(135deg, #dbeafe, #eff6ff), url('https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1200&q=70') center/cover",
              display: "grid",
              placeItems: "center",
              color: "var(--primary)",
              fontWeight: 700,
              border: "1px solid var(--border)",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <i className="fas fa-map-location-dot" style={{ fontSize: "2rem", marginBottom: 8 }} />
              <div>Map placeholder — Google Maps integration coming soon</div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
