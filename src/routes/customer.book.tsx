import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { PACKAGES, SERVICE_CATALOG } from "@/lib/service-catalog";
import { createBookingRecord, ngn, useCustomerData } from "@/lib/customer-data";

export const Route = createFileRoute("/customer/book")({
  component: BookService,
});

function BookService() {
  const navigate = useNavigate();
  const { data } = useCustomerData();
  const [serviceId, setServiceId] = useState(SERVICE_CATALOG[0]!.id);
  const [pkg, setPkg] = useState(PACKAGES[0]!.id);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [method, setMethod] = useState("Card");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const service = SERVICE_CATALOG.find((s) => s.id === serviceId)!;
  const selectedPkg = PACKAGES.find((p) => p.id === pkg)!;
  const total = Math.round(service.price * selectedPkg.multiplier);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (!date || !time || !address.trim()) {
      setErr("Please choose a date, time and service address.");
      return;
    }
    setSaving(true);
    const res = await createBookingRecord({
      service: service.name,
      category: service.category,
      packageName: selectedPkg.name,
      amount: total,
      scheduledFor: new Date(`${date}T${time}`).toISOString(),
      address: address.trim(),
      notes: notes.trim(),
      method,
    });
    setSaving(false);
    if (!res.ok) return setErr(res.error);
    navigate({ to: "/customer/bookings" });
  };

  return (
    <div className="cd-page">
      <div className="pd-page-head">
        <div>
          <h1>Book a Service</h1>
          <p>Choose a service, pick a time and we'll match you with a verified professional.</p>
        </div>
      </div>

      <form className="pd-panel cd-form" onSubmit={submit}>
        <label className="cd-field">
          <span>Service</span>
          <select value={serviceId} onChange={(e) => setServiceId(e.target.value)}>
            {SERVICE_CATALOG.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} — from {ngn(s.price)}
              </option>
            ))}
          </select>
        </label>

        <label className="cd-field">
          <span>Package</span>
          <select value={pkg} onChange={(e) => setPkg(e.target.value)}>
            {PACKAGES.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>

        <div className="cd-form-row">
          <label className="cd-field">
            <span>Date</span>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </label>
          <label className="cd-field">
            <span>Time</span>
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
          </label>
        </div>

        <label className="cd-field">
          <span>Service address</span>
          {data.addresses.length > 0 && (
            <select
              value=""
              onChange={(e) => {
                const a = data.addresses.find((x) => x.id === e.target.value);
                if (a) setAddress([a.street, a.city, a.state].filter(Boolean).join(", "));
              }}
            >
              <option value="">Use a saved address…</option>
              {data.addresses.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.label} — {a.street}
                </option>
              ))}
            </select>
          )}
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Street, city, state"
            required
          />
        </label>

        <label className="cd-field">
          <span>Notes for the professional (optional)</span>
          <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </label>

        <label className="cd-field">
          <span>Payment method</span>
          <select value={method} onChange={(e) => setMethod(e.target.value)}>
            <option>Card</option>
            <option>Bank Transfer</option>
            <option>Wallet</option>
            <option>Cash on Delivery</option>
          </select>
        </label>

        <div className="cd-total">
          <span>Total</span>
          <strong>{ngn(total)}</strong>
        </div>

        {err && <p className="cd-error">{err}</p>}

        <button type="submit" className="pd-btn pd-btn-primary" disabled={saving}>
          {saving ? "Creating booking…" : "Confirm Booking"}
        </button>
      </form>
    </div>
  );
}
