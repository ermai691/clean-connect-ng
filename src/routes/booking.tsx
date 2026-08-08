import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { z } from "zod";
import { Nav, Footer, useAuthUser } from "@/components/Nav";
import { createBooking } from "@/lib/platform-data";

const searchSchema = z.object({ service: z.string().optional() });

export const Route = createFileRoute("/booking")({
  validateSearch: searchSchema,
  component: BookingPage,
});

function BookingPage() {
  const user = useAuthUser();
  const navigate = useNavigate();
  const search = Route.useSearch();

  useEffect(() => {
    if (typeof window === "undefined") return;
    // Redirect if not signed in
    const raw = window.localStorage.getItem("cleanconnect_user");
    if (!raw) navigate({ to: "/login", search: { redirect: window.location.pathname + window.location.search } });
  }, [navigate]);

  if (!user) return null;

  return (
    <div className="page-shell">
      <Nav />
      <div className="page-hero">
        <div className="container-x">
          <h1>Book your cleaning</h1>
          <p>
            Selected service:{" "}
            <strong style={{ textTransform: "capitalize" }}>
              {search.service ?? "House cleaning"}
            </strong>
          </p>
        </div>
      </div>

      <div className="container-x" style={{ paddingBottom: 60 }}>
        <div className="panel">
          <h3>1. Choose date & time</h3>
          <p className="muted">Pick a slot that works for you.</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div className="field">
              <label>Date</label>
              <input type="date" />
            </div>
            <div className="field">
              <label>Time</label>
              <input type="time" />
            </div>
          </div>
        </div>

        <div className="panel">
          <h3>2. Service address</h3>
          <p className="muted">Where should we clean?</p>
          <div className="field">
            <label>Address</label>
            <input placeholder="e.g. 12 Aminu Kano Crescent, Wuse II, Abuja" />
          </div>
        </div>

        <div className="panel">
          <h3>3. Payment</h3>
          <p className="muted">Choose how you'd like to pay.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 10 }}>
            {[
              { i: "fa-credit-card", t: "Card" },
              { i: "fa-building-columns", t: "Bank Transfer" },
              { i: "fa-wallet", t: "Wallet" },
              { i: "fa-money-bill", t: "Cash on Completion" },
            ].map((p) => (
              <label key={p.t} className="addon">
                <span>
                  <i className={`fas ${p.i}`} style={{ marginRight: 8, color: "var(--primary)" }} />
                  {p.t}
                </span>
                <input type="radio" name="pay" />
              </label>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 24, flexWrap: "wrap" }}>
          <Link to="/" className="btn btn-outline">
            Cancel
          </Link>
          <button className="btn btn-primary" onClick={() => {
            const service = search.service ?? "House cleaning";
            createBooking({
              customerName: user.name,
              service,
              category: service.toLowerCase().includes("laundry") ? "Laundry" : "House Cleaning",
              amount: 0,
              scheduledFor: new Date().toISOString(),
            });
            navigate({ to: "/dashboard" });
          }}>
            <i className="fas fa-check" /> Confirm Booking
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
}
