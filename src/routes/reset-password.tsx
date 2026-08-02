import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { z } from "zod";
import { passwordChecks, passwordScore, resetPassword, validateResetToken, type Role } from "@/lib/auth";
import logoMark from "@/assets/cleanconnect-mark.png.asset.json";

const searchSchema = z.object({ token: z.string().optional() });

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
  const { token = "" } = Route.useSearch();
  const navigate = useNavigate();
  const [pw, setPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<Role | null>(null);

  const valid = useMemo(() => validateResetToken(token), [token]);
  const checks = passwordChecks(pw);
  const score = passwordScore(pw);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (score < 5) return setError("Password must be 8+ characters with upper, lower, number and special character.");
    if (pw !== confirm) return setError("Passwords do not match.");
    const res = resetPassword(token, pw);
    if (!res.ok) return setError(res.error);
    setDone(res.role);
  };

  if (done) {
    return (
      <div className="auth-shell">
        <div className="auth-card" style={{ textAlign: "center" }}>
          <div style={{ fontSize: "2.4rem", color: "#22C55E" }}><i className="fas fa-circle-check" /></div>
          <h1>Password Reset Successful</h1>
          <p className="sub">Your password has been updated successfully.</p>
          <button className="btn btn-primary" onClick={() => navigate({ to: "/auth/$role", params: { role: done } })}>
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

        {!valid.ok ? (
          <>
            <p className="sub">This reset link is invalid or has expired. Please request a new one.</p>
            <Link to="/forgot-password" search={{ role: "customer" as Role }} className="btn btn-primary">
              Request new link
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
                  <div className="pw-bar"><span style={{ width: `${(score / 5) * 100}%` }} data-score={score} /></div>
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
              {error && <p className="auth-error" role="alert"><i className="fas fa-circle-exclamation" /> {error}</p>}
              <button className="btn btn-primary" type="submit">Update Password</button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
