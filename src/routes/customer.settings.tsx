import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { changePassword } from "@/lib/customer-auth";
import { updateProfile, useCustomerData } from "@/lib/customer-data";

export const Route = createFileRoute("/customer/settings")({
  component: CustomerSettings,
});

function CustomerSettings() {
  const { data, reload } = useCustomerData();
  const p = data.profile;
  const [pwd, setPwd] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  const toggle = async (key: "notify_email" | "notify_sms" | "notify_bookings" | "notify_promotions", value: boolean) => {
    await updateProfile({ [key]: value });
    await reload();
  };

  return (
    <div className="cd-page">
      <div className="pd-page-head">
        <div>
          <h1>Settings</h1>
          <p>Notifications, security and your referral link.</p>
        </div>
      </div>

      <section className="pd-panel cd-form">
        <h2>Notifications</h2>
        {(
          [
            ["notify_email", "Email notifications"],
            ["notify_sms", "SMS notifications"],
            ["notify_bookings", "Booking updates"],
            ["notify_promotions", "Promotions & offers"],
          ] as const
        ).map(([key, label]) => (
          <label className="cd-check" key={key}>
            <input type="checkbox" checked={Boolean(p?.[key])} onChange={(e) => void toggle(key, e.target.checked)} />
            <span>{label}</span>
          </label>
        ))}
      </section>

      <section className="pd-panel cd-form">
        <h2>Refer &amp; Earn</h2>
        <p className="cd-sub">Share your code and earn rewards on every friend's first booking.</p>
        <div className="cd-total">
          <span>Your referral code</span>
          <strong>{p?.referral_code ?? "—"}</strong>
        </div>
      </section>

      <form
        className="pd-panel cd-form"
        onSubmit={async (e) => {
          e.preventDefault();
          const res = await changePassword(pwd);
          setMsg(res.ok ? "Password updated." : res.error);
          if (res.ok) setPwd("");
        }}
      >
        <h2>Change password</h2>
        <label className="cd-field">
          <span>New password</span>
          <input type="password" value={pwd} onChange={(e) => setPwd(e.target.value)} minLength={8} required />
        </label>
        {msg && <p className="cd-ok">{msg}</p>}
        <button type="submit" className="pd-btn pd-btn-primary">
          Update Password
        </button>
      </form>
    </div>
  );
}
