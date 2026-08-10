import { createFileRoute, Link } from "@tanstack/react-router";
import { EmptyState, ErrorState, Skeletons } from "@/components/CustomerShell";
import {
  customerStats,
  isUpcoming,
  ngn,
  statusTone,
  STATUS_LABEL,
  useCustomerData,
} from "@/lib/customer-data";

export const Route = createFileRoute("/customer/")({
  component: CustomerOverview,
});

function CustomerOverview() {
  const { data, loading, error, reload } = useCustomerData();
  const stats = customerStats(data);
  const upcoming = data.bookings.filter(isUpcoming);
  const recent = [...data.bookings]
    .sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at))
    .slice(0, 5);

  if (error) return <ErrorState message={error} onRetry={() => void reload()} />;

  const cards = [
    { icon: "fa-calendar-check", label: "Upcoming Bookings", value: String(stats.upcoming), tone: "blue" },
    { icon: "fa-circle-check", label: "Completed Services", value: String(stats.completed), tone: "green" },
    { icon: "fa-wallet", label: "Total Spent", value: ngn(stats.totalSpent), tone: "amber" },
    { icon: "fa-gift", label: "Loyalty Points", value: String(stats.loyaltyPoints), tone: "violet" },
  ];

  return (
    <div className="cd-page">
      <div className="pd-page-head">
        <div>
          <h1>Welcome back, {data.profile?.full_name?.split(" ")[0] ?? "there"} 👋</h1>
          <p>Here's what's happening with your CleanConnect account.</p>
        </div>
        <Link to="/booking" className="pd-btn pd-btn-primary">
          <i className="fas fa-plus" /> Book a Service
        </Link>
      </div>

      <div className="pd-stats">
        {cards.map((c) => (
          <article className={`pd-stat tone-${c.tone}`} key={c.label}>
            <span className="pd-stat-icon" aria-hidden="true">
              <i className={`fas ${c.icon}`} />
            </span>
            <div>
              <span className="pd-stat-label">{c.label}</span>
              <strong className="pd-stat-value">{loading ? "—" : c.value}</strong>
            </div>
          </article>
        ))}
      </div>

      <div className="cd-grid-2">
        <section className="pd-panel">
          <header className="pd-panel-head">
            <h2>
              <i className="fas fa-calendar" /> Upcoming Bookings
            </h2>
            <Link to="/customer/bookings" className="pd-link">
              View all
            </Link>
          </header>
          {loading ? (
            <Skeletons />
          ) : upcoming.length === 0 ? (
            <EmptyState
              icon="fa-calendar-plus"
              title="No upcoming bookings"
              body="Book your first cleaning service and it will show up here."
              action={{ label: "Book a Service", to: "/booking" }}
            />
          ) : (
            <ul className="cd-list">
              {upcoming.slice(0, 4).map((b) => (
                <li key={b.id}>
                  <span className="cd-list-icon" aria-hidden="true">
                    <i className="fas fa-broom" />
                  </span>
                  <div className="cd-list-main">
                    <strong>{b.service}</strong>
                    <em>
                      {new Date(b.scheduled_for).toLocaleString()} · {b.reference}
                    </em>
                  </div>
                  <span className={`cd-badge is-${statusTone(b.status)}`}>{STATUS_LABEL[b.status]}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="pd-panel">
          <header className="pd-panel-head">
            <h2>
              <i className="fas fa-wallet" /> Wallet
            </h2>
            <Link to="/customer/payments" className="pd-link">
              Details
            </Link>
          </header>
          <div className="cd-wallet">
            <span>Available balance</span>
            <strong>{ngn(stats.walletBalance)}</strong>
            <p>{stats.loyaltyPoints} loyalty points earned</p>
          </div>
          {data.wallet.length === 0 ? (
            <EmptyState icon="fa-receipt" title="No wallet activity yet" body="Your top-ups and refunds appear here." />
          ) : (
            <ul className="cd-list">
              {data.wallet.slice(0, 4).map((t) => (
                <li key={t.id}>
                  <div className="cd-list-main">
                    <strong>{t.description}</strong>
                    <em>{new Date(t.created_at).toLocaleDateString()}</em>
                  </div>
                  <span className={Number(t.amount) < 0 ? "cd-amount is-out" : "cd-amount is-in"}>
                    {ngn(Number(t.amount))}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="pd-panel">
        <header className="pd-panel-head">
          <h2>
            <i className="fas fa-clock-rotate-left" /> Recent Bookings
          </h2>
          <Link to="/customer/bookings" className="pd-link">
            View all
          </Link>
        </header>
        {loading ? (
          <Skeletons rows={4} />
        ) : recent.length === 0 ? (
          <EmptyState
            icon="fa-list-check"
            title="No bookings yet"
            body="Once you book a service, your history will build up here."
            action={{ label: "Book a Service", to: "/booking" }}
          />
        ) : (
          <div className="cd-table-wrap">
            <table className="cd-table">
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Service</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((b) => (
                  <tr key={b.id}>
                    <td>{b.reference}</td>
                    <td>{b.service}</td>
                    <td>{new Date(b.scheduled_for).toLocaleDateString()}</td>
                    <td>{ngn(Number(b.amount))}</td>
                    <td>
                      <span className={`cd-badge is-${statusTone(b.status)}`}>{STATUS_LABEL[b.status]}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
