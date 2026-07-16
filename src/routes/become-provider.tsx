import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Nav, Footer } from "@/components/Nav";

export const Route = createFileRoute("/become-provider")({
  head: () => ({
    meta: [
      { title: "Become a Provider — CleanConnect Abuja" },
      {
        name: "description",
        content:
          "Join CleanConnect as a verified cleaning or laundry professional in Abuja. Flexible hours, weekly payouts, and steady bookings.",
      },
      { property: "og:title", content: "Become a CleanConnect Provider" },
      {
        property: "og:description",
        content: "Grow your cleaning business with verified customers across Abuja.",
      },
    ],
  }),
  component: ProviderRegistration,
});

/* ---------- Static data ---------- */

const BENEFITS = [
  { icon: "fa-clock", title: "Flexible Hours", desc: "Work when you want." },
  { icon: "fa-money-bill-wave", title: "Weekly Earnings", desc: "Reliable payouts every week." },
  { icon: "fa-shield-halved", title: "Secure Payments", desc: "Encrypted, on-time transfers." },
  { icon: "fa-user-check", title: "Verified Customers", desc: "Screened, real bookings." },
  { icon: "fa-briefcase", title: "More Jobs", desc: "Steady demand across Abuja." },
  { icon: "fa-bell", title: "Real-time Requests", desc: "Instant booking alerts." },
];

const SERVICES = [
  "House Cleaning", "Deep Cleaning", "Move-In Cleaning", "Move-Out Cleaning",
  "Office Cleaning", "Post-Construction Cleaning", "Laundry Services", "Sofa Cleaning",
  "Carpet Cleaning", "Window Cleaning", "Fumigation & Pest Control", "Airbnb Cleaning",
  "Commercial Cleaning", "School Cleaning", "Hospital Cleaning", "Restaurant Cleaning",
  "Warehouse Cleaning", "Event Cleanup",
];

const ABUJA_AREAS = [
  "Wuse", "Maitama", "Asokoro", "Garki", "Utako", "Jabi", "Gwarinpa",
  "Kubwa", "Lokogoma", "Life Camp", "Katampe", "Lugbe", "Karu", "Nyanya",
];

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const STEPS = [
  "Personal", "Identity", "Professional", "Bank", "Background", "Review",
] as const;

const FAQS = [
  {
    q: "How long does approval take?",
    a: "Most providers are verified and activated within 24–48 hours of submission.",
  },
  {
    q: "Do I need my own equipment?",
    a: "Not required. Providers with equipment earn more, but starter tools can be provided.",
  },
  {
    q: "When do I get paid?",
    a: "Payouts run every Monday for the previous week directly to your bank account.",
  },
  {
    q: "Is there a signup fee?",
    a: "No. Registration is completely free. We only take a small service fee per completed job.",
  },
];

const TESTIMONIALS = [
  { name: "Grace A.", role: "House Cleaner · Wuse", quote: "I've tripled my income since joining. Bookings come in every week." },
  { name: "Emeka O.", role: "Laundry Pro · Gwarinpa", quote: "Flexible schedule, verified clients, and payments always on time." },
  { name: "Blessing K.", role: "Deep Cleaning · Maitama", quote: "CleanConnect gave my small team access to premium customers." },
];

/* ---------- Types ---------- */

type FormState = {
  // Step 1
  fullName: string; email: string; phone: string; dob: string; gender: string;
  address: string; state: string; city: string; password: string;
  // Step 2
  passport: string | null; nin: string | null; license: string | null; selfie: string | null;
  // Step 3
  services: string[]; experience: string; languages: string;
  days: string[]; hoursFrom: string; hoursTo: string; bio: string; areas: string[];
  // Step 4
  bankName: string; accountName: string; accountNumber: string;
  // Step 5
  hasEquipment: boolean; hasTransport: boolean; weekends: boolean;
  agreeBg: boolean; agreePolicy: boolean;
};

const EMPTY: FormState = {
  fullName: "", email: "", phone: "", dob: "", gender: "",
  address: "", state: "FCT", city: "Abuja", password: "",
  passport: null, nin: null, license: null, selfie: null,
  services: [], experience: "", languages: "",
  days: [], hoursFrom: "08:00", hoursTo: "17:00", bio: "", areas: [],
  bankName: "", accountName: "", accountNumber: "",
  hasEquipment: false, hasTransport: false, weekends: false,
  agreeBg: false, agreePolicy: false,
};

const STORAGE_KEY = "cc_provider_draft";

/* ---------- Component ---------- */

function ProviderRegistration() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");

  // Auto-save
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setForm({ ...EMPTY, ...JSON.parse(raw) });
    } catch { /* ignore */ }
  }, []);
  useEffect(() => {
    try {
      const { passport, nin, license, selfie, ...rest } = form;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(rest));
    } catch { /* ignore */ }
  }, [form]);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const toggle = (arr: string[], v: string) =>
    arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];

  const pwStrength = useMemo(() => {
    const p = form.password;
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s; // 0..4
  }, [form.password]);

  const validateStep = (i: number): boolean => {
    const e: Record<string, string> = {};
    if (i === 0) {
      if (!form.fullName.trim()) e.fullName = "Required";
      if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Valid email required";
      if (!/^[+\d\s-]{7,}$/.test(form.phone)) e.phone = "Valid phone required";
      if (!form.dob) e.dob = "Required";
      if (!form.gender) e.gender = "Required";
      if (!form.address.trim()) e.address = "Required";
      if (form.password.length < 8) e.password = "Min 8 characters";
    }
    if (i === 1) {
      if (!form.passport) e.passport = "Upload passport photo";
      if (!form.nin) e.nin = "Upload NIN";
      if (!form.selfie) e.selfie = "Upload selfie";
    }
    if (i === 2) {
      if (form.services.length === 0) e.services = "Pick at least one service";
      if (!form.experience) e.experience = "Required";
      if (form.days.length === 0) e.days = "Pick at least one day";
      if (form.areas.length === 0) e.areas = "Select at least one area";
      if (form.bio.trim().length < 20) e.bio = "Write at least 20 characters";
    }
    if (i === 3) {
      if (!form.bankName) e.bankName = "Required";
      if (!form.accountName.trim()) e.accountName = "Required";
      if (!/^\d{10}$/.test(form.accountNumber)) e.accountNumber = "10-digit NUBAN required";
    }
    if (i === 4) {
      if (!form.agreeBg) e.agreeBg = "Required";
      if (!form.agreePolicy) e.agreePolicy = "Required";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => {
    if (validateStep(step)) {
      setStep((s) => Math.min(s + 1, STEPS.length - 1));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };
  const back = () => setStep((s) => Math.max(0, s - 1));

  const submit = () => {
    if (!validateStep(4)) return;
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      localStorage.removeItem(STORAGE_KEY);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 1600);
  };

  if (submitted) return <SuccessView name={form.fullName} />;

  return (
    <>
      <Nav />

      {/* ---------- HERO ---------- */}
      <section className="pv-hero">
        <div className="container-x pv-hero-inner">
          <div className="pv-hero-left">
            <span className="pv-eyebrow">
              <i className="fas fa-briefcase" /> Provider Application
            </span>
            <h1>Become a <span className="pv-grad">CleanConnect</span> Provider</h1>
            <p className="pv-sub">
              Join thousands of trusted cleaning professionals, grow your business,
              and earn more by connecting with verified customers across Abuja.
            </p>
            <div className="pv-benefits">
              {BENEFITS.map((b) => (
                <div className="pv-benefit" key={b.title}>
                  <span className="pv-benefit-icon"><i className={`fas ${b.icon}`} /></span>
                  <div>
                    <strong>{b.title}</strong>
                    <small>{b.desc}</small>
                  </div>
                </div>
              ))}
            </div>
            <div className="pv-trust">
              <div><strong>4,200+</strong><small>Active Pros</small></div>
              <div><strong>₦180k</strong><small>Avg. Monthly</small></div>
              <div><strong>4.9★</strong><small>Provider Rating</small></div>
            </div>
          </div>
          <div className="pv-hero-right" aria-hidden>
            <div className="pv-illus">
              <div className="pv-illus-card pv-illus-a">
                <i className="fas fa-broom" />
                <div><strong>New booking</strong><small>Wuse II · 10am</small></div>
                <span className="pv-badge-green">₦12,000</span>
              </div>
              <div className="pv-illus-card pv-illus-b">
                <i className="fas fa-star" />
                <div><strong>5-star review</strong><small>"Amazing work!"</small></div>
              </div>
              <div className="pv-illus-card pv-illus-c">
                <i className="fas fa-wallet" />
                <div><strong>Weekly payout</strong><small>Sent to your bank</small></div>
                <span className="pv-badge-green">₦86,500</span>
              </div>
              <div className="pv-illus-blob" />
            </div>
          </div>
        </div>
      </section>

      {/* ---------- FORM ---------- */}
      <section className="pv-section">
        <div className="container-x">
          <div className="pv-form-card">
            {/* Progress */}
            <div className="pv-progress">
              {STEPS.map((label, i) => (
                <div key={label} className={`pv-step ${i === step ? "active" : ""} ${i < step ? "done" : ""}`}>
                  <span className="pv-step-dot">
                    {i < step ? <i className="fas fa-check" /> : i + 1}
                  </span>
                  <span className="pv-step-label">{label}</span>
                </div>
              ))}
              <div className="pv-progress-bar">
                <div style={{ width: `${(step / (STEPS.length - 1)) * 100}%` }} />
              </div>
            </div>

            <div className="pv-form-body">
              {step === 0 && (
                <Step1 form={form} set={set} errors={errors} pwStrength={pwStrength}
                  otpSent={otpSent} setOtpSent={setOtpSent} otp={otp} setOtp={setOtp} />
              )}
              {step === 1 && <Step2 form={form} set={set} errors={errors} />}
              {step === 2 && <Step3 form={form} set={set} errors={errors} toggle={toggle} />}
              {step === 3 && <Step4 form={form} set={set} errors={errors} />}
              {step === 4 && <Step5 form={form} set={set} errors={errors} />}
              {step === 5 && <Step6 form={form} goTo={setStep} />}
            </div>

            {/* Nav buttons */}
            <div className="pv-form-nav">
              <button className="btn btn-ghost" onClick={back} disabled={step === 0}>
                <i className="fas fa-arrow-left" /> Back
              </button>
              <span className="pv-save-hint">
                <i className="fas fa-cloud" /> Progress auto-saved
              </span>
              {step < STEPS.length - 1 ? (
                <button className="btn btn-primary" onClick={next}>
                  Continue <i className="fas fa-arrow-right" />
                </button>
              ) : (
                <button className="btn btn-primary" onClick={submit} disabled={submitting}>
                  {submitting ? (
                    <><span className="pv-spinner" /> Submitting…</>
                  ) : (
                    <>Submit Application <i className="fas fa-paper-plane" /></>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ---------- EARNINGS CALCULATOR ---------- */}
      <EarningsCalculator />

      {/* ---------- TESTIMONIALS ---------- */}
      <section className="pv-section pv-testi">
        <div className="container-x">
          <h2 className="pv-h2">Loved by providers across Abuja</h2>
          <div className="pv-testi-grid">
            {TESTIMONIALS.map((t) => (
              <div className="pv-testi-card" key={t.name}>
                <div className="pv-stars">{"★★★★★"}</div>
                <p>"{t.quote}"</p>
                <div className="pv-testi-who">
                  <span className="avatar">{t.name.charAt(0)}</span>
                  <div><strong>{t.name}</strong><small>{t.role}</small></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- FAQ ---------- */}
      <section className="pv-section">
        <div className="container-x">
          <h2 className="pv-h2">Provider FAQs</h2>
          <div className="pv-faq">
            {FAQS.map((f) => <FaqItem key={f.q} q={f.q} a={f.a} />)}
          </div>
          <div className="pv-trust-badges">
            <span><i className="fas fa-shield-halved" /> Bank-grade encryption</span>
            <span><i className="fas fa-user-shield" /> Verified background checks</span>
            <span><i className="fas fa-lock" /> PCI-DSS secure payouts</span>
          </div>
          <p className="pv-cta-line">
            Prefer to browse services first? <Link to="/">Back to home</Link>
          </p>
        </div>
      </section>

      <Footer />

      {/* Scoped styles */}
      <style>{PV_STYLES}</style>
    </>
  );
}

/* =========================================================
   STEP COMPONENTS
   ========================================================= */

function Field({ label, error, children, hint }: {
  label: string; error?: string; children: React.ReactNode; hint?: string;
}) {
  return (
    <div className="pv-field">
      <label>{label}</label>
      {children}
      {hint && !error && <small className="pv-hint">{hint}</small>}
      {error && <small className="pv-err"><i className="fas fa-circle-exclamation" /> {error}</small>}
    </div>
  );
}

function Step1({ form, set, errors, pwStrength, otpSent, setOtpSent, otp, setOtp }: any) {
  const labels = ["Weak", "Fair", "Good", "Strong", "Excellent"];
  const colors = ["#ef4444", "#f59e0b", "#eab308", "#22c55e", "#16a34a"];
  return (
    <>
      <StepHeader n={1} title="Personal Information" desc="Tell us who you are." />
      <div className="pv-grid-2">
        <Field label="Full Name" error={errors.fullName}>
          <input value={form.fullName} onChange={(e) => set("fullName", e.target.value)} placeholder="Ada Okoye" />
        </Field>
        <Field label="Email Address" error={errors.email}>
          <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="you@example.com" />
        </Field>
        <Field label="Phone Number" error={errors.phone} hint="We'll send an OTP to verify.">
          <div className="pv-phone-row">
            <input value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+234 801 234 5678" />
            <button type="button" className="btn btn-outline pv-otp-btn"
              onClick={() => setOtpSent(true)} disabled={!form.phone || otpSent}>
              {otpSent ? "Sent ✓" : "Send OTP"}
            </button>
          </div>
          {otpSent && (
            <input className="pv-otp-input" placeholder="Enter 6-digit OTP"
              value={otp} onChange={(e) => setOtp(e.target.value)} maxLength={6} />
          )}
        </Field>
        <Field label="Date of Birth" error={errors.dob}>
          <input type="date" value={form.dob} onChange={(e) => set("dob", e.target.value)} />
        </Field>
        <Field label="Gender" error={errors.gender}>
          <select value={form.gender} onChange={(e) => set("gender", e.target.value)}>
            <option value="">Select…</option>
            <option>Female</option><option>Male</option><option>Prefer not to say</option>
          </select>
        </Field>
        <Field label="State">
          <input value={form.state} onChange={(e) => set("state", e.target.value)} />
        </Field>
        <Field label="City">
          <input value={form.city} onChange={(e) => set("city", e.target.value)} />
        </Field>
        <Field label="Residential Address" error={errors.address}>
          <input value={form.address} onChange={(e) => set("address", e.target.value)}
            placeholder="House number, street, district" />
        </Field>
        <Field label="Create Password" error={errors.password}
          hint="Min 8 chars. Use upper, number & symbol for strength.">
          <input type="password" value={form.password} onChange={(e) => set("password", e.target.value)} />
          <div className="pv-pw">
            {[0, 1, 2, 3].map((i) => (
              <span key={i} style={{ background: i < pwStrength ? colors[pwStrength - 1] : "#e2e8f0" }} />
            ))}
            <em style={{ color: pwStrength ? colors[pwStrength - 1] : "#94a3b8" }}>
              {form.password ? labels[Math.max(0, pwStrength - 1)] : ""}
            </em>
          </div>
        </Field>
      </div>
    </>
  );
}

function Step2({ form, set, errors }: any) {
  return (
    <>
      <StepHeader n={2} title="Identity Verification" desc="We verify every provider to keep customers safe." />
      <div className="pv-grid-2">
        <UploadBox label="Passport Photograph" value={form.passport} onChange={(v) => set("passport", v)} error={errors.passport} icon="fa-id-badge" />
        <UploadBox label="National ID / NIN" value={form.nin} onChange={(v) => set("nin", v)} error={errors.nin} icon="fa-id-card" />
        <UploadBox label="Driver's License / Voter's Card" value={form.license} onChange={(v) => set("license", v)} icon="fa-address-card" optional />
        <UploadBox label="Selfie Verification" value={form.selfie} onChange={(v) => set("selfie", v)} error={errors.selfie} icon="fa-camera" />
      </div>
      <div className="pv-secure-notice">
        <i className="fas fa-shield-halved" />
        <div><strong>Secure Document Upload</strong>
          <small>Files are encrypted in transit and stored under strict access controls.</small></div>
      </div>
    </>
  );
}

function Step3({ form, set, errors, toggle }: any) {
  return (
    <>
      <StepHeader n={3} title="Professional Information" desc="Show off your skills and availability." />
      <div className="pv-field">
        <label>Services you offer {errors.services && <em className="pv-err-inline">— {errors.services}</em>}</label>
        <div className="pv-chip-grid">
          {SERVICES.map((s) => (
            <button type="button" key={s}
              className={`pv-chip ${form.services.includes(s) ? "active" : ""}`}
              onClick={() => set("services", toggle(form.services, s))}>
              {form.services.includes(s) && <i className="fas fa-check" />} {s}
            </button>
          ))}
        </div>
      </div>
      <div className="pv-grid-2">
        <Field label="Years of Experience" error={errors.experience}>
          <select value={form.experience} onChange={(e) => set("experience", e.target.value)}>
            <option value="">Select…</option>
            <option>Less than 1 year</option><option>1–2 years</option>
            <option>3–5 years</option><option>5+ years</option>
          </select>
        </Field>
        <Field label="Languages Spoken">
          <input value={form.languages} onChange={(e) => set("languages", e.target.value)}
            placeholder="English, Hausa, Igbo, Yoruba" />
        </Field>
        <Field label="Available Hours (from)">
          <input type="time" value={form.hoursFrom} onChange={(e) => set("hoursFrom", e.target.value)} />
        </Field>
        <Field label="Available Hours (to)">
          <input type="time" value={form.hoursTo} onChange={(e) => set("hoursTo", e.target.value)} />
        </Field>
      </div>
      <Field label="Available Days" error={errors.days}>
        <div className="pv-days">
          {DAYS.map((d) => (
            <button type="button" key={d}
              className={`pv-day ${form.days.includes(d) ? "active" : ""}`}
              onClick={() => set("days", toggle(form.days, d))}>{d}</button>
          ))}
        </div>
      </Field>
      <Field label="Areas You Can Serve (Abuja)" error={errors.areas}>
        <div className="pv-chip-grid">
          {ABUJA_AREAS.map((a) => (
            <button type="button" key={a}
              className={`pv-chip ${form.areas.includes(a) ? "active" : ""}`}
              onClick={() => set("areas", toggle(form.areas, a))}>
              <i className="fas fa-location-dot" /> {a}
            </button>
          ))}
        </div>
      </Field>
      <Field label="Short Bio" error={errors.bio} hint={`${form.bio.length}/400 characters`}>
        <textarea rows={4} maxLength={400} value={form.bio}
          onChange={(e) => set("bio", e.target.value)}
          placeholder="Introduce yourself, your experience, and what makes you a great provider…" />
      </Field>
    </>
  );
}

function Step4({ form, set, errors }: any) {
  return (
    <>
      <StepHeader n={4} title="Bank Information" desc="Where should we send your weekly payouts?" />
      <div className="pv-grid-2">
        <Field label="Bank Name" error={errors.bankName}>
          <select value={form.bankName} onChange={(e) => set("bankName", e.target.value)}>
            <option value="">Select bank…</option>
            {["Access Bank","GTBank","Zenith Bank","UBA","First Bank","Fidelity","Stanbic IBTC","Union Bank","Wema Bank","Kuda","Opay","PalmPay"].map(b => (
              <option key={b}>{b}</option>
            ))}
          </select>
        </Field>
        <Field label="Account Name" error={errors.accountName}>
          <input value={form.accountName} onChange={(e) => set("accountName", e.target.value)}
            placeholder="As shown on your bank statement" />
        </Field>
        <Field label="Account Number (NUBAN)" error={errors.accountNumber}>
          <input value={form.accountNumber} inputMode="numeric" maxLength={10}
            onChange={(e) => set("accountNumber", e.target.value.replace(/\D/g, ""))}
            placeholder="10-digit account number" />
        </Field>
      </div>
      <div className="pv-secure-notice">
        <i className="fas fa-lock" />
        <div><strong>Your banking information is encrypted and secure.</strong>
          <small>Bank-grade 256-bit encryption. Never shared with customers.</small></div>
      </div>
    </>
  );
}

function Step5({ form, set, errors }: any) {
  const items: Array<[keyof FormState, string]> = [
    ["hasEquipment", "I have my own cleaning equipment"],
    ["hasTransport", "I have transportation to job sites"],
    ["weekends", "I can work weekends"],
    ["agreeBg", "I agree to background verification"],
    ["agreePolicy", "I agree to CleanConnect's policies & terms"],
  ];
  return (
    <>
      <StepHeader n={5} title="Background & Equipment" desc="A few last details to complete your profile." />
      <div className="pv-check-list">
        {items.map(([k, label]) => (
          <label key={k as string} className={`pv-check ${form[k] ? "checked" : ""}`}>
            <input type="checkbox" checked={!!form[k]} onChange={(e) => set(k, e.target.checked as any)} />
            <span className="pv-check-box"><i className="fas fa-check" /></span>
            <span>{label}</span>
            {errors[k] && <em className="pv-err-inline">— required</em>}
          </label>
        ))}
      </div>
    </>
  );
}

function Step6({ form, goTo }: { form: FormState; goTo: (n: number) => void }) {
  const Row = ({ k, v }: { k: string; v: React.ReactNode }) => (
    <div className="pv-review-row"><span>{k}</span><strong>{v || <em>—</em>}</strong></div>
  );
  return (
    <>
      <StepHeader n={6} title="Review & Submit" desc="Check everything looks right before submitting." />
      <div className="pv-review">
        <ReviewBlock title="Personal" onEdit={() => goTo(0)}>
          <Row k="Name" v={form.fullName} />
          <Row k="Email" v={form.email} />
          <Row k="Phone" v={form.phone} />
          <Row k="DOB" v={form.dob} />
          <Row k="Gender" v={form.gender} />
          <Row k="Address" v={`${form.address}, ${form.city}, ${form.state}`} />
        </ReviewBlock>
        <ReviewBlock title="Identity" onEdit={() => goTo(1)}>
          <Row k="Passport" v={form.passport ? "✓ Uploaded" : ""} />
          <Row k="NIN" v={form.nin ? "✓ Uploaded" : ""} />
          <Row k="License" v={form.license ? "✓ Uploaded" : "Skipped"} />
          <Row k="Selfie" v={form.selfie ? "✓ Uploaded" : ""} />
        </ReviewBlock>
        <ReviewBlock title="Professional" onEdit={() => goTo(2)}>
          <Row k="Services" v={form.services.join(", ")} />
          <Row k="Experience" v={form.experience} />
          <Row k="Languages" v={form.languages} />
          <Row k="Days" v={form.days.join(", ")} />
          <Row k="Hours" v={`${form.hoursFrom} – ${form.hoursTo}`} />
          <Row k="Areas" v={form.areas.join(", ")} />
        </ReviewBlock>
        <ReviewBlock title="Bank" onEdit={() => goTo(3)}>
          <Row k="Bank" v={form.bankName} />
          <Row k="Account Name" v={form.accountName} />
          <Row k="Account No." v={form.accountNumber ? `••••${form.accountNumber.slice(-4)}` : ""} />
        </ReviewBlock>
      </div>
    </>
  );
}

function StepHeader({ n, title, desc }: { n: number; title: string; desc: string }) {
  return (
    <header className="pv-step-head">
      <span className="pv-step-num">Step {n}</span>
      <h2>{title}</h2>
      <p>{desc}</p>
    </header>
  );
}

function ReviewBlock({ title, onEdit, children }: { title: string; onEdit: () => void; children: React.ReactNode }) {
  return (
    <div className="pv-review-block">
      <div className="pv-review-head">
        <h3>{title}</h3>
        <button className="btn btn-ghost" onClick={onEdit}><i className="fas fa-pen" /> Edit</button>
      </div>
      <div className="pv-review-body">{children}</div>
    </div>
  );
}

/* ---------- Upload ---------- */

function UploadBox({ label, value, onChange, error, icon, optional }: {
  label: string; value: string | null; onChange: (v: string | null) => void;
  error?: string; icon: string; optional?: boolean;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);

  const handleFile = (file?: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => onChange((e.target?.result as string) || null);
    reader.readAsDataURL(file);
  };

  return (
    <div className="pv-field">
      <label>{label} {optional && <em className="pv-opt">(optional)</em>}</label>
      <div
        className={`pv-upload ${drag ? "drag" : ""} ${value ? "has-file" : ""} ${error ? "err" : ""}`}
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); handleFile(e.dataTransfer.files?.[0]); }}
        onClick={() => ref.current?.click()}
      >
        {value ? (
          <>
            <img src={value} alt="preview" />
            <button type="button" className="pv-upload-x"
              onClick={(e) => { e.stopPropagation(); onChange(null); }}
              aria-label="Remove"><i className="fas fa-times" /></button>
          </>
        ) : (
          <div className="pv-upload-empty">
            <span className="pv-upload-icon"><i className={`fas ${icon}`} /></span>
            <strong>Drop file or click to upload</strong>
            <small>PNG, JPG · up to 5MB</small>
          </div>
        )}
        <input ref={ref} type="file" accept="image/*" hidden
          onChange={(e) => handleFile(e.target.files?.[0])} />
      </div>
      {error && <small className="pv-err"><i className="fas fa-circle-exclamation" /> {error}</small>}
    </div>
  );
}

/* ---------- Success ---------- */

function SuccessView({ name }: { name: string }) {
  const stages = [
    { s: "done", i: "fa-paper-plane", t: "Application Submitted" },
    { s: "active", i: "fa-file-lines", t: "Documents Under Review" },
    { s: "pending", i: "fa-user-shield", t: "Background Verification" },
    { s: "pending", i: "fa-user-check", t: "Admin Approval" },
    { s: "idle", i: "fa-briefcase", t: "Ready to Receive Jobs" },
  ];
  return (
    <>
      <Nav />
      <section className="pv-success">
        <div className="container-x">
          <div className="pv-success-card">
            <div className="pv-success-tick">
              <i className="fas fa-check" />
              <span className="pv-ring" />
            </div>
            <h1>Application Submitted Successfully</h1>
            <p>Welcome{name ? `, ${name.split(" ")[0]}` : ""}! We've received your provider application.</p>
            <div className="pv-timeline">
              {stages.map((st, i) => (
                <div key={i} className={`pv-tl ${st.s}`}>
                  <span className="pv-tl-dot"><i className={`fas ${st.i}`} /></span>
                  <span className="pv-tl-label">{st.t}</span>
                </div>
              ))}
            </div>
            <div className="pv-eta">
              <i className="fas fa-clock" />
              <div><strong>Estimated approval: 24–48 hours</strong>
                <small>We'll email and SMS you once verified.</small></div>
            </div>
            <div className="pv-success-actions">
              <Link to="/" className="btn btn-outline">Back to Home</Link>
              <Link to="/dashboard" className="btn btn-primary">Go to Dashboard</Link>
            </div>
          </div>
        </div>
      </section>
      <Footer />
      <style>{PV_STYLES}</style>
    </>
  );
}

/* ---------- Earnings Calculator ---------- */

function EarningsCalculator() {
  const [jobs, setJobs] = useState(12);
  const [avg, setAvg] = useState(9000);
  const monthly = jobs * avg * 4;
  const yearly = monthly * 12;
  return (
    <section className="pv-section pv-calc">
      <div className="container-x">
        <div className="pv-calc-card">
          <div>
            <span className="pv-eyebrow"><i className="fas fa-calculator" /> Earnings Calculator</span>
            <h2 className="pv-h2">Estimate your monthly earnings</h2>
            <p className="pv-muted">Move the sliders to see what you could earn on CleanConnect.</p>
            <div className="pv-slider">
              <label>Jobs per week <strong>{jobs}</strong></label>
              <input type="range" min={1} max={30} value={jobs} onChange={(e) => setJobs(+e.target.value)} />
            </div>
            <div className="pv-slider">
              <label>Average pay per job <strong>₦{avg.toLocaleString()}</strong></label>
              <input type="range" min={3000} max={30000} step={500} value={avg} onChange={(e) => setAvg(+e.target.value)} />
            </div>
          </div>
          <div className="pv-calc-result">
            <small>Estimated Monthly</small>
            <div className="pv-calc-amt">₦{monthly.toLocaleString()}</div>
            <small>Yearly potential</small>
            <div className="pv-calc-year">₦{yearly.toLocaleString()}</div>
            <p className="pv-muted" style={{ marginTop: 12 }}>
              Top 10% of providers earn ₦450,000+ monthly.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- FAQ Item ---------- */

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`pv-faq-item ${open ? "open" : ""}`}>
      <button className="pv-faq-q" onClick={() => setOpen(!open)}>
        <span>{q}</span>
        <i className={`fas fa-chevron-${open ? "up" : "down"}`} />
      </button>
      {open && <div className="pv-faq-a">{a}</div>}
    </div>
  );
}

/* =========================================================
   STYLES
   ========================================================= */

const PV_STYLES = `
.pv-hero{position:relative;padding:96px 0 64px;background:var(--gradient-soft);overflow:hidden}
.pv-hero::before{content:"";position:absolute;inset:-100px -60px auto auto;width:520px;height:520px;background:radial-gradient(circle,rgba(37,99,235,.18),transparent 70%);filter:blur(20px)}
.pv-hero-inner{display:grid;grid-template-columns:1.15fr 1fr;gap:56px;align-items:center;position:relative}
.pv-eyebrow{display:inline-flex;gap:8px;align-items:center;padding:8px 14px;border-radius:999px;background:rgba(37,99,235,.1);color:var(--primary);font-weight:600;font-size:.85rem;margin-bottom:16px}
.pv-hero h1{font-size:clamp(2rem,4vw,3.4rem);line-height:1.1;font-weight:800;margin:0 0 14px;color:var(--foreground)}
.pv-grad{background:var(--gradient-hero);-webkit-background-clip:text;background-clip:text;color:transparent}
.pv-sub{font-size:1.1rem;color:var(--muted-foreground);max-width:560px;line-height:1.6;margin:0 0 28px}
.pv-benefits{display:grid;grid-template-columns:repeat(2,1fr);gap:14px;margin-bottom:28px}
.pv-benefit{display:flex;gap:12px;padding:14px;border-radius:14px;background:var(--glass-bg);border:1px solid var(--glass-border);backdrop-filter:blur(12px);transition:.25s}
.pv-benefit:hover{transform:translateY(-3px);box-shadow:var(--shadow-lg)}
.pv-benefit-icon{width:40px;height:40px;flex-shrink:0;display:grid;place-items:center;border-radius:10px;background:var(--gradient-primary);color:#fff}
.pv-benefit strong{display:block;font-size:.95rem;color:var(--foreground)}
.pv-benefit small{color:var(--muted-foreground);font-size:.8rem}
.pv-trust{display:flex;gap:32px;padding-top:20px;border-top:1px solid var(--border)}
.pv-trust>div strong{display:block;font-size:1.6rem;color:var(--primary);font-weight:800}
.pv-trust>div small{color:var(--muted-foreground);font-size:.85rem}

.pv-hero-right{position:relative;height:520px}
.pv-illus{position:relative;width:100%;height:100%}
.pv-illus-blob{position:absolute;inset:20px;border-radius:40% 60% 55% 45%/50% 45% 55% 50%;background:var(--gradient-hero);opacity:.9;animation:pvblob 10s ease-in-out infinite;box-shadow:var(--shadow-xl)}
@keyframes pvblob{0%,100%{border-radius:40% 60% 55% 45%/50% 45% 55% 50%}50%{border-radius:55% 45% 60% 40%/45% 55% 45% 55%}}
.pv-illus-card{position:absolute;background:#fff;border-radius:16px;padding:14px 16px;display:flex;align-items:center;gap:12px;box-shadow:var(--shadow-lg);animation:pvfloat 6s ease-in-out infinite;z-index:2}
.pv-illus-card i{width:38px;height:38px;display:grid;place-items:center;border-radius:10px;background:rgba(37,99,235,.1);color:var(--primary)}
.pv-illus-card strong{display:block;font-size:.9rem}
.pv-illus-card small{color:var(--muted-foreground);font-size:.78rem}
.pv-illus-a{top:8%;left:-4%;animation-delay:0s}
.pv-illus-b{top:44%;right:-2%;animation-delay:1.5s}
.pv-illus-c{bottom:8%;left:6%;animation-delay:3s}
.pv-badge-green{margin-left:auto;background:rgba(34,197,94,.12);color:#16a34a;padding:4px 10px;border-radius:999px;font-weight:700;font-size:.8rem}
@keyframes pvfloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}

.pv-section{padding:72px 0}
.pv-h2{font-size:clamp(1.6rem,2.4vw,2.2rem);font-weight:800;margin:0 0 24px;text-align:center}
.pv-muted{color:var(--muted-foreground)}

.pv-form-card{background:var(--glass-bg);border:1px solid var(--glass-border);backdrop-filter:blur(20px);border-radius:24px;box-shadow:var(--shadow-lg);padding:36px;max-width:1000px;margin:0 auto}
.pv-progress{position:relative;display:flex;justify-content:space-between;gap:12px;padding:0 4px 32px;border-bottom:1px solid var(--border);margin-bottom:32px}
.pv-progress-bar{position:absolute;left:0;right:0;bottom:-1px;height:3px;background:var(--muted);border-radius:3px;overflow:hidden}
.pv-progress-bar>div{height:100%;background:var(--gradient-primary);transition:width .4s ease}
.pv-step{flex:1;display:flex;flex-direction:column;align-items:center;gap:8px;text-align:center;color:var(--muted-foreground);position:relative;z-index:1}
.pv-step-dot{width:36px;height:36px;border-radius:50%;background:#fff;border:2px solid var(--border);display:grid;place-items:center;font-weight:700;transition:.3s}
.pv-step.active .pv-step-dot{background:var(--gradient-primary);color:#fff;border-color:transparent;box-shadow:0 4px 14px rgba(37,99,235,.35);transform:scale(1.08)}
.pv-step.done .pv-step-dot{background:var(--accent);color:#fff;border-color:transparent}
.pv-step.active,.pv-step.done{color:var(--foreground)}
.pv-step-label{font-size:.85rem;font-weight:600}

.pv-form-body{animation:pvfade .4s ease}
@keyframes pvfade{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
.pv-step-head{margin-bottom:24px}
.pv-step-num{color:var(--primary);font-weight:700;font-size:.85rem;letter-spacing:.05em;text-transform:uppercase}
.pv-step-head h2{font-size:1.6rem;font-weight:700;margin:6px 0}
.pv-step-head p{color:var(--muted-foreground);margin:0}

.pv-grid-2{display:grid;grid-template-columns:repeat(2,1fr);gap:18px}
.pv-field{display:flex;flex-direction:column;gap:8px;margin-bottom:6px}
.pv-field label{font-weight:600;font-size:.9rem;color:var(--foreground)}
.pv-field input,.pv-field select,.pv-field textarea{width:100%;padding:12px 14px;border:1.5px solid var(--border);border-radius:12px;font-family:inherit;font-size:.95rem;background:#fff;transition:.2s;color:var(--foreground)}
.pv-field input:focus,.pv-field select:focus,.pv-field textarea:focus{outline:none;border-color:var(--primary);box-shadow:0 0 0 4px rgba(37,99,235,.12)}
.pv-hint{color:var(--muted-foreground);font-size:.78rem}
.pv-err{color:#dc2626;font-size:.8rem;display:flex;align-items:center;gap:6px}
.pv-err-inline{color:#dc2626;font-style:normal;font-size:.8rem;margin-left:6px}
.pv-opt{color:var(--muted-foreground);font-style:normal;font-weight:400;font-size:.8rem}

.pv-phone-row{display:flex;gap:10px}
.pv-phone-row input{flex:1}
.pv-otp-btn{white-space:nowrap;padding:0 16px}
.pv-otp-input{margin-top:8px;letter-spacing:.4em;text-align:center;font-weight:700}

.pv-pw{display:flex;gap:6px;align-items:center;margin-top:4px}
.pv-pw span{height:6px;flex:1;background:var(--muted);border-radius:3px;transition:.25s}
.pv-pw em{font-style:normal;font-weight:600;font-size:.78rem;min-width:70px;text-align:right}

.pv-upload{position:relative;border:2px dashed var(--border);border-radius:16px;padding:20px;min-height:180px;display:grid;place-items:center;cursor:pointer;transition:.25s;background:#fff;overflow:hidden}
.pv-upload:hover{border-color:var(--primary);background:rgba(37,99,235,.02)}
.pv-upload.drag{border-color:var(--primary);background:rgba(37,99,235,.06);transform:scale(1.01)}
.pv-upload.has-file{border-style:solid;border-color:var(--accent);padding:0}
.pv-upload.err{border-color:#dc2626}
.pv-upload img{width:100%;height:180px;object-fit:cover}
.pv-upload-x{position:absolute;top:8px;right:8px;width:32px;height:32px;border-radius:50%;background:rgba(15,23,42,.7);color:#fff;border:none;cursor:pointer}
.pv-upload-empty{text-align:center;color:var(--muted-foreground)}
.pv-upload-empty strong{display:block;color:var(--foreground);margin:8px 0 2px}
.pv-upload-icon{display:inline-grid;place-items:center;width:52px;height:52px;border-radius:14px;background:var(--gradient-primary);color:#fff;font-size:1.2rem;margin-bottom:4px}

.pv-secure-notice{margin-top:20px;display:flex;gap:14px;padding:16px;border-radius:14px;background:rgba(34,197,94,.08);border:1px solid rgba(34,197,94,.25)}
.pv-secure-notice i{color:#16a34a;font-size:1.3rem;margin-top:2px}
.pv-secure-notice strong{display:block;color:var(--foreground)}
.pv-secure-notice small{color:var(--muted-foreground)}

.pv-chip-grid{display:flex;flex-wrap:wrap;gap:10px;margin-top:6px}
.pv-chip{padding:10px 14px;border-radius:999px;border:1.5px solid var(--border);background:#fff;cursor:pointer;font-family:inherit;font-size:.88rem;font-weight:500;color:var(--foreground);transition:.2s;display:inline-flex;align-items:center;gap:6px}
.pv-chip:hover{border-color:var(--primary);color:var(--primary);transform:translateY(-2px)}
.pv-chip.active{background:var(--gradient-primary);color:#fff;border-color:transparent;box-shadow:0 4px 12px rgba(37,99,235,.3)}

.pv-days{display:flex;gap:8px;flex-wrap:wrap}
.pv-day{width:56px;height:56px;border-radius:14px;border:1.5px solid var(--border);background:#fff;cursor:pointer;font-weight:700;font-family:inherit;transition:.2s;color:var(--foreground)}
.pv-day:hover{border-color:var(--primary)}
.pv-day.active{background:var(--gradient-primary);color:#fff;border-color:transparent;transform:scale(1.05)}

.pv-check-list{display:flex;flex-direction:column;gap:12px}
.pv-check{display:flex;align-items:center;gap:14px;padding:16px 18px;border:1.5px solid var(--border);border-radius:14px;cursor:pointer;transition:.2s;background:#fff}
.pv-check:hover{border-color:var(--primary)}
.pv-check.checked{border-color:var(--primary);background:rgba(37,99,235,.04)}
.pv-check input{display:none}
.pv-check-box{width:24px;height:24px;border-radius:8px;border:2px solid var(--border);display:grid;place-items:center;color:transparent;transition:.2s;flex-shrink:0}
.pv-check.checked .pv-check-box{background:var(--gradient-primary);border-color:transparent;color:#fff}

.pv-review{display:grid;gap:16px}
.pv-review-block{border:1px solid var(--border);border-radius:16px;overflow:hidden;background:#fff}
.pv-review-head{display:flex;justify-content:space-between;align-items:center;padding:14px 20px;background:var(--background);border-bottom:1px solid var(--border)}
.pv-review-head h3{margin:0;font-size:1.05rem}
.pv-review-body{padding:8px 20px}
.pv-review-row{display:flex;justify-content:space-between;gap:16px;padding:10px 0;border-bottom:1px dashed var(--border);font-size:.92rem}
.pv-review-row:last-child{border-bottom:none}
.pv-review-row span{color:var(--muted-foreground)}
.pv-review-row strong{text-align:right;max-width:65%;color:var(--foreground)}

.pv-form-nav{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-top:32px;padding-top:24px;border-top:1px solid var(--border);flex-wrap:wrap}
.pv-save-hint{color:var(--muted-foreground);font-size:.85rem;display:inline-flex;gap:6px;align-items:center}
.pv-spinner{width:16px;height:16px;border:2px solid rgba(255,255,255,.4);border-top-color:#fff;border-radius:50%;animation:pvspin .8s linear infinite;display:inline-block;margin-right:6px}
@keyframes pvspin{to{transform:rotate(360deg)}}

/* Calculator */
.pv-calc{background:var(--gradient-soft)}
.pv-calc-card{display:grid;grid-template-columns:1.2fr 1fr;gap:40px;background:#fff;border-radius:24px;padding:40px;box-shadow:var(--shadow-lg);align-items:center}
.pv-slider{margin-top:20px}
.pv-slider label{display:flex;justify-content:space-between;font-weight:600;margin-bottom:8px}
.pv-slider label strong{color:var(--primary)}
.pv-slider input[type=range]{width:100%;accent-color:var(--primary);height:6px}
.pv-calc-result{background:var(--gradient-hero);color:#fff;padding:32px;border-radius:20px;text-align:center;box-shadow:var(--shadow-xl)}
.pv-calc-result small{opacity:.85;letter-spacing:.05em;text-transform:uppercase;font-size:.75rem}
.pv-calc-amt{font-size:2.6rem;font-weight:800;margin:6px 0 18px;line-height:1}
.pv-calc-year{font-size:1.4rem;font-weight:700;opacity:.95}
.pv-calc-result .pv-muted{color:rgba(255,255,255,.8)}

/* Testimonials */
.pv-testi{background:#fff}
.pv-testi-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
.pv-testi-card{padding:24px;background:var(--gradient-soft);border-radius:20px;border:1px solid var(--border);transition:.25s}
.pv-testi-card:hover{transform:translateY(-4px);box-shadow:var(--shadow-lg)}
.pv-stars{color:#f59e0b;font-size:1.1rem;margin-bottom:8px}
.pv-testi-card p{font-size:.98rem;line-height:1.6;color:var(--foreground);margin:0 0 16px}
.pv-testi-who{display:flex;gap:12px;align-items:center}
.pv-testi-who .avatar{width:40px;height:40px;border-radius:50%;background:var(--gradient-primary);color:#fff;display:grid;place-items:center;font-weight:700}
.pv-testi-who strong{display:block;font-size:.92rem}
.pv-testi-who small{color:var(--muted-foreground);font-size:.8rem}

/* FAQ */
.pv-faq{max-width:820px;margin:0 auto;display:flex;flex-direction:column;gap:12px}
.pv-faq-item{background:#fff;border:1px solid var(--border);border-radius:14px;overflow:hidden;transition:.2s}
.pv-faq-item.open{border-color:var(--primary);box-shadow:var(--shadow-md)}
.pv-faq-q{width:100%;background:none;border:none;padding:18px 22px;display:flex;justify-content:space-between;align-items:center;cursor:pointer;font-family:inherit;font-size:1rem;font-weight:600;color:var(--foreground);text-align:left}
.pv-faq-q i{color:var(--primary)}
.pv-faq-a{padding:0 22px 20px;color:var(--muted-foreground);line-height:1.6}
.pv-trust-badges{display:flex;justify-content:center;gap:20px;flex-wrap:wrap;margin-top:36px;padding:20px;background:var(--background);border-radius:14px}
.pv-trust-badges span{display:inline-flex;gap:8px;align-items:center;color:var(--muted-foreground);font-weight:500;font-size:.9rem}
.pv-trust-badges i{color:var(--primary)}
.pv-cta-line{text-align:center;margin-top:20px;color:var(--muted-foreground)}
.pv-cta-line a{color:var(--primary);font-weight:600}

/* Success */
.pv-success{min-height:80vh;display:grid;place-items:center;padding:80px 0;background:var(--gradient-soft)}
.pv-success-card{background:#fff;border-radius:28px;padding:48px;text-align:center;max-width:720px;margin:0 auto;box-shadow:var(--shadow-xl);animation:pvfade .6s ease}
.pv-success-tick{position:relative;width:96px;height:96px;margin:0 auto 24px;background:var(--accent);border-radius:50%;display:grid;place-items:center;color:#fff;font-size:2.4rem;box-shadow:0 12px 40px rgba(34,197,94,.35);animation:pvpop .5s cubic-bezier(.34,1.56,.64,1)}
@keyframes pvpop{0%{transform:scale(0)}100%{transform:scale(1)}}
.pv-ring{position:absolute;inset:-8px;border-radius:50%;border:3px solid var(--accent);opacity:.4;animation:pvring 1.6s ease-out infinite}
@keyframes pvring{0%{transform:scale(1);opacity:.5}100%{transform:scale(1.4);opacity:0}}
.pv-success-card h1{font-size:2rem;margin:0 0 8px}
.pv-success-card>p{color:var(--muted-foreground);margin:0 0 32px}
.pv-timeline{display:flex;justify-content:space-between;gap:12px;margin-bottom:28px;position:relative}
.pv-timeline::before{content:"";position:absolute;top:24px;left:24px;right:24px;height:2px;background:var(--muted);z-index:0}
.pv-tl{flex:1;display:flex;flex-direction:column;align-items:center;gap:10px;position:relative;z-index:1}
.pv-tl-dot{width:48px;height:48px;border-radius:50%;display:grid;place-items:center;background:#fff;border:2px solid var(--border);color:var(--muted-foreground);transition:.3s}
.pv-tl.done .pv-tl-dot{background:var(--accent);color:#fff;border-color:transparent}
.pv-tl.active .pv-tl-dot{background:#fbbf24;color:#fff;border-color:transparent;animation:pvpulse 1.6s ease-in-out infinite}
.pv-tl.pending .pv-tl-dot{background:#fef3c7;color:#f59e0b;border-color:#fcd34d}
@keyframes pvpulse{0%,100%{box-shadow:0 0 0 0 rgba(251,191,36,.5)}50%{box-shadow:0 0 0 12px rgba(251,191,36,0)}}
.pv-tl-label{font-size:.78rem;font-weight:600;text-align:center;color:var(--foreground)}
.pv-tl.idle .pv-tl-label{color:var(--muted-foreground)}
.pv-eta{display:inline-flex;gap:12px;align-items:center;padding:14px 20px;background:rgba(37,99,235,.08);border-radius:14px;margin-bottom:24px;text-align:left}
.pv-eta i{color:var(--primary);font-size:1.4rem}
.pv-eta strong{display:block}
.pv-eta small{color:var(--muted-foreground);font-size:.82rem}
.pv-success-actions{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}

/* Responsive */
@media (max-width: 960px){
  .pv-hero{padding:64px 0 40px}
  .pv-hero-inner{grid-template-columns:1fr;gap:40px}
  .pv-hero-right{height:400px}
  .pv-calc-card{grid-template-columns:1fr;padding:28px}
  .pv-testi-grid{grid-template-columns:1fr}
  .pv-form-card{padding:24px}
}
@media (max-width: 640px){
  .pv-benefits{grid-template-columns:1fr}
  .pv-grid-2{grid-template-columns:1fr}
  .pv-trust{gap:16px;flex-wrap:wrap}
  .pv-step-label{display:none}
  .pv-progress{padding-bottom:24px}
  .pv-timeline{overflow-x:auto;padding-bottom:10px}
  .pv-tl-label{font-size:.7rem}
  .pv-form-nav{justify-content:center}
  .pv-save-hint{order:3;width:100%;justify-content:center;text-align:center}
  .pv-success-card{padding:32px 20px}
}
`;
