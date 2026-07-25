import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { getUser, logout, type User } from "@/lib/auth";

function DownloadCodebaseModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        background: "rgba(15,23,42,0.6)",
        backdropFilter: "blur(6px)",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 560,
          background: "#fff",
          borderRadius: 22,
          boxShadow: "0 24px 60px rgba(15,23,42,0.18)",
          padding: "28px 24px 24px",
          position: "relative",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          aria-label="Close"
          onClick={onClose}
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            width: 34,
            height: 34,
            borderRadius: "50%",
            border: "none",
            background: "#f1f5f9",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <i className="fas fa-times" style={{ color: "#475569" }} />
        </button>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 14px",
            }}
          >
            <i className="fas fa-download" style={{ color: "#fff", fontSize: 24 }} />
          </div>
          <h3 style={{ fontSize: "1.35rem", fontWeight: 700, color: "#0f172a", margin: 0 }}>
            Get your project code
          </h3>
          <p style={{ color: "#64748b", margin: "8px 0 0", fontSize: "0.95rem" }}>
            Choose the fastest way to download your CleanConnect codebase.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <a
            href="https://lovable.dev/projects"
            target="_blank"
            rel="noreferrer"
            className="btn btn-primary"
            style={{ justifyContent: "flex-start", gap: 14 }}
          >
            <i className="fas fa-code" />
            <span style={{ flex: 1, textAlign: "left" }}>
              <strong>Open Code Editor</strong>
              <span style={{ display: "block", fontSize: "0.8rem", fontWeight: 400, opacity: 0.9 }}>
                Then click "Download codebase" at the bottom of the file tree
              </span>
            </span>
            <i className="fas fa-external-link-alt" style={{ opacity: 0.7 }} />
          </a>

          <a
            href="https://docs.lovable.dev/user-guides/github"
            target="_blank"
            rel="noreferrer"
            className="btn btn-outline"
            style={{ justifyContent: "flex-start", gap: 14 }}
          >
            <i className="fab fa-github" />
            <span style={{ flex: 1, textAlign: "left" }}>
              <strong>Connect GitHub</strong>
              <span style={{ display: "block", fontSize: "0.8rem", fontWeight: 400, color: "#64748b" }}>
                Sync your code and clone the repo anytime
              </span>
            </span>
            <i className="fas fa-external-link-alt" style={{ opacity: 0.5 }} />
          </a>

          <a
            href="https://docs.lovable.dev/features/cloud#database-export"
            target="_blank"
            rel="noreferrer"
            className="btn btn-outline"
            style={{ justifyContent: "flex-start", gap: 14 }}
          >
            <i className="fas fa-database" />
            <span style={{ flex: 1, textAlign: "left" }}>
              <strong>Export Cloud Data</strong>
              <span style={{ display: "block", fontSize: "0.8rem", fontWeight: 400, color: "#64748b" }}>
                Download your database records only
              </span>
            </span>
            <i className="fas fa-external-link-alt" style={{ opacity: 0.5 }} />
          </a>
        </div>

        <p style={{ textAlign: "center", color: "#94a3b8", fontSize: "0.8rem", marginTop: 18 }}>
          Code download is handled securely inside the Lovable editor.
        </p>
      </div>
    </div>
  );
}


export function useAuthUser() {
  const [user, setUserState] = useState<User | null>(null);
  useEffect(() => {
    setUserState(getUser());
    const onChange = () => setUserState(getUser());
    window.addEventListener("cc-auth-change", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("cc-auth-change", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);
  return user;
}

export function Nav() {
  const user = useAuthUser();
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const handleLogout = () => {
    logout();
    setMenu(false);
    navigate({ to: "/" });
  };

  const links = (
    <>
      <Link to="/" className="nav-link" onClick={() => setOpen(false)}>
        <i className="fas fa-house" /> Home
      </Link>
      <a href="/#services" className="nav-link" onClick={() => setOpen(false)}>
        <i className="fas fa-broom" /> Services
      </a>
      <a href="/#how" className="nav-link" onClick={() => setOpen(false)}>
        <i className="fas fa-list-check" /> How It Works
      </a>
      <a href="/#providers" className="nav-link" onClick={() => setOpen(false)}>
        <i className="fas fa-user-tie" /> Providers
      </a>
      <a href="/#about" className="nav-link" onClick={() => setOpen(false)}>
        <i className="fas fa-circle-info" /> About
      </a>
      <a href="/#contact" className="nav-link" onClick={() => setOpen(false)}>
        <i className="fas fa-envelope" /> Contact
      </a>
    </>
  );

  const ctas = user ? (
    <>
      <Link to="/dashboard" className="btn btn-ghost" onClick={() => setOpen(false)}>
        <i className="fas fa-th-large" /> Dashboard
      </Link>
      <button
        className="user-pill"
        onClick={() => setMenu((m) => !m)}
        aria-label="Account menu"
      >
        <span className="avatar">{user.name.charAt(0).toUpperCase()}</span>
        {user.name.split(" ")[0]}
        <i className="fas fa-chevron-down" style={{ fontSize: "0.7rem" }} />
      </button>
      {menu && (
        <div
          style={{
            position: "absolute",
            top: 64,
            right: 20,
            background: "#fff",
            borderRadius: 14,
            border: "1px solid var(--border)",
            padding: 8,
            boxShadow: "var(--shadow-lg)",
            minWidth: 200,
            zIndex: 100,
          }}
        >
          <Link to="/dashboard" className="nav-link" onClick={() => setMenu(false)}>
            <i className="fas fa-user" /> Profile
          </Link>
          <button className="nav-link" style={{ width: "100%", textAlign: "left" }}>
            <i className="fas fa-bell" /> Notifications
          </button>
          <button
            className="nav-link"
            style={{ width: "100%", textAlign: "left", color: "#dc2626" }}
            onClick={handleLogout}
          >
            <i className="fas fa-sign-out-alt" /> Logout
          </button>
        </div>
      )}
    </>
  ) : (
    <>
      <Link to="/login" className="btn btn-ghost">
        Login
      </Link>
      <Link to="/signup" className="btn btn-primary">
        Create Account
      </Link>
    </>
  );

  return (
    <>
      <nav className="nav">
        <div className="container-x nav-inner">
          <Link to="/" className="brand">
            <span className="brand-mark">
              <i className="fas fa-broom" />
            </span>
            CleanConnect
          </Link>
          <div className="nav-links">{links}</div>
          <div className="nav-cta" style={{ position: "relative" }}>
            {ctas}
          </div>
          <button
            className="hamburger"
            aria-label="Open menu"
            onClick={() => setOpen(true)}
          >
            <i className="fas fa-bars" />
          </button>
        </div>
      </nav>

      <div
        className={`mobile-overlay ${open ? "open" : ""}`}
        onClick={() => setOpen(false)}
      />
      <aside className={`mobile-drawer ${open ? "open" : ""}`} aria-hidden={!open}>
        <div className="drawer-head">
          <span className="brand">
            <span className="brand-mark">
              <i className="fas fa-broom" />
            </span>
            CleanConnect
          </span>
          <button
            className="hamburger"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          >
            <i className="fas fa-times" />
          </button>
        </div>
        {links}
        <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 10 }}>
          {user ? (
            <>
              <Link to="/dashboard" className="btn btn-outline" onClick={() => setOpen(false)}>
                My Dashboard
              </Link>
              <button className="btn btn-primary" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline" onClick={() => setOpen(false)}>
                Login
              </Link>
              <Link to="/signup" className="btn btn-primary" onClick={() => setOpen(false)}>
                Create Account
              </Link>
            </>
          )}
        </div>
      </aside>
    </>
  );
}

export function Footer() {
  return (
    <>
      <footer id="contact">
        <div className="container-x">
          <div className="footer-grid">
            <div className="footer-brand">
              <span className="brand" style={{ color: "#fff" }}>
                <span className="brand-mark">
                  <i className="fas fa-broom" />
                </span>
                CleanConnect
              </span>
              <p>
                Verified cleaning and laundry professionals, on-demand across Abuja.
                Book in minutes — relax while we handle the rest.
              </p>
              <div className="socials">
                <a href="#" aria-label="Instagram"><i className="fab fa-instagram" /></a>
                <a href="#" aria-label="Twitter"><i className="fab fa-x-twitter" /></a>
                <a href="#" aria-label="Facebook"><i className="fab fa-facebook-f" /></a>
                <a href="#" aria-label="WhatsApp"><i className="fab fa-whatsapp" /></a>
              </div>
            </div>
            <div>
              <h5>Company</h5>
              <ul>
                <li><a href="/#about">About</a></li>
                <li><a href="/#how">How It Works</a></li>
                <li><Link to="/become-provider">Earn with CleanConnect</Link></li>
                <li><a href="#">Careers</a></li>
              </ul>
            </div>
            <div>
              <h5>Services</h5>
              <ul>
                <li><a href="/#services">House Cleaning</a></li>
                <li><a href="/#services">Office Cleaning</a></li>
                <li><a href="/#services">Deep Cleaning</a></li>
                <li><a href="/#services">Laundry & Ironing</a></li>
              </ul>
            </div>
            <div>
              <h5>Support</h5>
              <ul>
                <li><a href="#">Help Center</a></li>
                <li><a href="#">Contact Us</a></li>
                <li><a href="#">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            © {new Date().getFullYear()} CleanConnect. All rights reserved. Made with care in Abuja, Nigeria.
          </div>
        </div>
      </footer>
    </>
  );
}

