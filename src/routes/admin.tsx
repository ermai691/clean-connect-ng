import { createFileRoute, Link } from "@tanstack/react-router";
import { Nav, Footer } from "@/components/Nav";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — CleanConnect" },
      { name: "description", content: "Manage users, providers, bookings and payouts across CleanConnect." },
    ],
  }),
  component: AdminDashboard,
});

const STATS = [
  { icon: "fa-users", label: "Total Users", value: "12,480", trend: "+8.2%", color: "#2563EB" },
  { icon: "fa-user-tie", label: "Active Providers", value: "1,342", trend: "+3.1%", color: "#22C55E" },
  { icon: "fa-calendar-check", label: "Bookings Today", value: "268", trend: "+12%", color: "#F59E0B" },
  { icon: "fa-naira-sign", label: "Revenue (₦)", value: "8.4M", trend: "+18%", color: "#8B5CF6" },
];

const PENDING = [
  { name: "Amaka O.", type: "Provider verification", time: "2h ago" },
  { name: "Tunde A.", type: "Payout request · ₦125,000", time: "4h ago" },
  { name: "Blessing E.", type: "Provider verification", time: "6h ago" },
  { name: "Ibrahim K.", type: "Refund review", time: "1d ago" },
];

function AdminDashboard() {
  return (
    <div className="page-shell">
      <Nav />
      <div className="page-hero">
        <div className="container-x">
          <span className="chip"><i className="fas fa-shield-halved" /> Admin Console</span>
          <h1>Admin Dashboard</h1>
          <p>Full oversight of users, providers, bookings, payments and disputes.</p>
        </div>
      </div>

      <div className="container-x" style={{ paddingBottom: 60 }}>
        <div className="dashboard-grid">
          {STATS.map((s) => (
            <div className="dash-card" key={s.label}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <span style={{
                  width: 40, height: 40, borderRadius: 12, display: "grid", placeItems: "center",
                  background: `${s.color}18`, color: s.color,
                }}>
                  <i className={`fas ${s.icon}`} />
                </span>
                <div className="label">{s.label}</div>
              </div>
              <div className="value">{s.value}</div>
              <div className="foot" style={{ color: "#15803d" }}>
                <i className="fas fa-arrow-trend-up" /> {s.trend} this week
              </div>
            </div>
          ))}
        </div>

        <div className="panel">
          <h3><i className="fas fa-clipboard-list" /> Pending Approvals</h3>
          <p className="muted">Requests awaiting admin action.</p>
          {PENDING.map((p) => (
            <div key={p.name + p.type} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "14px 0", borderBottom: "1px solid var(--border)", gap: 12, flexWrap: "wrap",
            }}>
              <div>
                <strong>{p.name}</strong>
                <div style={{ color: "var(--muted-foreground)", fontSize: "0.85rem" }}>{p.type} · {p.time}</div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn btn-primary"><i className="fas fa-check" /> Approve</button>
                <button className="btn btn-ghost"><i className="fas fa-xmark" /> Reject</button>
              </div>
            </div>
          ))}
        </div>

        <div className="panel">
          <h3><i className="fas fa-chart-line" /> Quick Actions</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12, marginTop: 12 }}>
            {[
              { i: "fa-users-gear", t: "Manage Users" },
              { i: "fa-user-tie", t: "Manage Providers" },
              { i: "fa-calendar", t: "All Bookings" },
              { i: "fa-money-bill-transfer", t: "Payouts" },
              { i: "fa-flag", t: "Disputes" },
              { i: "fa-gear", t: "Settings" },
            ].map((a) => (
              <button key={a.t} className="btn btn-outline" style={{ justifyContent: "flex-start" }}>
                <i className={`fas ${a.i}`} /> {a.t}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 16 }}>
          <Link to="/customer" className="btn btn-ghost"><i className="fas fa-user" /> Customer view</Link>
          <Link to="/provider" className="btn btn-ghost"><i className="fas fa-user-tie" /> Provider view</Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}
