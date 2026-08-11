import { createFileRoute } from "@tanstack/react-router";
import { EmptyState, ErrorState, Skeletons } from "@/components/CustomerShell";
import { customerStats, ngn, useCustomerData } from "@/lib/customer-data";

export const Route = createFileRoute("/customer/payments")({
  component: CustomerPayments,
});

function CustomerPayments() {
  const { data, loading, error, reload } = useCustomerData();
  const stats = customerStats(data);

  if (error) return <ErrorState message={error} onRetry={() => void reload()} />;

  return (
    <div className="cd-page">
      <div className="pd-page-head">
        <div>
          <h1>Payments &amp; Wallet</h1>
          <p>Your balance, payment history and wallet activity.</p>
        </div>
      </div>

      <div className="pd-stats">
        <article className="pd-stat tone-blue">
          <span className="pd-stat-icon">
            <i className="fas fa-wallet" />
          </span>
          <div>
            <span className="pd-stat-label">Wallet Balance</span>
            <strong className="pd-stat-value">{ngn(stats.walletBalance)}</strong>
          </div>
        </article>
        <article className="pd-stat tone-green">
          <span className="pd-stat-icon">
            <i className="fas fa-money-bill-wave" />
          </span>
          <div>
            <span className="pd-stat-label">Total Spent</span>
            <strong className="pd-stat-value">{ngn(stats.totalSpent)}</strong>
          </div>
        </article>
        <article className="pd-stat tone-violet">
          <span className="pd-stat-icon">
            <i className="fas fa-gift" />
          </span>
          <div>
            <span className="pd-stat-label">Loyalty Points</span>
            <strong className="pd-stat-value">{stats.loyaltyPoints}</strong>
          </div>
        </article>
      </div>

      <section className="pd-panel">
        <header className="pd-panel-head">
          <h2>
            <i className="fas fa-receipt" /> Payment History
          </h2>
        </header>
        {loading ? (
          <Skeletons rows={4} />
        ) : data.payments.length === 0 ? (
          <EmptyState icon="fa-credit-card" title="No payments yet" body="Payments for your bookings will show here." />
        ) : (
          <div className="cd-table-wrap">
            <table className="cd-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Method</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.payments.map((p) => (
                  <tr key={p.id}>
                    <td>{new Date(p.created_at).toLocaleDateString()}</td>
                    <td>{p.method}</td>
                    <td>{ngn(Number(p.amount))}</td>
                    <td>
                      <span className={`cd-badge is-${p.status === "successful" ? "ok" : p.status === "failed" ? "bad" : "warn"}`}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="pd-panel">
        <header className="pd-panel-head">
          <h2>
            <i className="fas fa-arrow-right-arrow-left" /> Wallet Transactions
          </h2>
        </header>
        {loading ? (
          <Skeletons rows={3} />
        ) : data.wallet.length === 0 ? (
          <EmptyState icon="fa-piggy-bank" title="No wallet activity" body="Top-ups, refunds and rewards appear here." />
        ) : (
          <ul className="cd-list">
            {data.wallet.map((t) => (
              <li key={t.id}>
                <div className="cd-list-main">
                  <strong>{t.description}</strong>
                  <em>{new Date(t.created_at).toLocaleString()}</em>
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
  );
}
