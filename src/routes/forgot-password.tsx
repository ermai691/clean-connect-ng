import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { type Role } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
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
  const [error, setError] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const email = identifier.trim().toLowerCase();
    if (!email) return;

    // Admin uses a dedicated server function (if configured)
    if (role === "admin") {
      setBusy(true);
      try {
        await requestAdminPasswordSetup({ data: { email } });
      } catch {
        /* generic response — no account enumeration */
      }
      // Also send the standard Supabase reset so the same /reset-password page works
      try {
        await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password?role=admin`,
        });
      } catch {
        /* ignore */
      }
      setBusy(false);
      setSent(true);
      return;
    }

    // Customer + Provider: real Supabase password reset
    setBusy(true);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password?role=${role}`,
      });
      if (resetError) {
        // Still show success UI to avoid account enumeration, but log for debugging
        console.warn("[forgot-password]", resetError.message);
      }
    } catch (err) {
      console.warn("[forgot-password]", err);
    }
    setBusy(false);
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
            <h1>
              {role === "admin"
                ? "Administrator Password Recovery"
                : role === "provider"
                  ? "Provider Password Recovery"
                  : "Forgot Your Password?"}
            </h1>
            <p className="sub">
              Enter your registered email address and we'll send a secure link to create a new password.
            </p>
            <form onSubmit={onSubmit}>
              <div className="field">
                <label htmlFor="cc-identifier">Email</label>
                <input
                  id="cc-identifier"
                  type="email"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
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
                    <i className="fas fa-spinner fa-spin" /> Sending…
                  </>
                ) : (
                  <>
                    <i className="fas fa-paper-plane" /> Send Reset Link
                  </>
                )}
              </button>
            </form>
          </>
        ) : (
          <>
            <h1>Check your inbox</h1>
            <p className="sub">
              If an account exists with that email, a password-reset link is on its way.
              Open the link on this same device/browser to choose a new password.
            </p>
            <p className="sub" style={{ fontSize: "0.9rem", marginTop: "0.75rem" }}>
              The link expires after about 1 hour. If you don't see the email, check spam/junk.
            </p>
          </>
        )}

        <div className="auth-alt">
          <Link to="/auth/$role" params={{ role }}>
            ← Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
