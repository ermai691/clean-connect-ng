import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { EmptyState, ErrorState, Skeletons } from "@/components/CustomerShell";
import {
  cancelBooking,
  isUpcoming,
  ngn,
  statusTone,
  STATUS_LABEL,
  submitReview,
  useCustomerData,
  type Booking,
} from "@/lib/customer-data";

export const Route = createFileRoute("/customer/bookings")({
  component: CustomerBookings,
});

const TABS = ["Upcoming", "Completed", "Cancelled", "All"] as const;

function CustomerBookings() {
  const { data, loading, error, reload } = useCustomerData();
  const [tab, setTab] = useState<(typeof TABS)[number]>("Upcoming");
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [reviewFor, setReviewFor] = useState<Booking | null>(null);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return data.bookings.filter((b) => {
      const matchTab =
        tab === "All"
          ? true
          : tab === "Upcoming"
            ? isUpcoming(b)
            : tab === "Completed"
              ? b.status === "completed"
              : b.status === "cancelled" || b.status === "rejected";
      const matchQuery = !q || `${b.service} ${b.reference}`.toLowerCase().includes(q);
      return matchTab && matchQuery;
    });
  }, [data.bookings, tab, query]);

  if (error) return <ErrorState message={error} onRetry={() => void reload()} />;

  const onCancel = async (id: string) => {
    setBusy(id);
    await cancelBooking(id);
    await reload();
    setBusy(null);
  };

  return (
    <div className="cd-page">
      <div className="pd-page-head">
        <div>
          <h1>My Bookings</h1>
          <p>Track, manage and review every service you have booked.</p>
        </div>
        <Link to="/booking" className="pd-btn pd-btn-primary">
          <i className="fas fa-plus" /> New Booking
        </Link>
      </div>

      <section className="pd-panel">
        <div className="cd-toolbar">
          <div className="cd-tabs" role="tablist" aria-label="Booking filters">
            {TABS.map((t) => (
              <button
                key={t}
                type="button"
                role="tab"
                aria-selected={tab === t}
                className={`cd-tab${tab === t ? " active" : ""}`}
                onClick={() => setTab(t)}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="cd-field-inline">
            <i className="fas fa-magnifying-glass" aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search bookings"
              aria-label="Search bookings"
            />
          </div>
        </div>

        {loading ? (
          <Skeletons rows={5} />
        ) : rows.length === 0 ? (
          <EmptyState
            icon="fa-calendar-xmark"
            title="Nothing here yet"
            body="Bookings matching this filter will appear here."
            action={{ label: "Book a Service", to: "/booking" }}
          />
        ) : (
          <div className="cd-table-wrap">
            <table className="cd-table">
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Service</th>
                  <th>Schedule</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((b) => (
                  <tr key={b.id}>
                    <td>{b.reference}</td>
                    <td>
                      <strong>{b.service}</strong>
                      <em className="cd-sub">{b.package ?? b.category}</em>
                    </td>
                    <td>{new Date(b.scheduled_for).toLocaleString()}</td>
                    <td>{ngn(Number(b.amount))}</td>
                    <td>
                      <span className={`cd-badge is-${statusTone(b.status)}`}>{STATUS_LABEL[b.status]}</span>
                    </td>
                    <td>
                      {isUpcoming(b) ? (
                        <button
                          type="button"
                          className="pd-btn pd-btn-ghost"
                          disabled={busy === b.id}
                          onClick={() => void onCancel(b.id)}
                        >
                          {busy === b.id ? "Cancelling…" : "Cancel"}
                        </button>
                      ) : b.status === "completed" && !data.reviews.some((r) => r.booking_id === b.id) ? (
                        <button type="button" className="pd-btn pd-btn-ghost" onClick={() => setReviewFor(b)}>
                          Leave Review
                        </button>
                      ) : (
                        <span className="cd-sub">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {reviewFor && (
        <ReviewDialog
          booking={reviewFor}
          onClose={() => setReviewFor(null)}
          onDone={async () => {
            setReviewFor(null);
            await reload();
          }}
        />
      )}
    </div>
  );
}

function ReviewDialog({
  booking,
  onClose,
  onDone,
}: {
  booking: Booking;
  onClose: () => void;
  onDone: () => Promise<void>;
}) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const save = async () => {
    setSaving(true);
    const res = await submitReview({
      bookingId: booking.id,
      providerId: booking.provider_id,
      service: booking.service,
      rating,
      comment,
    });
    setSaving(false);
    if (!res.ok) return setErr(res.error);
    await onDone();
  };

  return (
    <div className="cd-modal" role="dialog" aria-modal="true" aria-label="Leave a review">
      <div className="cd-modal-card">
        <h2>Review {booking.service}</h2>
        <div className="cd-stars">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              aria-label={`${n} star${n > 1 ? "s" : ""}`}
              className={n <= rating ? "on" : ""}
              onClick={() => setRating(n)}
            >
              <i className="fas fa-star" />
            </button>
          ))}
        </div>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          placeholder="Tell others about your experience"
          aria-label="Review comment"
        />
        {err && <p className="cd-error">{err}</p>}
        <div className="cd-modal-actions">
          <button type="button" className="pd-btn pd-btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="pd-btn pd-btn-primary" disabled={saving} onClick={() => void save()}>
            {saving ? "Submitting…" : "Submit Review"}
          </button>
        </div>
      </div>
    </div>
  );
}
