import { Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import logoMark from "@/assets/cleanconnect-mark.png.asset.json";
import { currentCustomer, signOutCustomer } from "@/lib/customer-auth";
import { useCustomerData, customerStats, markNotificationsRead } from "@/lib/customer-data";

const NAV = [
  { to: "/customer", icon: "fa-gauge-high", label: "Dashboard", exact: true },
  { to: "/customer/bookings", icon: "fa-calendar-check", label: "My Bookings" },
  { to: "/customer/book", icon: "fa-circle-plus", label: "Book a Service" },
  { to: "/customer/messages", icon: "fa-comment-dots", label: "Messages", badge: "messages" },
  { to: "/customer/payments", icon: "fa-credit-card", label: "Payments" },
  { to: "/customer/reviews", icon: "fa-star", label: "Reviews" },
  { to: "/customer/profile", icon: "fa-user", label: "My Profile" },
  { to: "/customer/addresses", icon: "fa-location-dot", label: "Addresses" },
  { to: "/customer/support", icon: "fa-headset", label: "Help & Support" },
  { to: "/customer/settings", icon: "fa-gear", label: "Settings" },
] as const;

export function EmptyState({
  icon,
  title,
  body,
  action,
}: {
  icon: string;
  title: string;
  body?: string;
  action?: { label: string; to?: string; onClick?: () => void };
}) {
  return (
    <div className="pd-empty">
      <span className="pd-empty-art" aria-hidden="true">
        <i className={`fas ${icon}`} />
      </span>
      <strong>{title}</strong>
      {body && <p>{body}</p>}
      {action &&
        (action.to ? (
          <Link to={action.to} className="pd-btn pd-btn-primary">
            {action.label}
          </Link>
        ) : (
          <button type="button" className="pd-btn pd-btn-primary" onClick={action.onClick}>
            {action.label}
          </button>
        ))}
    </div>
  );
}

export function Skeletons({ rows = 3 }: { rows?: number }) {
  return (
    <div className="pd-skel-card" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading…</span>
      {Array.from({ length: rows }).map((_, i) => (
        <div className="pd-skel pd-skel-line" key={i} style={{ height: 16 }} />
      ))}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message?: string; onRetry: () => void }) {
  return (
    <div className="pd-empty" role="alert">
      <span className="pd-empty-art" aria-hidden="true">
        <i className="fas fa-triangle-exclamation" />
      </span>
      <strong>Something went wrong.</strong>
      <p>{message ?? "We couldn't load your data."}</p>
      <button type="button" className="pd-btn pd-btn-primary" onClick={onRetry}>
        Try Again
      </button>
    </div>
  );
}

export function CustomerShell() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [checking, setChecking] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const { data, reload } = useCustomerData();
  const stats = customerStats(data);
  const name = data.profile?.full_name || "there";

  useEffect(() => {
    let active = true;
    void currentCustomer().then((c) => {
      if (!active) return;
      if (!c) navigate({ to: "/auth/$role", params: { role: "customer" }, replace: true });
      setChecking(false);
    });
    return () => {
      active = false;
    };
  }, [navigate]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileOpen(false);
        setMenuOpen(false);
        setBellOpen(false);
      }
    };
    const onDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
    };
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (mobileOpen) closeRef.current?.focus();
  }, [mobileOpen]);

  const onLogout = async () => {
    await signOutCustomer();
    navigate({ to: "/", replace: true });
  };

  if (checking) {
    return (
      <div className="auth-shell">
        <div className="auth-card" style={{ textAlign: "center" }}>
          <p className="sub">
            <i className="fas fa-spinner fa-spin" /> Checking your access…
          </p>
        </div>
      </div>
    );
  }

  const isActive = (to: string, exact?: boolean) => (exact ? pathname === to : pathname.startsWith(to));

  return (
    <div className={`pd-shell${collapsed ? " is-collapsed" : ""}${mobileOpen ? " is-mobile-open" : ""}`}>
      <aside className="pd-sidebar" aria-label="Customer navigation" id="customer-nav">
        <div className="pd-brand">
          <Link to="/" className="pd-brand-link" aria-label="CleanConnect home">
            <span className="pd-logo" aria-hidden="true">
              <img src={logoMark.url} alt="" />
            </span>
            <span className="pd-brand-text">
              <strong>
                Clean<span>Connect</span>
              </strong>
              <em>Clean Homes, Happy Lives</em>
            </span>
          </Link>
          <button
            type="button"
            ref={closeRef}
            className="pd-icon-btn cd-close"
            aria-label="Close navigation"
            onClick={() => setMobileOpen(false)}
          >
            <i className="fas fa-xmark" />
          </button>
        </div>

        <nav className="pd-nav">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`pd-nav-item${isActive(item.to, "exact" in item ? item.exact : false) ? " active" : ""}`}
              aria-current={isActive(item.to, "exact" in item ? item.exact : false) ? "page" : undefined}
              title={item.label}
            >
              <i className={`fas ${item.icon}`} aria-hidden="true" />
              <span>{item.label}</span>
              {"badge" in item && stats.unreadMessages > 0 && (
                <span className="pd-nav-badge">{stats.unreadMessages}</span>
              )}
            </Link>
          ))}
          <button type="button" className="pd-nav-item pd-logout" onClick={() => void onLogout()}>
            <i className="fas fa-arrow-right-from-bracket" aria-hidden="true" />
            <span>Logout</span>
          </button>
        </nav>

        <div className="pd-side-card">
          <strong>Refer &amp; Earn</strong>
          <p>Refer your friends and earn exciting rewards.</p>
          <Link to="/customer/settings" className="pd-btn pd-btn-light">
            Refer Now
          </Link>
        </div>
      </aside>

      {mobileOpen && (
        <button type="button" className="pd-overlay" aria-label="Close navigation" onClick={() => setMobileOpen(false)} />
      )}

      <div className="pd-main">
        <header className="pd-topbar">
          <button
            type="button"
            className="pd-icon-btn pd-burger"
            aria-label="Toggle navigation"
            aria-expanded={mobileOpen}
            aria-controls="customer-nav"
            onClick={() => {
              if (window.innerWidth <= 1024) setMobileOpen((v) => !v);
              else setCollapsed((v) => !v);
            }}
          >
            <i className="fas fa-bars" />
          </button>

          <form
            className="pd-search"
            role="search"
            onSubmit={(e) => {
              e.preventDefault();
              navigate({ to: "/customer/bookings" });
            }}
          >
            <i className="fas fa-magnifying-glass" aria-hidden="true" />
            <input type="search" placeholder="Search for services, bookings..." aria-label="Search your dashboard" />
          </form>

          <div className="pd-top-right">
            <div className="pd-profile">
              <button
                type="button"
                className="pd-icon-btn"
                aria-label={`Notifications, ${stats.unreadNotifications} unread`}
                aria-expanded={bellOpen}
                onClick={() => {
                  setBellOpen((v) => !v);
                  if (!bellOpen && stats.unreadNotifications) void markNotificationsRead().then(reload);
                }}
              >
                <i className="fas fa-bell" />
                <span className="pd-count">{stats.unreadNotifications}</span>
              </button>
              {bellOpen && (
                <div className="pd-menu" role="menu" aria-label="Notifications">
                  {data.notifications.length === 0 ? (
                    <p className="cd-menu-empty">No notifications yet.</p>
                  ) : (
                    data.notifications.slice(0, 6).map((n) => (
                      <div key={n.id} className="pd-menu-item" role="menuitem" tabIndex={0}>
                        <i className="fas fa-circle-info" />
                        <span>
                          <strong>{n.title}</strong>
                          <em>{new Date(n.created_at).toLocaleString()}</em>
                        </span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            <Link
              to="/customer/messages"
              className="pd-icon-btn"
              aria-label={`Messages, ${stats.unreadMessages} unread`}
            >
              <i className="fas fa-comment-dots" />
              <span className="pd-count">{stats.unreadMessages}</span>
            </Link>

            <div className="pd-profile" ref={menuRef}>
              <button
                type="button"
                className="pd-profile-btn"
                onClick={() => setMenuOpen((v) => !v)}
                aria-expanded={menuOpen}
                aria-haspopup="menu"
              >
                <span className="pd-avatar" aria-hidden="true">
                  {data.profile?.avatar_url ? <img src={data.profile.avatar_url} alt="" /> : <i className="fas fa-user" />}
                </span>
                <span className="pd-profile-text">
                  <strong>Hello, {name}</strong>
                  <em>Customer</em>
                </span>
                <i className="fas fa-chevron-down" aria-hidden="true" />
              </button>
              {menuOpen && (
                <div className="pd-menu" role="menu">
                  <Link to="/customer/profile" className="pd-menu-item" role="menuitem">
                    <i className="fas fa-user" /> My Profile
                  </Link>
                  <Link to="/customer/settings" className="pd-menu-item" role="menuitem">
                    <i className="fas fa-gear" /> Settings
                  </Link>
                  <Link to="/customer/support" className="pd-menu-item" role="menuitem">
                    <i className="fas fa-headset" /> Help &amp; Support
                  </Link>
                  <button type="button" className="pd-menu-item" role="menuitem" onClick={() => void onLogout()}>
                    <i className="fas fa-arrow-right-from-bracket" /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="pd-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
