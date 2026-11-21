import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { passwordChecks, passwordScore, type Role } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { hasRecoverySession, signOutAdmin, updateAdminPassword } from "@/lib/admin-auth";
import logoMark from "@/assets/cleanconnect-mark.png.asset.json";

const searchSchema = z.object({
  token: z.string().optional(),
  role: z.enum(["customer", "provider", "admin"]).optional(),
  code: z.string().optional(),
});

export const Route = createFileRoute("/reset-password")({
  ssr: false,
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Reset Password — CleanConnect" },
      { name: "description", content: "Choose a new password for your CleanConnect account." },
    ],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const { role = "customer" as Role } = Route.useSearch();
  const navigate = useNavigate();
  const [pw, setPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<Role | null>(null);
  // null = still resolving the secure recovery link from the email
  const [recovery, setRecovery] = useState<boolean | null>(null);

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const ok = await hasRecoverySession();
        if (active) setRecovery(ok);
      } catch (e) {
        console.warn("[reset-password] recovery check failed", e);
        if (active) setRecovery(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const checks = passwordChecks(pw);
  const score = passwordScore(pw);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (score < 5) {
      return setError("Password must be 8+ characters with upper, lower, number and special character.");
    }
    if (pw !== confirm) return setError("Passwords do not match.");

    if (!recovery) {
      return setError("This reset link is invalid or has expired. Please request a new one.");
    }

    setBusy(true);
    try {
      if (role === "admin") {
        const res = await updateAdminPassword(pw);
        if (!res.ok) {
          setBusy(false);
          return setError(res.error);
        }
        await signOutAdmin();
      } else {
        const { error: updateError } = await supabase.auth.updateUser({ password: pw });
        if (updateError) {
          setBusy(false);
          return setError(updateError.message);
        }
        await supabase.auth.signOut();
      }
      setDone(role);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update password.");
    } finally {
      setBusy(false);
    }
  };

  if (recovery === null) {
    return (
      <div className="auth-shell">
        <div className="auth-card" style={{ textAlign: "center" }}>
          <p className="sub">
            <i className="fas fa-spinner fa-spin" /> Verifying your secure link…
          </p>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="auth-shell">
        <div className="auth-card" style={{ textAlign: "center" }}>
          <div style={{ fontSize: "2.4rem", color: "#22C55E" }}>
            <i className="fas fa-circle-check" />
          </div>
          <h1>Password Reset Successful</h1>
          <p className="sub">Your password has been updated. You can now log in with it.</p>
          <button
            className="btn btn-primary"
            onClick={() => navigate({ to: "/auth/$role", params: { role: done } })}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <Link to="/" className="brand" style={{ marginBottom: 20 }}>
          <span className="brand-mark">
            <img src={logoMark.url} alt="CleanConnect logo" />
          </span>
          CleanConnect
        </Link>
        <h1>Set a new password</h1>

        {!recovery ? (
          <>
            <p className="sub">
              This reset link is invalid or has expired. This usually happens when:
            </p>
            <ul style={{ textAlign: "left", color: "var(--muted-foreground)", fontSize: "0.95rem", marginBottom: "1.25rem" }}>
              <li>The link was already used</li>
              <li>The link is older than about 1 hour</li>
              <li>You opened the link in a different browser than the one you requested from</li>
            </ul>
            <Link to="/forgot-password" search={{ role }} className="btn btn-primary">
              Request a new link
            </Link>
          </>
        ) : (
          <>
            <p className="sub">Choose a strong password you haven't used before.</p>
            <form onSubmit={onSubmit}>
              <div className="field">
                <label htmlFor="cc-new">New Password</label>
                <div className="pw-wrap">
                  <input
                    id="cc-new"
                    type={show ? "text" : "password"}
                    required
                    value={pw}
                    onChange={(e) => setPw(e.target.value)}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="pw-toggle"
                    aria-label={show ? "Hide password" : "Show password"}
                    onClick={() => setShow((s) => !s)}
                  >
                    <i className={`fas ${show ? "fa-eye-slash" : "fa-eye"}`} />
                  </button>
                </div>
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
              </div>
              <div className="field">
                <label htmlFor="cc-confirm">Confirm New Password</label>
                <input
                  id="cc-confirm"
                  type={show ? "text" : "password"}
                  required
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  autoComplete="new-password"
                />
              </div>
              {error && (
                <p className="auth-error" role="alert">
                  <i className="fas fa-circle-exclamation" /> {error}
                </p>
              )}
              <button className="btn btn-primary" type="submit" disabled={busy}>
                {busy ? (
                  <>
                    <i className="fas fa-spinner fa-spin" /> Updating…
                  </>
                ) : (
                  "Update Password"
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
