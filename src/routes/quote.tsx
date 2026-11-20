import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Nav, Footer } from "@/components/Nav";
import { QUOTE_SERVICES, findService, type FormFieldKey } from "@/lib/service-catalog";
import { submitQuotationRequest } from "@/lib/quotation-data";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/quote")({
  validateSearch: (s: Record<string, unknown>) => ({
    service: typeof s.service === "string" ? s.service : undefined,
  }),
  component: QuoteFormPage,
});

const FIELD_LABELS: Record<FormFieldKey, string> = {
  property_type: "Property / venue type",
  property_size: "Property size (e.g. sqm or description)",
  rooms: "Number of rooms",
  floors: "Number of floors",
  frequency: "Cleaning frequency",
  event_type: "Event type",
  attendance: "Expected attendance",
  venue_size: "Venue size",
  event_timing: "Before or after the event?",
  construction_status: "Construction / renovation status",
  debris_level: "Debris / dirt level",
  floor_condition: "Floor condition",
  classrooms: "Number of classrooms",
  facilities: "Facilities to clean",
  description: "Describe your requirements",
  preferred_date: "Preferred service date",
  preferred_time: "Preferred time",
  photos: "Photos (optional)",
  additional_notes: "Additional notes",
};

function QuoteFormPage() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/quote" });
  const initialService = search.service && findService(search.service).pricingType === "quote"
    ? search.service
    : QUOTE_SERVICES[0]?.id ?? "office";

  const [serviceId, setServiceId] = useState(initialService);
  const service = useMemo(() => findService(serviceId), [serviceId]);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [details, setDetails] = useState<Record<string, string>>({});
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [prefDate, setPrefDate] = useState("");
  const [prefTime, setPrefTime] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [successRef, setSuccessRef] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  // Prefill from profile if logged in
  useEffect(() => {
    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) {
        setAuthChecked(true);
        return;
      }
      setEmail(auth.user.email ?? "");
      const metaName = (auth.user.user_metadata?.["full_name"] as string) ?? "";
      if (metaName) setName(metaName);

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, phone, email")
        .eq("id", auth.user.id)
        .maybeSingle();

      if (profile) {
        if (profile.full_name) setName(profile.full_name);
        if (profile.phone) setPhone(profile.phone);
        if (profile.email) setEmail(profile.email);
      }
      setAuthChecked(true);
    })();
  }, []);

  const setDetail = (key: string, value: string) =>
    setDetails((d) => ({ ...d, [key]: value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);

    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) {
      navigate({
        to: "/login",
        search: { redirect: `/quote?service=${serviceId}` },
      });
      return;
    }

    if (!name.trim()) {
      setErr("Please enter your name.");
      return;
    }

    setSaving(true);
    const fullAddress = [street, city, state].filter(Boolean).join(", ");

    const res = await submitQuotationRequest({
      serviceId,
      customerName: name,
      customerPhone: phone,
      customerEmail: email,
      addressStreet: street,
      addressCity: city,
      addressState: state,
      fullAddress: fullAddress || undefined,
      details,
      description,
      additionalNotes: notes,
      preferredDate: prefDate || undefined,
      preferredTime: prefTime || undefined,
    });
    setSaving(false);

    if (!res.ok) {
      setErr(res.error);
      return;
    }
    setSuccessRef(res.request.reference);
  };

  if (successRef) {
    return (
      <>
        <Nav />
        <div className="container-x" style={{ maxWidth: 640, padding: "4rem 1.25rem", textAlign: "center" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>✅</div>
          <h1 style={{ marginBottom: "0.5rem" }}>Request submitted</h1>
          <p style={{ color: "var(--muted-foreground)", marginBottom: "1.5rem" }}>
            Your quotation request <strong>{successRef}</strong> for <strong>{service.name}</strong> has been received.
            Our team will review it and send you a formal quote. You can track status in your dashboard.
          </p>
          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
            <button className="btn btn-primary" onClick={() => navigate({ to: "/customer" })}>
              Go to Dashboard
            </button>
            <button className="btn btn-outline" onClick={() => navigate({ to: "/" })}>
              Back to Home
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const dynamicFields = service.formFields.filter(
    (f) => !["description", "preferred_date", "preferred_time", "photos", "additional_notes"].includes(f)
  );

  return (
    <>
      <Nav />
      <div className="container-x" style={{ maxWidth: 720, padding: "2.5rem 1.25rem 4rem" }}>
        <h1 style={{ marginBottom: "0.35rem" }}>Request a Quote</h1>
        <p style={{ color: "var(--muted-foreground)", marginBottom: "1.75rem" }}>
          Tell us about your {service.name.toLowerCase()} needs. We'll review and send a formal quotation.
          This is <strong>not</strong> a confirmed booking.
        </p>

        <form onSubmit={submit} className="cd-form" style={{ display: "grid", gap: "1rem" }}>
          {/* Service selector */}
          <label className="cd-field">
            <span>Service</span>
            <select
              value={serviceId}
              onChange={(e) => {
                setServiceId(e.target.value);
                setDetails({});
              }}
            >
              {QUOTE_SERVICES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>

          {/* Contact */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <label className="cd-field">
              <span>Full name *</span>
              <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Your name" />
            </label>
            <label className="cd-field">
              <span>Phone</span>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="080…" />
            </label>
          </div>
          <label className="cd-field">
            <span>Email</span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          </label>

          {/* Address */}
          <label className="cd-field">
            <span>Street / location</span>
            <input value={street} onChange={(e) => setStreet(e.target.value)} placeholder="Street address or landmark" />
          </label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <label className="cd-field">
              <span>City</span>
              <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Abuja" />
            </label>
            <label className="cd-field">
              <span>State</span>
              <input value={state} onChange={(e) => setState(e.target.value)} placeholder="FCT" />
            </label>
          </div>

          {/* Dynamic service-specific fields */}
          {dynamicFields.length > 0 && (
            <div style={{ display: "grid", gap: "1rem", padding: "1rem", background: "var(--muted, #f1f5f9)", borderRadius: 8 }}>
              <strong style={{ fontSize: "0.9rem" }}>Details for {service.name}</strong>
              {dynamicFields.map((key) => (
                <label key={key} className="cd-field">
                  <span>{FIELD_LABELS[key] ?? key}</span>
                  {key === "frequency" ? (
                    <select value={details[key] ?? ""} onChange={(e) => setDetail(key, e.target.value)}>
                      <option value="">Select…</option>
                      <option value="one-off">One-off</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="bi-weekly">Bi-weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  ) : key === "event_timing" ? (
                    <select value={details[key] ?? ""} onChange={(e) => setDetail(key, e.target.value)}>
                      <option value="">Select…</option>
                      <option value="before">Before the event</option>
                      <option value="after">After the event</option>
                      <option value="both">Before and after</option>
                    </select>
                  ) : key === "debris_level" ? (
                    <select value={details[key] ?? ""} onChange={(e) => setDetail(key, e.target.value)}>
                      <option value="">Select…</option>
                      <option value="light">Light</option>
                      <option value="moderate">Moderate</option>
                      <option value="heavy">Heavy</option>
                    </select>
                  ) : (
                    <input
                      value={details[key] ?? ""}
                      onChange={(e) => setDetail(key, e.target.value)}
                      placeholder={FIELD_LABELS[key]}
                    />
                  )}
                </label>
              ))}
            </div>
          )}

          {/* Description */}
          {service.formFields.includes("description") && (
            <label className="cd-field">
              <span>{FIELD_LABELS.description}</span>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell us what needs cleaning, any problem areas, access instructions…"
              />
            </label>
          )}

          {/* Preferred date / time */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            {service.formFields.includes("preferred_date") && (
              <label className="cd-field">
                <span>{FIELD_LABELS.preferred_date}</span>
                <input type="date" value={prefDate} onChange={(e) => setPrefDate(e.target.value)} />
              </label>
            )}
            {service.formFields.includes("preferred_time") && (
              <label className="cd-field">
                <span>{FIELD_LABELS.preferred_time}</span>
                <input type="time" value={prefTime} onChange={(e) => setPrefTime(e.target.value)} />
              </label>
            )}
          </div>

          {service.formFields.includes("additional_notes") && (
            <label className="cd-field">
              <span>{FIELD_LABELS.additional_notes}</span>
              <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
            </label>
          )}

          {err && <p className="cd-error" style={{ color: "#dc2626" }}>{err}</p>}

          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginTop: "0.5rem" }}>
            <button type="submit" className="btn btn-primary" disabled={saving || !authChecked}>
              {saving ? "Submitting…" : "Submit Quotation Request"}
            </button>
            <a
              className="btn btn-outline"
              href={`https://wa.me/2349078870211?text=${encodeURIComponent(
                `Hi CleanConnect! I would like to request a quote for *${service.name}*. Please get back to me.`
              )}`}
              target="_blank"
              rel="noreferrer"
            >
              <i className="fab fa-whatsapp" /> Prefer WhatsApp?
            </a>
          </div>

          <p style={{ fontSize: "0.85rem", color: "var(--muted-foreground)" }}>
            Submitting creates a request inside CleanConnect. You will receive a formal quotation in your dashboard.
            WhatsApp is an alternative if you prefer to chat directly.
          </p>
        </form>
      </div>
      <Footer />
    </>
  );
}
