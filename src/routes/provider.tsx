import { createFileRoute, Link } from "@tanstack/react-router";
import { Nav, Footer } from "@/components/Nav";

export const Route = createFileRoute("/provider")({
  head: () => ({
    meta: [
      { title: "Provider Dashboard — CleanConnect" },
      { name: "description", content: "Manage jobs, earnings and schedule as a CleanConnect provider." },
    ],
  }),
  component: ProviderDashboard,
});

const STATS = [
  { icon: "fa-briefcase", label: "Jobs This Week", value: "12", color: "#2563EB" },
  { icon: "fa-star", label: "Rating", value: "4.9", color: "#F59E0B" },
  { icon: "fa-wallet", label: "Earnings (₦)", value: "184,500", color: "#22C55E" },
  { icon: "fa-clock", label: "Hours Booked", value: "38h", color: "#8B5CF6" },
];

const JOBS = [
  { s: "House Cleaning", c: "Mrs. Aisha O.", d: "Today · 2:00 PM", a: "Maitama", st: "En route" },
  { s: "Laundry Pickup", c: "David N.", d: "Today · 5:30 PM", a: "Wuse 2", st: "Scheduled" },
  { s: "Deep Cleaning", c: "Chika A.", d: "Tomorrow · 9:00 AM", a: "Gwarinpa", st: "Confirmed" },
];

function ProviderDashboard() {
  return (
    <div className="page-shell">
      <Nav />
      <div className="page-hero">
        <div className="container-x">
          <span className="chip"><i className="fas fa-user-tie" /> Provider Console</span>
          <h1>Provider Dashboard</h1>
          <p>Track jobs, earnings, ratings and your weekly schedule.</p>
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
          <h3><i className="fas fa-calendar-day" /> Upcoming Jobs</h3>
          <p className="muted">Your next scheduled bookings.</p>
          {JOBS.map((j) => (
            <div key={j.s + j.c} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "14px 0", borderBottom: "1px solid var(--border)", gap: 12, flexWrap: "wrap",
            }}>
              <div>
                <strong><i className="fas fa-broom" /> {j.s}</strong>
                <div style={{ color: "var(--muted-foreground)", fontSize: "0.85rem" }}>
                  <i className="fas fa-user" /> {j.c} · <i className="fas fa-clock" /> {j.d} · <i className="fas fa-location-dot" /> {j.a}
                </div>
              </div>
              <span style={{
                padding: "4px 12px", borderRadius: 999,
                background: "rgba(37,99,235,0.12)", color: "#1d4ed8",
                fontSize: "0.8rem", fontWeight: 600,
              }}>{j.st}</span>
            </div>
          ))}
        </div>

        <div className="panel">
          <h3><i className="fas fa-bolt" /> Quick Actions</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12, marginTop: 12 }}>
            {[
              { i: "fa-calendar-plus", t: "Set Availability" },
              { i: "fa-money-bill-transfer", t: "Withdraw Earnings" },
              { i: "fa-id-card", t: "My Profile" },
              { i: "fa-star", t: "Reviews" },
              { i: "fa-headset", t: "Support" },
            ].map((a) => (
              <button key={a.t} className="btn btn-outline" style={{ justifyContent: "flex-start" }}>
                <i className={`fas ${a.i}`} /> {a.t}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 16 }}>
          <Link to="/become-provider" className="btn btn-primary"><i className="fas fa-rocket" /> Complete Onboarding</Link>
          <Link to="/customer" className="btn btn-ghost"><i className="fas fa-user" /> Customer view</Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}
