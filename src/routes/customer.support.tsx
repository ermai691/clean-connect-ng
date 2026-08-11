import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { sendSupportMessage } from "@/lib/customer-data";

export const Route = createFileRoute("/customer/support")({
  component: CustomerSupport,
});

const FAQS = [
  { q: "How do I book a service?", a: "Open “Book a Service”, pick your service, date and address, then confirm." },
  { q: "When am I charged?", a: "Payment is recorded when you book and settled once the service is completed." },
  { q: "Can I cancel a booking?", a: "Yes — cancel any upcoming booking from “My Bookings” before it starts." },
  { q: "How do reviews work?", a: "After a completed service you can rate your professional from 1 to 5 stars." },
];

function CustomerSupport() {
  const [text, setText] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <div className="cd-page">
      <div className="pd-page-head">
        <div>
          <h1>Help &amp; Support</h1>
          <p>Answers to common questions, or send us a message.</p>
        </div>
      </div>

      <section className="pd-panel">
        <h2>Frequently asked questions</h2>
        <ul className="cd-faq">
          {FAQS.map((f) => (
            <li key={f.q}>
              <strong>{f.q}</strong>
              <p>{f.a}</p>
            </li>
          ))}
        </ul>
      </section>

      <form
        className="pd-panel cd-form"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!text.trim()) return;
          await sendSupportMessage(text.trim());
          setText("");
          setSent(true);
        }}
      >
        <h2>Contact support</h2>
        <label className="cd-field">
          <span>How can we help?</span>
          <textarea rows={4} value={text} onChange={(e) => setText(e.target.value)} />
        </label>
        {sent && <p className="cd-ok">Message sent — our team will reply in Messages.</p>}
        <button type="submit" className="pd-btn pd-btn-primary">
          Send Message
        </button>
      </form>
    </div>
  );
}
