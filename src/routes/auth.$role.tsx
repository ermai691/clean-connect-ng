import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { passwordChecks, passwordScore, type Role } from "@/lib/auth";
import { currentAdmin, signInAdmin } from "@/lib/admin-auth";
import {
  currentCustomer,
  resendCustomerConfirmation,
  signInCustomer,
  signInWithGoogle,
  signUpCustomer,
} from "@/lib/customer-auth";
import { currentProvider, signInProvider } from "@/lib/provider-auth";
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
    sub: "Log in with the email and password on your approved provider account.",
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
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const linkError = sessionStorage.getItem("cc_auth_link_error");
    if (linkError) {
      sessionStorage.removeItem("cc_auth_link_error");
      setError(linkError);
    }
  }, []);

  useEffect(() => {
    if (role === "admin") {
      void currentAdmin().then((admin) => {
        if (admin) navigate({ to: "/admin", replace: true });
      });
      return;
    }
    if (role === "provider") {
      void currentProvider().then((user) => {
        if (user) navigate({ to: "/provider", replace: true });
      });
      return;
    }
    void currentCustomer().then((user) => {
      if (user) navigate({ to: "/customer", replace: true });
    });
  }, [navigate, role]);

  const checks = useMemo(() => passwordChecks(password), [password]);
  const score = passwordScore(password);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setNotice("");

    if (role === "admin") {
      setBusy(true);
      const res = await signInAdmin(email, password);
      setBusy(false);
      if (!res.ok) return setError(res.error);
      navigate({ to: "/admin", replace: true });
      return;
    }

    if (role === "provider") {
      setBusy(true);
      const res = await signInProvider(email, password);
      setBusy(false);
      if (!res.ok) return setError(res.error);
      navigate({ to: "/provider", replace: true });
      return;
    }

    setBusy(true);
    const res =
      mode === "signup"
        ? await signUpCustomer({ name, email, password, phone })
        : await signInCustomer(email, password);
    setBusy(false);
    if (!res.ok) {
      if ("needsConfirmation" in res && res.needsConfirmation) setNotice(res.error);
      else setError(res.error);
      return;
    }
    navigate({ to: "/customer", replace: true });
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
              onClick={() => {
                setMode("login");
                setError("");
              }}
            >
              <i className="fas fa-right-to-bracket" /> Login
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === "signup"}
              className={`auth-tab${mode === "signup" ? " active" : ""}`}
              onClick={() => {
                setMode("signup");
                setError("");
              }}
            >
              <i className="fas fa-user-plus" /> Create Customer Account
            </button>
          </div>
        )}

        <form onSubmit={onSubmit}>
          {mode === "signup" && role === "customer" && (
            <>
              <div className="field">
                <label htmlFor="cc-name">Full Name</label>
                <input id="cc-name" value={name} required onChange={(e) => setName(e.target.value)} placeholder="Ada Okoye" />
              </div>
              <div className="field">
                <label htmlFor="cc-phone">Phone number</label>
                <input
                  id="cc-phone"
                  value={phone}
                  required
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="08012345678"
                  autoComplete="tel"
                />
              </div>
            </>
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
                <div className="pw-bar">
                  <span style={{ width: `${(score / 5) * 100}%` }} data-score={score} />
                </div>
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
            <span />
            <Link to="/forgot-password" search={{ role }} className="auth-inline-link">
              Forgot Password?
            </Link>
          </div>

          {notice && (
            <p className="auth-success" role="status">
              <i className="fas fa-envelope" /> {notice}
            </p>
          )}
          {error && (
            <p className="auth-error" role="alert">
              <i className="fas fa-circle-exclamation" /> {error}
            </p>
          )}

          {role === "customer" && mode === "login" && (
            <button
              className="btn btn-secondary"
              type="button"
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                setError("");
                const res = await signInWithGoogle();
                setBusy(false);
                if (!res.ok) setError(res.error);
              }}
            >
              <i className="fab fa-google" /> Continue with Google
            </button>
          )}

          <button className="btn btn-primary" type="submit" disabled={busy}>
            {busy ? (
              <>
                <i className="fas fa-spinner fa-spin" /> Signing in…
              </>
            ) : mode === "signup" && role === "customer" ? (
              "Create Account"
            ) : (
              "Log In"
            )}
          </button>
          {role === "customer" && mode === "login" && (
            <button
              className="auth-inline-link"
              type="button"
              onClick={async () => {
                setBusy(true);
                setError("");
                const res = await resendCustomerConfirmation(email);
                setBusy(false);
                if (res.ok) setNotice(res.message);
                else setError(res.error);
              }}
            >
              Resend verification email
            </button>
          )}
        </form>

        {role === "provider" && (
          <div className="auth-alt">
            <Link to="/become-provider">Apply to become a provider</Link>
          </div>
        )}

        <div className="auth-alt">
          <Link to="/">← Back to home</Link>
        </div>
      </div>
    </div>
  );
}
