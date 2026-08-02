import { createFileRoute, Link } from "@tanstack/react-router";
import { RoleGuard } from "@/components/RoleGuard";
import { Nav, Footer } from "@/components/Nav";

export const Route = createFileRoute("/customer")({
  head: () => ({
    meta: [
      { title: "Customer Dashboard — CleanConnect" },
      { name: "description", content: "Book services, track bookings and manage payments on CleanConnect." },
    ],
  }),
  ssr: false,
  component: () => (
    <RoleGuard role="customer">
      <CustomerDashboard />
    </RoleGuard>
  ),
});

const STATS = [
  { icon: "fa-calendar-check", label: "Upcoming", value: "2", color: "#2563EB" },
  { icon: "fa-circle-check", label: "Completed", value: "14", color: "#22C55E" },
  { icon: "fa-wallet", label: "Wallet (₦)", value: "12,500", color: "#F59E0B" },
  { icon: "fa-gift", label: "Referral Credits", value: "3", color: "#8B5CF6" },
];

const BOOKINGS = [
  { s: "House Cleaning", p: "Chidinma A.", d: "Tomorrow · 10:00 AM", st: "Confirmed" },
  { s: "Laundry & Ironing", p: "Fatima B.", d: "Fri · 2:00 PM", st: "Pending pickup" },
];

function CustomerDashboard() {
  return (
    <div className="page-shell">
      <Nav />
      <div className="page-hero">
        <div className="container-x">
          <span className="chip"><i className="fas fa-user" /> Customer Console</span>
          <h1>Customer Dashboard</h1>
          <p>Your bookings, wallet, favourites and rewards in one place.</p>
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
            </div>
          ))}
        </div>

        <div className="panel">
          <h3><i className="fas fa-calendar" /> Upcoming Bookings</h3>
          <p className="muted">Track your scheduled cleanings.</p>
          {BOOKINGS.map((b) => (
            <div key={b.s} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "14px 0", borderBottom: "1px solid var(--border)", gap: 12, flexWrap: "wrap",
            }}>
              <div>
                <strong><i className="fas fa-broom" /> {b.s}</strong>
                <div style={{ color: "var(--muted-foreground)", fontSize: "0.85rem" }}>
                  <i className="fas fa-user-tie" /> {b.p} · <i className="fas fa-clock" /> {b.d}
                </div>
              </div>
              <span style={{
                padding: "4px 12px", borderRadius: 999,
                background: "rgba(34,197,94,0.12)", color: "#15803d",
                fontSize: "0.8rem", fontWeight: 600,
              }}>{b.st}</span>
            </div>
          ))}
        </div>

        <div className="panel">
          <h3><i className="fas fa-bolt" /> Quick Actions</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12, marginTop: 12 }}>
            {[
              { i: "fa-plus", t: "New Booking", to: "/booking" as const },
              { i: "fa-heart", t: "Favourites" },
              { i: "fa-credit-card", t: "Payment Methods" },
              { i: "fa-gift", t: "Invite Friends" },
              { i: "fa-headset", t: "Support" },
            ].map((a) =>
              a.to ? (
                <Link key={a.t} to={a.to} className="btn btn-outline" style={{ justifyContent: "flex-start" }}>
                  <i className={`fas ${a.i}`} /> {a.t}
                </Link>
              ) : (
                <button key={a.t} className="btn btn-outline" style={{ justifyContent: "flex-start" }}>
                  <i className={`fas ${a.i}`} /> {a.t}
                </button>
              )
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
