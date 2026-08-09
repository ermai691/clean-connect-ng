import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { requestPasswordReset, type Role } from "@/lib/auth";
import { requestAdminPasswordSetup } from "@/lib/admin-auth.functions";
import logoMark from "@/assets/cleanconnect-mark.png.asset.json";

const searchSchema = z.object({
  role: z.enum(["customer", "provider", "admin"]).optional(),
});

export const Route = createFileRoute("/forgot-password")({
  ssr: false,
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Forgot Password — CleanConnect" },
      { name: "description", content: "Reset your CleanConnect password securely." },
    ],
  }),
  component: ForgotPassword,
});

function ForgotPassword() {
  const { role = "customer" as Role } = Route.useSearch();
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (role === "admin") {
      setBusy(true);
      try {
        await requestAdminPasswordSetup({ data: { email: identifier.trim() } });
      } catch {
        /* generic response either way — no account enumeration */
      }
      setBusy(false);
      setToken(null);
      setSent(true);
      return;
    }
    const res = requestPasswordReset(identifier, role);
    setToken(res.token);
    setSent(true);
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

        {!sent ? (
          <>
            <h1>{role === "admin" ? "Administrator Password Recovery" : "Forgot Your Password?"}</h1>
            <p className="sub">
              {role === "admin"
                ? "Enter your administrator email address and we'll email you a secure link to create a new password."
                : "Enter your registered email address or phone number, and we'll help you reset your password."}
            </p>
            <form onSubmit={onSubmit}>
              <div className="field">
                <label htmlFor="cc-identifier">
                  {role === "admin" ? "Administrator Email" : "Email or Phone Number"}
                </label>
                <input
                  id="cc-identifier"
                  type={role === "admin" ? "email" : "text"}
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={role === "admin" ? "you@example.com" : "you@example.com or 080..."}
                  autoComplete="email"
                />
              </div>
              <button className="btn btn-primary" type="submit" disabled={busy}>
                {busy ? (
                  <><i className="fas fa-spinner fa-spin" /> Sending…</>
                ) : (
                  <><i className="fas fa-paper-plane" /> {role === "admin" ? "Send Reset Link" : "Send Reset Link / OTP"}</>
                )}
              </button>
            </form>
          </>
        ) : (
          <>
            <h1>Check your inbox</h1>
            <p className="sub">
              {role === "admin"
                ? "If that address is registered as an administrator, a secure password-reset email is on its way. Open the link to create your new password, then return here to log in."
                : "If an account exists with that email or phone number, you'll receive reset instructions. The link expires in 15 minutes."}
            </p>
            {token && (
              <button
                className="btn btn-primary"
                onClick={() => navigate({ to: "/reset-password", search: { token } })}
              >
                <i className="fas fa-key" /> Continue to reset password
              </button>
            )}
          </>
        )}

        <div className="auth-alt">
          <Link to="/auth/$role" params={{ role }}>← Back to login</Link>
        </div>
      </div>
    </div>
  );
}
