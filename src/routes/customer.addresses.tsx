import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { EmptyState, ErrorState, Skeletons } from "@/components/CustomerShell";
import { deleteAddress, saveAddress, useCustomerData } from "@/lib/customer-data";

export const Route = createFileRoute("/customer/addresses")({
  component: CustomerAddresses;
});

function CustomerAddresses() {
  const { data, loading, error, reload } = useCustomerData();
  const [form, setForm] = useState({ label: "Home", street: "", city: "", state: "", isDefault: false });
  const [saving, setSaving] = useState(false);

  if (error) return <ErrorState message={error} onRetry={() => void reload()} />;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await saveAddress(form);
    setForm({ label: "Home", street: "", city: "", state: "", isDefault: false });
    await reload();
    setSaving(false);
  };

  return (
    <div className="cd-page">
      <div className="pd-page-head">
        <div>
          <h1>Addresses</h1>
          <p>Save the places we clean so booking takes seconds.</p>
        </div>
      </div>

      <section className="pd-panel">
        {loading ? (
          <Skeletons rows={2} />
        ) : data.addresses.length === 0 ? (
          <EmptyState icon="fa-location-dot" title="No saved addresses" body="Add your first address below." />
        ) : (
          <ul className="cd-list">
            {data.addresses.map((a) => (
              <li key={a.id}>
                <div className="cd-list-main">
                  <strong>
                    {a.label} {a.is_default && <span className="cd-badge is-info">Default</span>}
                  </strong>
                  <em>{[a.street, a.city, a.state].filter(Boolean).join(", ")}</em>
                </div>
                <button
                  type="button"
                  className="pd-btn pd-btn-ghost"
                  onClick={async () => {
                    await deleteAddress(a.id);
                    await reload();
                  }}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <form className="pd-panel cd-form" onSubmit={submit}>
        <h2>Add an address</h2>
        <div className="cd-form-row">
          <label className="cd-field">
            <span>Label</span>
            <input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} required />
          </label>
          <label className="cd-field">
            <span>Street</span>
            <input value={form.street} onChange={(e) => setForm({ ...form, street: e.target.value })} required />
          </label>
        </div>
        <div className="cd-form-row">
          <label className="cd-field">
            <span>City</span>
            <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          </label>
          <label className="cd-field">
            <span>State</span>
            <input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
          </label>
        </div>
        <label className="cd-check">
          <input
            type="checkbox"
            checked={form.isDefault}
            onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
          />
          <span>Make this my default address</span>
        </label>
        <button type="submit" className="pd-btn pd-btn-primary" disabled={saving}>
          {saving ? "Saving…" : "Save Address"}
        </button>
      </form>
    </div>
  );
}
