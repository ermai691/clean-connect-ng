import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

export const Route = createFileRoute("/provider")({
  head: () => ({
    meta: [
      { title: "Provider Dashboard — CleanConnect" },
      {
        name: "description",
        content:
          "Manage job requests, earnings, wallet, schedule and reviews as a CleanConnect cleaning provider in Abuja.",
      },
      { property: "og:title", content: "Provider Dashboard — CleanConnect" },
      {
        property: "og:description",
        content: "Track job requests, earnings and performance as a CleanConnect provider.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProviderDashboard,
});

/* ---------------- Sidebar nav model ---------------- */
const NAV = [
  { icon: "fa-gauge-high", label: "Dashboard", active: true },
  { icon: "fa-inbox", label: "Job Requests", badge: 0 },
  { icon: "fa-briefcase", label: "My Jobs" },
  { icon: "fa-calendar-days", label: "Schedule" },
  { icon: "fa-sack-dollar", label: "Earnings" },
  { icon: "fa-wallet", label: "Wallet" },
  { icon: "fa-comment-dots", label: "Messages", badge: 0 },
  { icon: "fa-star", label: "Reviews" },
  { icon: "fa-bell", label: "Notifications" },
  { icon: "fa-chart-line", label: "Analytics" },
  { icon: "fa-id-card", label: "Profile" },
  { icon: "fa-gear", label: "Settings" },
  { icon: "fa-circle-question", label: "Help & Support" },
];

/* ---------------- Zero-state metrics (wired to real data later) ---------------- */
const STATS = [
  { icon: "fa-inbox", label: "Available Job Requests", value: 0, tone: "blue", foot: "New requests appear here" },
  { icon: "fa-circle-check", label: "Jobs Completed", value: 0, tone: "green", foot: "All time" },
  { icon: "fa-coins", label: "Today's Earnings", value: 0, money: true, tone: "amber", foot: "Today" },
  { icon: "fa-sack-dollar", label: "Monthly Earnings", value: 0, money: true, tone: "violet", foot: "This month" },
  { icon: "fa-wallet", label: "Wallet Balance", value: 0, money: true, tone: "blue", foot: "Available to withdraw" },
  { icon: "fa-star", label: "Average Rating", value: 0, rating: true, tone: "amber", foot: "No ratings yet" },
  { icon: "fa-comment-dots", label: "Pending Reviews", value: 0, tone: "green", foot: "Nothing to respond to" },
  { icon: "fa-users", label: "Total Customers", value: 0, tone: "violet", foot: "Repeat + new" },
];

const PERFORMANCE = [
  { label: "Jobs Accepted", value: "0%", pct: 0 },
  { label: "Completion Rate", value: "0%", pct: 0 },
  { label: "Customer Satisfaction", value: "0%", pct: 0 },
  { label: "Average Response Time", value: "0 mins", pct: 0 },
  { label: "Cancellation Rate", value: "0%", pct: 0 },
];

const VERIFICATION = [
  "Identity Verified",
  "Background Check Completed",
  "Bank Account Verified",
  "Email Verified",
  "Phone Verified",
];

const CHECKLIST = [
  { label: "Upload Profile Picture", done: true },
  { label: "Add Bio", done: true },
  { label: "Select Services", done: true },
  { label: "Set Availability", done: true },
  { label: "Add Work Photos", done: false },
  { label: "Verify Identity", done: true },
  { label: "Add Bank Details", done: true },
  { label: "Complete Profile", done: false },
];

const QUICK_ACTIONS = [
  { icon: "fa-magnifying-glass", label: "Browse Available Jobs", tone: "blue" },
  { icon: "fa-calendar-plus", label: "Update Availability", tone: "green" },
  { icon: "fa-user-pen", label: "Edit Profile", tone: "violet" },
  { icon: "fa-file-arrow-up", label: "Upload Certificates", tone: "amber" },
  { icon: "fa-chart-simple", label: "View Earnings", tone: "blue" },
  { icon: "fa-wallet", label: "Open Wallet", tone: "green" },
];

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const SLOTS = ["Morning", "Afternoon", "Evening"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const AI_TIPS = [
  "Complete your profile to appear higher in search.",
  "Upload work photos — providers with photos get 3x more requests.",
  "Accept your first booking to unlock reviews.",
  "Maintain a high response rate (under 5 mins).",
];

/* ---------------- Animated counter (starts at zero) ---------------- */
function useCountUp(target: number, duration = 900) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (target === 0) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      setValue(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
}

function StatValue({ stat }: { stat: (typeof STATS)[number] }) {
  const v = useCountUp(stat.value);
  if (stat.rating) return <>{v.toFixed(1)} <i className="fas fa-star pd-star" /></>;
  if (stat.money) return <>₦{Math.round(v).toLocaleString()}</>;
  return <>{Math.round(v).toLocaleString()}</>;
}

/* ---------------- Zero-value charts ---------------- */
function ZeroBars({ labels }: { labels: string[] }) {
  return (
    <div className="pd-bars" role="img" aria-label="Chart with no data yet — all values are zero">
      {labels.map((l) => (
        <div className="pd-bar-col" key={l}>
          <div className="pd-bar-track">
            <div className="pd-bar-fill" style={{ height: "2px" }} />
          </div>
          <span>{l}</span>
        </div>
      ))}
      <span className="pd-chart-empty">No data yet</span>
    </div>
  );
}

function ZeroLine({ labels }: { labels: string[] }) {
  return (
    <div className="pd-line-wrap" role="img" aria-label="Growth chart with no data yet">
      <svg viewBox="0 0 300 90" preserveAspectRatio="none" className="pd-line">
        {[0, 1, 2, 3].map((i) => (
          <line key={i} x1="0" x2="300" y1={i * 28 + 2} y2={i * 28 + 2} className="pd-gridline" />
        ))}
        <polyline points="0,86 60,86 120,86 180,86 240,86 300,86" className="pd-line-path" />
      </svg>
      <div className="pd-line-labels">
        {labels.map((l) => (
          <span key={l}>{l}</span>
        ))}
      </div>
      <span className="pd-chart-empty">No data yet</span>
    </div>
  );
}

function EmptyState({
  icon,
  title,
  body,
  cta,
}: {
  icon: string;
  title: string;
  body?: string;
  cta?: string;
}) {
  return (
    <div className="pd-empty">
      <span className="pd-empty-art" aria-hidden="true">
        <i className={`fas ${icon}`} />
      </span>
      <strong>{title}</strong>
      {body && <p>{body}</p>}
      {cta && (
        <button type="button" className="pd-btn pd-btn-primary pd-ripple">
          {cta}
        </button>
      )}
    </div>
  );
}

/* ---------------- Page ---------------- */
function ProviderDashboard() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [online, setOnline] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dashOpen, setDashOpen] = useState(true);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 650);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        setMobileOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const profilePct = 85;

  return (
    <div className={`pd-shell${collapsed ? " is-collapsed" : ""}${mobileOpen ? " is-mobile-open" : ""}`}>
      {/* ---------- Sidebar ---------- */}
      <aside className="pd-sidebar" aria-label="Provider navigation">
        <div className="pd-brand">
          <Link to="/" className="pd-brand-link" aria-label="CleanConnect home">
            <span className="pd-logo" aria-hidden="true">
              <i className="fas fa-broom" />
            </span>
            <span className="pd-brand-text">
              <strong>
                Clean<span>Connect</span>
              </strong>
              <em>Clean Homes, Happy Lives</em>
            </span>
          </Link>
        </div>

        <nav className="pd-nav">
          <button
            type="button"
            className="pd-nav-item active"
            aria-expanded={dashOpen}
            onClick={() => setDashOpen((o) => !o)}
            title="Dashboard"
          >
            <i className="fas fa-gauge-high" aria-hidden="true" />
            <span>Dashboard</span>
            <i className={`fas fa-chevron-down cc-caret${dashOpen ? " open" : ""}`} aria-hidden="true" />
          </button>
          <div className={`cc-submenu${dashOpen ? " open" : ""}`}>
            <Link to="/customer" className="pd-nav-item pd-nav-sub">
              <i className="fas fa-user" aria-hidden="true" />
              <span>Customer Dashboard</span>
            </Link>
            <Link to="/provider" className="pd-nav-item pd-nav-sub">
              <i className="fas fa-user-tie" aria-hidden="true" />
              <span>Provider Dashboard</span>
            </Link>
            <Link to="/admin" className="pd-nav-item pd-nav-sub">
              <i className="fas fa-shield-halved" aria-hidden="true" />
              <span>Admin Dashboard</span>
            </Link>
          </div>
          {NAV.filter((item) => item.label !== "Dashboard").map((item) => (
            <button
              key={item.label}
              type="button"
              className="pd-nav-item"
              title={item.label}
            >
              <i className={`fas ${item.icon}`} aria-hidden="true" />
              <span>{item.label}</span>
              {typeof item.badge === "number" && <span className="pd-nav-badge">{item.badge}</span>}
            </button>
          ))}
          <button type="button" className="pd-nav-item pd-logout">
            <i className="fas fa-arrow-right-from-bracket" aria-hidden="true" />
            <span>Logout</span>
          </button>
        </nav>

        <div className="pd-side-card">
          <strong>Grow faster</strong>
          <p>Complete your profile to unlock more job requests.</p>
          <button type="button" className="pd-btn pd-btn-light pd-ripple">
            Complete Profile
          </button>
        </div>
      </aside>

      {mobileOpen && (
        <button
          type="button"
          className="pd-overlay"
          aria-label="Close navigation"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ---------- Main ---------- */}
      <div className="pd-main">
        <header className="pd-topbar">
          <button
            type="button"
            className="pd-icon-btn pd-burger"
            aria-label="Toggle navigation"
            onClick={() => {
              if (window.innerWidth <= 1024) setMobileOpen((v) => !v);
              else setCollapsed((v) => !v);
            }}
          >
            <i className="fas fa-bars" />
          </button>

          <div className="pd-search">
            <i className="fas fa-magnifying-glass" aria-hidden="true" />
            <input type="search" placeholder="Search for jobs, customers, payouts..." aria-label="Search dashboard" />
          </div>

          <div className="pd-top-right">
            <button
              type="button"
              className={`pd-toggle${online ? " on" : ""}`}
              onClick={() => setOnline((v) => !v)}
              aria-pressed={online}
              aria-label={online ? "You are online. Go offline" : "You are offline. Go online"}
            >
              <span className="pd-toggle-dot" />
              {online ? "Online" : "Offline"}
            </button>

            <button type="button" className="pd-icon-btn" aria-label="Notifications, none new">
              <i className="fas fa-bell" />
              <span className="pd-count">0</span>
            </button>
            <button type="button" className="pd-icon-btn" aria-label="Messages, none new">
              <i className="fas fa-comment-dots" />
              <span className="pd-count">0</span>
            </button>

            <div className="pd-profile" ref={menuRef}>
              <button
                type="button"
                className="pd-profile-btn"
                onClick={() => setMenuOpen((v) => !v)}
                aria-expanded={menuOpen}
                aria-haspopup="menu"
              >
                <span className="pd-avatar" aria-hidden="true">
                  <i className="fas fa-user" />
                </span>
                <span className="pd-profile-text">
                  <strong>
                    Hello, Provider
                    <i className="fas fa-circle-check pd-verified" title="Verified provider" />
                  </strong>
                  <em>Cleaning Professional</em>
                </span>
                <i className="fas fa-chevron-down" aria-hidden="true" />
              </button>
              {menuOpen && (
                <div className="pd-menu" role="menu">
                  {[
                    { i: "fa-id-card", t: "My Profile" },
                    { i: "fa-calendar-days", t: "Availability" },
                    { i: "fa-wallet", t: "Wallet" },
                    { i: "fa-gear", t: "Settings" },
                  ].map((m) => (
                    <button key={m.t} type="button" role="menuitem" className="pd-menu-item">
                      <i className={`fas ${m.i}`} /> {m.t}
                    </button>
                  ))}
                  <Link to="/" className="pd-menu-item" role="menuitem">
                    <i className="fas fa-arrow-right-from-bracket" /> Logout
                  </Link>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="pd-content">
          {/* Welcome */}
          <section className="pd-welcome pd-animate">
            <div>
              <h1>Welcome back, Provider 👋</h1>
              <p>Start accepting jobs and grow your cleaning business with CleanConnect.</p>
            </div>
            <button type="button" className="pd-btn pd-btn-primary pd-ripple">
              <i className="fas fa-inbox" /> Browse Job Requests
            </button>
          </section>

          {/* Stats */}
          <section className="pd-stats" aria-label="Account overview">
            {STATS.map((s, i) =>
              loading ? (
                <div className="pd-card pd-skel-card" key={s.label}>
                  <div className="pd-skel pd-skel-icon" />
                  <div className="pd-skel pd-skel-line" />
                  <div className="pd-skel pd-skel-line short" />
                </div>
              ) : (
                <article className="pd-card pd-stat pd-animate" key={s.label} style={{ animationDelay: `${i * 45}ms` }}>
                  <span className={`pd-stat-icon tone-${s.tone}`} aria-hidden="true">
                    <i className={`fas ${s.icon}`} />
                  </span>
                  <div className="pd-stat-body">
                    <span className="pd-stat-label">{s.label}</span>
                    <span className="pd-stat-value">
                      <StatValue stat={s} />
                    </span>
                    <span className="pd-stat-foot">{s.foot}</span>
                  </div>
                </article>
              ),
            )}
          </section>

          {/* Row: jobs + wallet */}
          <section className="pd-grid pd-grid-2-1">
            <article className="pd-card pd-animate">
              <header className="pd-card-head">
                <h2>
                  <i className="fas fa-inbox" /> Job Requests
                </h2>
                <button type="button" className="pd-link">
                  View all
                </button>
              </header>
              <EmptyState
                icon="fa-clipboard-list"
                title="No jobs yet."
                body="Accept your first booking to start earning."
                cta="Browse Job Requests"
              />
            </article>

            <article className="pd-card pd-animate">
              <header className="pd-card-head">
                <h2>
                  <i className="fas fa-wallet" /> Wallet
                </h2>
              </header>
              <div className="pd-wallet">
                <span className="pd-wallet-label">Wallet Balance</span>
                <strong className="pd-wallet-value">₦0.00</strong>
                <div className="pd-wallet-rows">
                  <span>
                    Pending Withdrawal <b>₦0.00</b>
                  </span>
                  <span>
                    Total Withdrawn <b>₦0.00</b>
                  </span>
                </div>
                <button type="button" className="pd-btn pd-btn-light" disabled>
                  <i className="fas fa-money-bill-transfer" /> Withdraw Earnings
                </button>
                <p className="pd-wallet-note">You haven't earned any money yet.</p>
              </div>
            </article>
          </section>

          {/* Row: recent jobs + schedule */}
          <section className="pd-grid pd-grid-2">
            <article className="pd-card pd-animate">
              <header className="pd-card-head">
                <h2>
                  <i className="fas fa-briefcase" /> Recent Jobs
                </h2>
              </header>
              <EmptyState icon="fa-broom" title="No completed jobs yet." cta="Accept First Job" />
            </article>
            <article className="pd-card pd-animate">
              <header className="pd-card-head">
                <h2>
                  <i className="fas fa-calendar-day" /> Upcoming Schedule
                </h2>
              </header>
              <EmptyState icon="fa-calendar-xmark" title="No upcoming bookings." cta="View Job Requests" />
            </article>
          </section>

          {/* Earnings overview */}
          <section className="pd-grid pd-grid-2-1">
            <article className="pd-card pd-animate">
              <header className="pd-card-head">
                <h2>
                  <i className="fas fa-chart-column" /> Earnings Overview
                </h2>
                <span className="pd-tag">Weekly</span>
              </header>
              <div className="pd-earn-grid">
                {[
                  ["Today's Earnings", "₦0"],
                  ["Weekly Earnings", "₦0"],
                  ["Monthly Earnings", "₦0"],
                  ["Yearly Earnings", "₦0"],
                ].map(([l, v]) => (
                  <div className="pd-earn-cell" key={l}>
                    <span>{l}</span>
                    <strong>{v}</strong>
                  </div>
                ))}
              </div>
              <ZeroBars labels={DAYS} />
            </article>

            <article className="pd-card pd-animate">
              <header className="pd-card-head">
                <h2>
                  <i className="fas fa-shield-halved" /> Verification Status
                </h2>
              </header>
              <div className="pd-verify-badge">
                <i className="fas fa-circle-check" /> Application Approved
              </div>
              <ul className="pd-verify-list">
                {VERIFICATION.map((v) => (
                  <li key={v}>
                    <i className="fas fa-circle-check" aria-hidden="true" /> {v}
                  </li>
                ))}
              </ul>
              <div className="pd-progress-head">
                <span>Profile Completion</span>
                <strong>{profilePct}%</strong>
              </div>
              <div
                className="pd-progress"
                role="progressbar"
                aria-valuenow={profilePct}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Profile completion"
              >
                <span style={{ width: `${profilePct}%` }} />
              </div>
            </article>
          </section>

          {/* Performance */}
          <section className="pd-card pd-animate">
            <header className="pd-card-head">
              <h2>
                <i className="fas fa-gauge-high" /> Performance Analytics
              </h2>
            </header>
            <div className="pd-perf">
              {PERFORMANCE.map((p) => (
                <div className="pd-perf-cell" key={p.label}>
                  <div className="pd-perf-top">
                    <span>{p.label}</span>
                    <strong>{p.value}</strong>
                  </div>
                  <div className="pd-progress sm">
                    <span style={{ width: `${p.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Charts */}
          <section className="pd-grid pd-grid-2">
            <article className="pd-card pd-animate">
              <header className="pd-card-head">
                <h2>
                  <i className="fas fa-chart-column" /> Monthly Earnings
                </h2>
              </header>
              <ZeroBars labels={MONTHS.slice(0, 8)} />
            </article>
            <article className="pd-card pd-animate">
              <header className="pd-card-head">
                <h2>
                  <i className="fas fa-chart-line" /> Customer Growth
                </h2>
              </header>
              <ZeroLine labels={MONTHS.slice(0, 6)} />
            </article>
            <article className="pd-card pd-animate">
              <header className="pd-card-head">
                <h2>
                  <i className="fas fa-chart-simple" /> Completed Jobs
                </h2>
              </header>
              <ZeroBars labels={DAYS} />
            </article>
            <article className="pd-card pd-animate">
              <header className="pd-card-head">
                <h2>
                  <i className="fas fa-list-check" /> Profile Completion Checklist
                </h2>
                <span className="pd-tag">
                  {CHECKLIST.filter((c) => c.done).length}/{CHECKLIST.length}
                </span>
              </header>
              <ul className="pd-check">
                {CHECKLIST.map((c) => (
                  <li key={c.label} className={c.done ? "done" : ""}>
                    <i className={`fas ${c.done ? "fa-circle-check" : "fa-circle"}`} aria-hidden="true" />
                    {c.label}
                  </li>
                ))}
              </ul>
            </article>
          </section>

          {/* Calendar */}
          <section className="pd-card pd-animate">
            <header className="pd-card-head">
              <h2>
                <i className="fas fa-calendar-days" /> Weekly Availability
              </h2>
              <button type="button" className="pd-link">
                Edit availability
              </button>
            </header>
            <div className="pd-cal" role="table" aria-label="Weekly availability calendar, currently empty">
              <div className="pd-cal-row head" role="row">
                <span role="columnheader" />
                {DAYS.map((d) => (
                  <span key={d} role="columnheader">
                    {d}
                  </span>
                ))}
              </div>
              {SLOTS.map((s) => (
                <div className="pd-cal-row" role="row" key={s}>
                  <span className="pd-cal-slot" role="rowheader">
                    {s}
                  </span>
                  {DAYS.map((d) => (
                    <span className="pd-cal-cell" role="cell" key={d + s} aria-label={`${d} ${s}: not set`} />
                  ))}
                </div>
              ))}
            </div>
          </section>

          {/* Quick actions */}
          <section className="pd-animate">
            <h2 className="pd-section-title">
              <i className="fas fa-bolt" /> Quick Actions
            </h2>
            <div className="pd-actions">
              {QUICK_ACTIONS.map((a) => (
                <button type="button" className="pd-action pd-ripple" key={a.label}>
                  <span className={`pd-stat-icon tone-${a.tone}`} aria-hidden="true">
                    <i className={`fas ${a.icon}`} />
                  </span>
                  <strong>{a.label}</strong>
                  <i className="fas fa-arrow-right" aria-hidden="true" />
                </button>
              ))}
            </div>
          </section>

          {/* Reviews / Messages / Notifications */}
          <section className="pd-grid pd-grid-3">
            <article className="pd-card pd-animate">
              <header className="pd-card-head">
                <h2>
                  <i className="fas fa-star" /> Reviews
                </h2>
              </header>
              <EmptyState
                icon="fa-star-half-stroke"
                title="No reviews yet."
                body="Complete your first job to receive customer ratings."
              />
            </article>
            <article className="pd-card pd-animate">
              <header className="pd-card-head">
                <h2>
                  <i className="fas fa-comment-dots" /> Messages
                </h2>
              </header>
              <EmptyState
                icon="fa-comments"
                title="No messages yet."
                body="Customer conversations will appear here after accepting a booking."
              />
            </article>
            <article className="pd-card pd-animate">
              <header className="pd-card-head">
                <h2>
                  <i className="fas fa-bell" /> Notifications
                </h2>
              </header>
              <EmptyState icon="fa-bell-slash" title="You're all caught up." body="No new notifications." />
            </article>
          </section>

          {/* Timeline + AI */}
          <section className="pd-grid pd-grid-2-1">
            <article className="pd-card pd-animate">
              <header className="pd-card-head">
                <h2>
                  <i className="fas fa-clock-rotate-left" /> Activity Timeline
                </h2>
              </header>
              <EmptyState
                icon="fa-timeline"
                title="No recent activity."
                body="Once you start working, your activities will appear here."
              />
            </article>

            <article className="pd-card pd-ai pd-animate">
              <header className="pd-card-head">
                <h2>
                  <i className="fas fa-wand-magic-sparkles" /> CleanConnect AI
                </h2>
              </header>
              <p className="pd-ai-msg">Hello! I'm here to help you grow your cleaning business.</p>
              <ul className="pd-ai-tips">
                {AI_TIPS.map((t) => (
                  <li key={t}>
                    <i className="fas fa-lightbulb" aria-hidden="true" /> {t}
                  </li>
                ))}
              </ul>
              <button type="button" className="pd-btn pd-btn-light pd-ripple">
                <i className="fas fa-comment" /> Ask the assistant
              </button>
            </article>
          </section>

          <footer className="pd-footer">
            <span>© 2026 CleanConnect. All Rights Reserved.</span>
            <div>
              <Link to="/">Home</Link>
              <Link to="/become-provider">Earn with CleanConnect</Link>
              <Link to="/customer">Customer view</Link>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
