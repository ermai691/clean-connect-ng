import { createFileRoute } from "@tanstack/react-router";
import { EmptyState, ErrorState, Skeletons } from "@/components/CustomerShell";
import { customerStats, useCustomerData } from "@/lib/customer-data";

export const Route = createFileRoute("/customer/reviews")({
  component: CustomerReviews,
});

function CustomerReviews() {
  const { data, loading, error, reload } = useCustomerData();
  const stats = customerStats(data);

  if (error) return <ErrorState message={error} onRetry={() => void reload()} />;

  return (
    <div className="cd-page">
      <div className="pd-page-head">
        <div>
          <h1>My Reviews</h1>
          <p>
            {stats.reviews === 0
              ? "You haven't reviewed a service yet."
              : `${stats.reviews} review${stats.reviews > 1 ? "s" : ""} · ${stats.averageRatingGiven.toFixed(1)}★ average`}
          </p>
        </div>
      </div>

      <section className="pd-panel">
        {loading ? (
          <Skeletons rows={3} />
        ) : data.reviews.length === 0 ? (
          <EmptyState
            icon="fa-star"
            title="No reviews yet"
            body="After a completed service you can rate your professional."
            action={{ label: "View Bookings", to: "/customer/bookings" }}
          />
        ) : (
          <ul className="cd-list">
            {data.reviews.map((r) => (
              <li key={r.id}>
                <div className="cd-list-main">
                  <strong>{r.service}</strong>
                  <em>{new Date(r.created_at).toLocaleDateString()}</em>
                  {r.comment && <p className="cd-sub">{r.comment}</p>}
                </div>
                <span className="cd-rating" aria-label={`${r.rating} out of 5`}>
                  {"★".repeat(r.rating)}
                  <span className="cd-rating-off">{"★".repeat(5 - r.rating)}</span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
