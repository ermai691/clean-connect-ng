import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { requestPasswordReset, type Role } from "@/lib/auth";
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
  const [token, setToken] = useState<string | null>(null);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
            <h1>Forgot Your Password?</h1>
            <p className="sub">
              Enter your registered email address or phone number, and we'll help you reset your password.
            </p>
            <form onSubmit={onSubmit}>
              <div className="field">
                <label htmlFor="cc-identifier">Email or Phone Number</label>
                <input
                  id="cc-identifier"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="you@example.com or 080..."
                />
              </div>
              <button className="btn btn-primary" type="submit">
                <i className="fas fa-paper-plane" /> Send Reset Link / OTP
              </button>
            </form>
          </>
        ) : (
          <>
            <h1>Check your inbox</h1>
            <p className="sub">
              If an account exists with that email or phone number, you'll receive reset instructions.
              The link expires in 15 minutes.
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
