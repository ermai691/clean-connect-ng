import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { RoleGuard } from "@/components/RoleGuard";
import { getUser, logout } from "@/lib/auth";
import logoMark from "@/assets/cleanconnect-mark.png.asset.json";
import {
  MONTH_LABELS,
  formatNaira,
  selectAdminStats,
  selectCategoryBreakdown,
  selectMonthlyBookings,
  selectMonthlyRevenue,
  setProviderStatus,
  usePlatformData,
  type Booking,
} from "@/lib/platform-data";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — CleanConnect" },
      {
        name: "description",
        content:
          "Central control room for CleanConnect: manage customers, providers, bookings, payments and reviews across Abuja.",
      },
      { property: "og:title", content: "Admin Dashboard — CleanConnect" },
      {
        property: "og:description",
        content: "Manage customers, providers, bookings, payments and reviews on CleanConnect.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  ssr: false,
  component: () => (
    <RoleGuard role="admin">
      <AdminDashboard />
    </RoleGuard>
  ),
});

const NAV = [
  { icon: "fa-calendar-check", label: "Bookings" },
  { icon: "fa-users", label: "Customers" },
  { icon: "fa-user-tie", label: "Providers" },
  { icon: "fa-broom", label: "Services" },
  { icon: "fa-credit-card", label: "Payments" },
  { icon: "fa-star", label: "Reviews" },
  { icon: "fa-chart-line", label: "Analytics" },
  { icon: "fa-comment-dots", label: "Messages", counter: "messages" as const },
  { icon: "fa-bell", label: "Notifications", counter: "notifications" as const },
  { icon: "fa-gear", label: "Settings" },
  { icon: "fa-circle-question", label: "Help & Support" },
];

const STATUS_TONE: Record<Booking["status"], string> = {
  pending: "warn",
  accepted: "info",
  confirmed: "info",
  ongoing: "info",
  completed: "ok",
  cancelled: "bad",
  rejected: "bad",
};

/* ---------------- charts (render real data, zero-safe) ---------------- */

function BarChart({ values, labels, money }: { values: number[]; labels: string[]; money?: boolean }) {
  const max = Math.max(...values, 0);
  const empty = max === 0;
  return (
    <div
      className="pd-bars"
      role="img"
      aria-label={empty ? "Chart with no data yet" : "Chart of monthly totals"}
    >
      {labels.map((l, i) => (
        <div className="pd-bar-col" key={l}>
          <div className="pd-bar-track">
            <div
              className="pd-bar-fill"
              style={{ height: empty ? "2px" : `${Math.max(4, ((values[i] ?? 0) / max) * 100)}%` }}
              title={money ? formatNaira(values[i] ?? 0) : String(values[i] ?? 0)}
            />
          </div>
          <span>{l}</span>
        </div>
      ))}
      {empty && <span className="pd-chart-empty">No data yet</span>}
    </div>
  );
}

function CategoryChart({ data }: { data: { category: string; pct: number }[] }) {
  if (!data.length) {
    return <EmptyState icon="fa-chart-pie" title="No service bookings yet." body="Category insights appear after the first booking." />;
  }
  return (
    <ul className="ad-legend">
      {data.map((d) => (
        <li key={d.category}>
          <span className="ad-legend-top">
            <strong>{d.category}</strong>
            <em>{d.pct.toFixed(0)}%</em>
          </span>
          <span className="pd-progress sm">
            <span style={{ width: `${d.pct}%` }} />
          </span>
        </li>
      ))}
    </ul>
  );
}

function EmptyState({ icon, title, body, cta }: { icon: string; title: string; body?: string; cta?: React.ReactNode }) {
  return (
    <div className="pd-empty">
      <span className="pd-empty-art" aria-hidden="true">
        <i className={`fas ${icon}`} />
      </span>
      <strong>{title}</strong>
      {body && <p>{body}</p>}
      {cta}
    </div>
  );
}

/* ---------------- page ---------------- */

function AdminDashboard() {
  const navigate = useNavigate();
  const data = usePlatformData();
  const stats = useMemo(() => selectAdminStats(data), [data]);
  const monthlyBookings = useMemo(() => selectMonthlyBookings(data), [data]);
  const monthlyRevenue = useMemo(() => selectMonthlyRevenue(data), [data]);
  const categories = useMemo(() => selectCategoryBreakdown(data), [data]);

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dashOpen, setDashOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState("Dashboard");
  const menuRef = useRef<HTMLDivElement>(null);

  const adminName = getUser()?.name?.split(" ")[0] ?? "Admin";

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 500);
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

  const signOut = async () => {
    await signOutAdmin();
    logout();
    navigate({ to: "/auth/$role", params: { role: "admin" }, replace: true });
  };

  const pendingProviders = data.providers.filter((p) => p.status === "pending");
  const q = query.trim().toLowerCase();
  const bookings = q
    ? data.bookings.filter((b) =>
        [b.customerName, b.service, b.providerName ?? "", b.reference].join(" ").toLowerCase().includes(q),
      )
    : data.bookings;

  const STAT_CARDS = [
    { icon: "fa-users", label: "Total Customers", value: stats.totalCustomers, tone: "blue" },
    { icon: "fa-user-tie", label: "Active Providers", value: stats.activeProviders, tone: "green" },
    { icon: "fa-calendar-day", label: "Today's Bookings", value: stats.todaysBookings, tone: "amber" },
    { icon: "fa-naira-sign", label: "Total Revenue", value: stats.totalRevenue, money: true, tone: "violet" },
    { icon: "fa-calendar-check", label: "Total Bookings", value: stats.totalBookings, tone: "blue" },
    { icon: "fa-circle-check", label: "Completed Bookings", value: stats.completedBookings, tone: "green" },
    { icon: "fa-hourglass-half", label: "Pending Bookings", value: stats.pendingBookings, tone: "amber" },
    { icon: "fa-circle-xmark", label: "Cancelled Bookings", value: stats.cancelledBookings, tone: "violet" },
    { icon: "fa-user-clock", label: "Pending Applications", value: stats.pendingProviders, tone: "amber" },
    { icon: "fa-star", label: "Total Reviews", value: stats.totalReviews, tone: "green" },
  ];

  const QUICK_ACTIONS: { icon: string; label: string; tone: string; to?: string }[] = [
    { icon: "fa-plus", label: "Add Service", tone: "blue", to: "/" },
    { icon: "fa-user-plus", label: "Add Provider", tone: "green", to: "/become-provider" },
    { icon: "fa-chart-simple", label: "View Reports", tone: "violet" },
    { icon: "fa-users-gear", label: "Manage Users", tone: "amber" },
    { icon: "fa-calendar-days", label: "Manage Bookings", tone: "blue", to: "/booking" },
    { icon: "fa-money-bill-transfer", label: "Manage Payments", tone: "green" },
  ];

  return (
    <div className={`pd-shell${collapsed ? " is-collapsed" : ""}${mobileOpen ? " is-mobile-open" : ""}`}>
      {/* Sidebar */}
      <aside className="pd-sidebar" aria-label="Admin navigation">
        <div className="pd-brand">
          <Link to="/" className="pd-brand-link" aria-label="CleanConnect home">
            <span className="pd-logo" aria-hidden="true">
              <img src={logoMark.url} alt="" />
            </span>
            <span className="pd-brand-text">
              <strong>
                Clean<span>Connect</span>
              </strong>
              <em>Admin Control Center</em>
            </span>
          </Link>
        </div>

        <nav className="pd-nav">
          <button
            type="button"
            className={`pd-nav-item${active === "Dashboard" ? " active" : ""}`}
            aria-expanded={dashOpen}
            onClick={() => {
              setActive("Dashboard");
              setDashOpen((o) => !o);
            }}
          >
            <i className="fas fa-gauge-high" aria-hidden="true" />
            <span>Dashboard</span>
            <i className={`fas fa-chevron-down cc-caret${dashOpen ? " open" : ""}`} aria-hidden="true" />
          </button>
          <div className={`cc-submenu${dashOpen ? " open" : ""}`}>
            <Link to="/admin" className="pd-nav-item pd-nav-sub">
              <i className="fas fa-shield-halved" aria-hidden="true" />
              <span>Admin Dashboard</span>
            </Link>
            <Link to="/customer" className="pd-nav-item pd-nav-sub">
              <i className="fas fa-user" aria-hidden="true" />
              <span>Customer Dashboard</span>
            </Link>
            <Link to="/provider" className="pd-nav-item pd-nav-sub">
              <i className="fas fa-user-tie" aria-hidden="true" />
              <span>Provider Dashboard</span>
            </Link>
          </div>

          {NAV.map((item) => (
            <button
              key={item.label}
              type="button"
              className={`pd-nav-item${active === item.label ? " active" : ""}`}
              title={item.label}
              aria-current={active === item.label ? "page" : undefined}
              onClick={() => {
                setActive(item.label);
                setMobileOpen(false);
              }}
            >
              <i className={`fas ${item.icon}`} aria-hidden="true" />
              <span>{item.label}</span>
              {item.counter && (
                <span className="pd-nav-badge">
                  {item.counter === "messages" ? stats.unreadMessages : stats.unreadNotifications}
                </span>
              )}
            </button>
          ))}

          <button type="button" className="pd-nav-item pd-logout" onClick={signOut}>
            <i className="fas fa-arrow-right-from-bracket" aria-hidden="true" />
            <span>Logout</span>
          </button>
        </nav>

        <div className="pd-side-card">
          <strong>Platform is live</strong>
          <p>Activity will appear here as customers and providers join CleanConnect.</p>
        </div>
      </aside>

      {mobileOpen && (
        <button type="button" className="pd-overlay" aria-label="Close navigation" onClick={() => setMobileOpen(false)} />
      )}

      {/* Main */}
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
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for bookings, customers, providers..."
              aria-label="Search bookings, customers and providers"
            />
          </div>

          <div className="pd-top-right">
            <button type="button" className="pd-icon-btn" aria-label={`Notifications, ${stats.unreadNotifications} unread`}>
              <i className="fas fa-bell" />
              <span className="pd-count">{stats.unreadNotifications}</span>
            </button>
            <button type="button" className="pd-icon-btn" aria-label={`Messages, ${stats.unreadMessages} unread`}>
              <i className="fas fa-comment-dots" />
              <span className="pd-count">{stats.unreadMessages}</span>
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
                  <i className="fas fa-user-shield" />
                </span>
                <span className="pd-profile-text">
                  <strong>Hello, {adminName}</strong>
                  <em>Administrator</em>
                </span>
                <i className="fas fa-chevron-down" aria-hidden="true" />
              </button>
              {menuOpen && (
                <div className="pd-menu" role="menu">
                  <button type="button" role="menuitem" className="pd-menu-item">
                    <i className="fas fa-id-card" /> My Profile
                  </button>
                  <button type="button" role="menuitem" className="pd-menu-item" onClick={() => setActive("Settings")}>
                    <i className="fas fa-gear" /> Settings
                  </button>
                  <button type="button" role="menuitem" className="pd-menu-item" onClick={signOut}>
                    <i className="fas fa-arrow-right-from-bracket" /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="pd-content">
          <section className="pd-welcome pd-animate">
            <div>
              <h1>Welcome Back, {adminName} 👋</h1>
              <p>Here's what's happening with your business today.</p>
            </div>
            <span className="pd-tag">
              <i className="fas fa-calendar" />{" "}
              {new Date().toLocaleDateString("en-NG", { month: "long", day: "numeric", year: "numeric" })}
            </span>
          </section>

          {/* Stats */}
          <section className="pd-stats" aria-label="Platform overview">
            {STAT_CARDS.map((s, i) =>
              loading ? (
                <div className="pd-card pd-skel-card" key={s.label}>
                  <div className="pd-skel pd-skel-icon" />
                  <div className="pd-skel pd-skel-line" />
                  <div className="pd-skel pd-skel-line short" />
                </div>
              ) : (
                <article className="pd-card pd-stat pd-animate" key={s.label} style={{ animationDelay: `${i * 40}ms` }}>
                  <span className={`pd-stat-icon tone-${s.tone}`} aria-hidden="true">
                    <i className={`fas ${s.icon}`} />
                  </span>
                  <div className="pd-stat-body">
                    <span className="pd-stat-label">{s.label}</span>
                    <span className="pd-stat-value">
                      {s.money ? formatNaira(s.value) : s.value.toLocaleString()}
                    </span>
                    <span className="pd-stat-foot">{s.value === 0 ? "No data yet" : "Updated live"}</span>
                  </div>
                </article>
              ),
            )}
          </section>

          {/* Analytics */}
          <section className="pd-grid pd-grid-3">
            <article className="pd-card pd-animate">
              <header className="pd-card-head">
                <h2>
                  <i className="fas fa-chart-column" /> Monthly Bookings
                </h2>
                <span className="pd-tag">This Year</span>
              </header>
              <BarChart values={monthlyBookings} labels={MONTH_LABELS} />
              {stats.totalBookings === 0 && <p className="ad-note">No booking data available yet.</p>}
            </article>

            <article className="pd-card pd-animate">
              <header className="pd-card-head">
                <h2>
                  <i className="fas fa-naira-sign" /> Revenue Overview
                </h2>
                <span className="pd-tag">{formatNaira(stats.totalRevenue)}</span>
              </header>
              <BarChart values={monthlyRevenue} labels={MONTH_LABELS} money />
              {stats.totalRevenue === 0 && <p className="ad-note">Revenue will appear after successful customer payments.</p>}
            </article>

            <article className="pd-card pd-animate">
              <header className="pd-card-head">
                <h2>
                  <i className="fas fa-chart-pie" /> Service Categories
                </h2>
              </header>
              <CategoryChart data={categories} />
            </article>
          </section>

          {/* Recent bookings + provider requests */}
          <section className="pd-grid pd-grid-2-1">
            <article className="pd-card pd-animate">
              <header className="pd-card-head">
                <h2>
                  <i className="fas fa-calendar-check" /> Recent Bookings
                </h2>
                <button type="button" className="pd-link" onClick={() => setActive("Bookings")}>
                  View all bookings
                </button>
              </header>
              {bookings.length === 0 ? (
                <EmptyState
                  icon="fa-calendar-xmark"
                  title={q ? "No matching bookings." : "No bookings yet."}
                  body={q ? "Try a different search term." : "Bookings will appear here when customers request a service."}
                />
              ) : (
                <div className="ad-table-wrap">
                  <table className="ad-table">
                    <caption className="sr-only">Recent bookings</caption>
                    <thead>
                      <tr>
                        <th scope="col">Customer</th>
                        <th scope="col">Service</th>
                        <th scope="col">Provider</th>
                        <th scope="col">Date</th>
                        <th scope="col">Amount</th>
                        <th scope="col">Status</th>
                        <th scope="col">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.slice(0, 8).map((b) => (
                        <tr key={b.id}>
                          <td data-label="Customer">{b.customerName}</td>
                          <td data-label="Service">{b.service}</td>
                          <td data-label="Provider">{b.providerName ?? "Unassigned"}</td>
                          <td data-label="Date">{new Date(b.scheduledFor || b.createdAt).toLocaleDateString("en-NG")}</td>
                          <td data-label="Amount">{formatNaira(b.amount)}</td>
                          <td data-label="Status">
                            <span className={`ad-badge ${STATUS_TONE[b.status]}`}>{b.status}</span>
                          </td>
                          <td data-label="Action">
                            <button type="button" className="pd-link">
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </article>

            <article className="pd-card pd-animate">
              <header className="pd-card-head">
                <h2>
                  <i className="fas fa-user-clock" /> Provider Requests
                </h2>
                <span className="pd-tag">{pendingProviders.length}</span>
              </header>
              {pendingProviders.length === 0 ? (
                <EmptyState
                  icon="fa-user-tie"
                  title="No pending provider applications."
                  body="Applications will appear here when professionals register."
                />
              ) : (
                <ul className="ad-requests">
                  {pendingProviders.map((p) => (
                    <li key={p.id}>
                      <span className="pd-avatar" aria-hidden="true">
                        <i className="fas fa-user-tie" />
                      </span>
                      <div>
                        <strong>{p.name}</strong>
                        <em>
                          {p.services.length ? p.services.join(", ") : "Cleaning services"}
                          {p.location ? ` · ${p.location}` : ""}
                        </em>
                        <em>
                          {p.rating ? `${p.rating.toFixed(1)}★` : "No rating yet"} ·{" "}
                          {p.verified ? "Verified" : "Awaiting verification"}
                        </em>
                      </div>
                      <div className="ad-req-actions">
                        <button
                          type="button"
                          className="ad-btn ok"
                          onClick={() => setProviderStatus(p.id, "approved")}
                          aria-label={`Approve ${p.name}`}
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          className="ad-btn bad"
                          onClick={() => setProviderStatus(p.id, "rejected")}
                          aria-label={`Reject ${p.name}`}
                        >
                          Reject
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </article>
          </section>

          {/* Reviews + activity */}
          <section className="pd-grid pd-grid-2">
            <article className="pd-card pd-animate">
              <header className="pd-card-head">
                <h2>
                  <i className="fas fa-star" /> Latest Reviews
                </h2>
              </header>
              {data.reviews.length === 0 ? (
                <EmptyState
                  icon="fa-star-half-stroke"
                  title="No reviews yet."
                  body="Customer reviews will appear after completed services."
                />
              ) : (
                <ul className="ad-reviews">
                  {data.reviews.slice(0, 5).map((r) => (
                    <li key={r.id}>
                      <div>
                        <strong>{r.customerName}</strong>
                        <em>
                          {r.service} · {r.providerName}
                        </em>
                      </div>
                      <span className="ad-stars" aria-label={`${r.rating} out of 5`}>
                        {"★".repeat(Math.round(r.rating))}
                      </span>
                      <p>{r.comment}</p>
                    </li>
                  ))}
                </ul>
              )}
            </article>

            <article className="pd-card pd-animate">
              <header className="pd-card-head">
                <h2>
                  <i className="fas fa-clock-rotate-left" /> Recent Activity
                </h2>
              </header>
              {data.activity.length === 0 ? (
                <EmptyState icon="fa-wave-square" title="No recent activity." body="Platform events will be logged here." />
              ) : (
                <ul className="ad-activity">
                  {data.activity.slice(0, 8).map((a) => (
                    <li key={a.id}>
                      <span className="pd-stat-icon tone-blue" aria-hidden="true">
                        <i className="fas fa-bolt" />
                      </span>
                      <div>
                        <strong>{a.title}</strong>
                        {a.detail && <em>{a.detail}</em>}
                      </div>
                      <time dateTime={a.createdAt}>{new Date(a.createdAt).toLocaleString("en-NG")}</time>
                    </li>
                  ))}
                </ul>
              )}
            </article>
          </section>

          {/* Customers + providers directories */}
          <section className="pd-grid pd-grid-2">
            <article className="pd-card pd-animate">
              <header className="pd-card-head">
                <h2>
                  <i className="fas fa-users" /> Customers
                </h2>
                <span className="pd-tag">{stats.totalCustomers}</span>
              </header>
              {data.customers.length === 0 ? (
                <EmptyState icon="fa-user-plus" title="No customers yet." body="Customers will appear here when they create an account." />
              ) : (
                <ul className="ad-simple-list">
                  {data.customers.slice(0, 6).map((c) => (
                    <li key={c.id}>
                      <div>
                        <strong>{c.name}</strong>
                        <em>{c.email}</em>
                      </div>
                      <span className={`ad-badge ${c.status === "active" ? "ok" : "warn"}`}>{c.status}</span>
                    </li>
                  ))}
                </ul>
              )}
            </article>

            <article className="pd-card pd-animate">
              <header className="pd-card-head">
                <h2>
                  <i className="fas fa-user-tie" /> Providers
                </h2>
                <span className="pd-tag">{stats.totalProviders}</span>
              </header>
              {data.providers.length === 0 ? (
                <EmptyState
                  icon="fa-user-tie"
                  title="No providers yet."
                  body="Provider applications will appear here when professionals register."
                  cta={
                    <Link to="/become-provider" className="pd-btn pd-btn-primary pd-ripple">
                      Invite a provider
                    </Link>
                  }
                />
              ) : (
                <ul className="ad-simple-list">
                  {data.providers.slice(0, 6).map((p) => (
                    <li key={p.id}>
                      <div>
                        <strong>{p.name}</strong>
                        <em>{p.email}</em>
                      </div>
                      <span className={`ad-badge ${p.status === "approved" ? "ok" : p.status === "pending" ? "warn" : "bad"}`}>
                        {p.status}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </article>
          </section>

          {/* Quick actions */}
          <section className="pd-animate">
            <h2 className="pd-section-title">
              <i className="fas fa-bolt" /> Quick Actions
            </h2>
            <div className="pd-actions">
              {QUICK_ACTIONS.map((a) =>
                a.to ? (
                  <Link key={a.label} to={a.to} className="pd-action pd-ripple">
                    <span className={`pd-stat-icon tone-${a.tone}`} aria-hidden="true">
                      <i className={`fas ${a.icon}`} />
                    </span>
                    <strong>{a.label}</strong>
                    <i className="fas fa-arrow-right" aria-hidden="true" />
                  </Link>
                ) : (
                  <button
                    key={a.label}
                    type="button"
                    className="pd-action pd-ripple"
                    onClick={() =>
                      setActive(
                        a.label === "View Reports"
                          ? "Analytics"
                          : a.label === "Manage Users"
                            ? "Customers"
                            : "Payments",
                      )
                    }
                  >
                    <span className={`pd-stat-icon tone-${a.tone}`} aria-hidden="true">
                      <i className={`fas ${a.icon}`} />
                    </span>
                    <strong>{a.label}</strong>
                    <i className="fas fa-arrow-right" aria-hidden="true" />
                  </button>
                ),
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
