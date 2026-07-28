import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { setUser } from "@/lib/auth";
import { z } from "zod";
import logoMark from "@/assets/cleanconnect-mark.png.asset.json";


const searchSchema = z.object({ redirect: z.string().optional() });

export const Route = createFileRoute("/login")({
  validateSearch: searchSchema,
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setUser({ name: email.split("@")[0] || "Customer", email });
    navigate({ to: search.redirect ?? "/dashboard" });
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
        <h1>Welcome back</h1>
        <p className="sub">Log in to book, track and manage your cleanings.</p>
        <form onSubmit={onSubmit}>
          <div className="field">
            <label>Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>
          <div className="field">
            <label>Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <button className="btn btn-primary" type="submit">
            Log In
          </button>
        </form>
        <div className="auth-alt">
          New here? <Link to="/signup">Create an account</Link>
        </div>
      </div>
    </div>
  );
}
