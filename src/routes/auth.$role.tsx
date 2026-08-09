import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  dashboardPathFor,
  getUser,
  passwordChecks,
  passwordScore,
  setUser,
  signIn,
  signUp,
  type Role,
} from "@/lib/auth";
import { currentAdmin, signInAdmin } from "@/lib/admin-auth";
import { registerCustomer } from "@/lib/platform-data";
import logoMark from "@/assets/cleanconnect-mark.png.asset.json";

export const Route = createFileRoute("/auth/$role")({
  ssr: false,
  component: AuthPage,
});

const COPY: Record<Role, { title: string; sub: string; icon: string; canSignUp: boolean }> = {
  customer: {
    title: "Customer Dashboard",
    sub: "Log in or create a customer account to book and track your cleanings.",
    icon: "fa-user",
    canSignUp: true,
  },
  provider: {
    title: "Provider Login",
    sub: "Log in with the email and password you registered with to manage jobs and earnings.",
    icon: "fa-user-tie",
    canSignUp: false,
  },
  admin: {
    title: "Admin Login",
    sub: "Administrator access only. New admin accounts cannot be created publicly.",
    icon: "fa-shield-halved",
    canSignUp: false,
  },
};

function isRole(v: string): v is Role {
  return v === "customer" || v === "provider" || v === "admin";
}

function AuthPage() {
  const { role: raw } = Route.useParams();
  const navigate = useNavigate();
  const role: Role = isRole(raw) ? raw : "customer";
  const copy = COPY[role];

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");

  // Already signed in → straight to the right dashboard.
  useEffect(() => {
    const user = getUser();
    if (user) navigate({ to: dashboardPathFor(user.role), replace: true });
  }, [navigate]);

  const checks = useMemo(() => passwordChecks(password), [password]);
  const score = passwordScore(password);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (mode === "signup") {
      if (score < 5) {
        setError("Password must be 8+ characters with upper, lower, number and special character.");
        return;
      }
      const res = signUp({ name, email, password, role: role as "customer" | "provider" });
      if (!res.ok) return setError(res.error);
      if (role === "customer") registerCustomer({ name, email });
      setUser(res.user, remember);
      navigate({ to: dashboardPathFor(role), replace: true });
      return;
    }
    const res = signIn({ email, password, role });
    if (!res.ok) return setError(res.error);
    setUser(res.user, remember);
    navigate({ to: dashboardPathFor(role), replace: true });
  };

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <Link to="/" className="brand" style={{ marginBottom: 20 }}>
          <span className="brand-mark">
            <img src={logoMark.url} alt="CleanConnect logo" />
          </span>
          CleanConnect
        </Link>

        <h1>
          <i className={`fas ${copy.icon}`} style={{ marginRight: 8, color: "var(--primary)" }} />
          {copy.title}
        </h1>
        <p className="sub">{copy.sub}</p>

        {copy.canSignUp && (
          <div className="auth-tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={mode === "login"}
              className={`auth-tab${mode === "login" ? " active" : ""}`}
              onClick={() => { setMode("login"); setError(""); }}
            >
              <i className="fas fa-right-to-bracket" /> Login
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === "signup"}
              className={`auth-tab${mode === "signup" ? " active" : ""}`}
              onClick={() => { setMode("signup"); setError(""); }}
            >
              <i className="fas fa-user-plus" /> Create {role === "provider" ? "Provider" : "Customer"} Account
            </button>
          </div>
        )}

        <form onSubmit={onSubmit}>
          {mode === "signup" && (
            <div className="field">
              <label htmlFor="cc-name">Full Name</label>
              <input id="cc-name" value={name} required onChange={(e) => setName(e.target.value)} placeholder="Ada Okoye" />
            </div>
          )}
          <div className="field">
            <label htmlFor="cc-email">Email</label>
            <input
              id="cc-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>
          <div className="field">
            <label htmlFor="cc-password">Password</label>
            <div className="pw-wrap">
              <input
                id="cc-password"
                type={showPw ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
              />
              <button
                type="button"
                className="pw-toggle"
                aria-label={showPw ? "Hide password" : "Show password"}
                onClick={() => setShowPw((s) => !s)}
              >
                <i className={`fas ${showPw ? "fa-eye-slash" : "fa-eye"}`} />
              </button>
            </div>
            {mode === "signup" && password.length > 0 && (
              <div className="pw-meter" aria-live="polite">
                <div className="pw-bar"><span style={{ width: `${(score / 5) * 100}%` }} data-score={score} /></div>
                <ul className="pw-rules">
                  <li className={checks.length ? "ok" : ""}>8+ characters</li>
                  <li className={checks.upper ? "ok" : ""}>Uppercase</li>
                  <li className={checks.lower ? "ok" : ""}>Lowercase</li>
                  <li className={checks.number ? "ok" : ""}>Number</li>
                  <li className={checks.special ? "ok" : ""}>Special character</li>
                </ul>
              </div>
            )}
          </div>

          <div className="auth-row">
            <label className="remember">
              <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
              Remember me
            </label>
            <Link to="/forgot-password" search={{ role }} className="auth-inline-link">
              Forgot Password?
            </Link>
          </div>

          {error && (
            <p className="auth-error" role="alert">
              <i className="fas fa-circle-exclamation" /> {error}
            </p>
          )}

          <button className="btn btn-primary" type="submit">
            {mode === "signup" ? "Create Account" : "Log In"}
          </button>
        </form>

        <div className="auth-alt">
          <Link to="/">← Back to home</Link>
        </div>
      </div>
    </div>
  );
}
