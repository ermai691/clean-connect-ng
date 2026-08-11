import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ErrorState } from "@/components/CustomerShell";
import { updateProfile, useCustomerData } from "@/lib/customer-data";

export const Route = createFileRoute("/customer/profile")({
  component: CustomerProfilePage,
});

function CustomerProfilePage() {
  const { data, error, reload } = useCustomerData();
  const [form, setForm] = useState({ full_name: "", phone: "", city: "", state: "", address: "" });
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!data.profile) return;
    setForm({
      full_name: data.profile.full_name ?? "",
      phone: data.profile.phone ?? "",
      city: data.profile.city ?? "",
      state: data.profile.state ?? "",
      address: data.profile.address ?? "",
    });
  }, [data.profile]);

  if (error) return <ErrorState message={error} onRetry={() => void reload()} />;

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await updateProfile(form);
    await reload();
    setSaving(false);
    setSaved(true);
  };

  return (
    <div className="cd-page">
      <div className="pd-page-head">
        <div>
          <h1>My Profile</h1>
          <p>Keep your personal details up to date.</p>
        </div>
      </div>

      <form className="pd-panel cd-form" onSubmit={save}>
        <label className="cd-field">
          <span>Full name</span>
          <input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required />
        </label>
        <label className="cd-field">
          <span>Email</span>
          <input value={data.profile?.email ?? ""} readOnly />
        </label>
        <div className="cd-form-row">
          <label className="cd-field">
            <span>Phone</span>
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </label>
          <label className="cd-field">
            <span>City</span>
            <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          </label>
        </div>
        <div className="cd-form-row">
          <label className="cd-field">
            <span>State</span>
            <input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
          </label>
          <label className="cd-field">
            <span>Default address</span>
            <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </label>
        </div>
        {saved && <p className="cd-ok">Profile updated.</p>}
        <button type="submit" className="pd-btn pd-btn-primary" disabled={saving}>
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
