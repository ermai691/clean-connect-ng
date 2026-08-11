// Real customer data layer — every read/write is scoped to the authenticated
// customer by RLS. No demo data, no localStorage state.

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { CustomerProfile } from "@/lib/customer-auth";

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "provider_assigned"
  | "accepted"
  | "on_the_way"
  | "arrived"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "rejected";

export type Booking = {
  id: string;
  reference: string;
  customer_id: string;
  provider_id: string | null;
  service: string;
  package: string | null;
  category: string;
  amount: number;
  scheduled_for: string;
  address: string | null;
  notes: string | null;
  status: BookingStatus;
  created_at: string;
};

export type Payment = {
  id: string;
  booking_id: string | null;
  amount: number;
  method: string;
  status: "pending" | "successful" | "failed" | "refunded";
  created_at: string;
};

export type WalletTx = {
  id: string;
  description: string;
  amount: number;
  status: string;
  created_at: string;
};

export type Review = {
  id: string;
  booking_id: string;
  provider_id: string | null;
  service: string;
  rating: number;
  comment: string | null;
  created_at: string;
};

export type Message = {
  id: string;
  booking_id: string | null;
  sender_id: string;
  recipient_id: string;
  body: string;
  read: boolean;
  created_at: string;
};

export type Notification = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  read: boolean;
  created_at: string;
};

export type Address = {
  id: string;
  label: string;
  street: string;
  city: string | null;
  state: string | null;
  is_default: boolean;
};

export type CustomerData = {
  profile: CustomerProfile | null;
  bookings: Booking[];
  payments: Payment[];
  wallet: WalletTx[];
  reviews: Review[];
  messages: Message[];
  notifications: Notification[];
  addresses: Address[];
};

const EMPTY: CustomerData = {
  profile: null,
  bookings: [],
  payments: [],
  wallet: [],
  reviews: [],
  messages: [],
  notifications: [],
  addresses: [],
};

export const STATUS_LABEL: Record<BookingStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  provider_assigned: "Provider Assigned",
  accepted: "Accepted",
  on_the_way: "On The Way",
  arrived: "Arrived",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
  rejected: "Rejected",
};

export function statusTone(status: BookingStatus) {
  if (status === "completed") return "ok";
  if (status === "cancelled" || status === "rejected") return "bad";
  if (status === "pending") return "warn";
  return "info";
}

const UPCOMING: BookingStatus[] = [
  "pending",
  "confirmed",
  "provider_assigned",
  "accepted",
  "on_the_way",
  "arrived",
  "in_progress",
];

export const isUpcoming = (b: Booking) => UPCOMING.includes(b.status);

/** Loads everything the customer dashboard needs, then keeps it live. */
export function useCustomerData() {
  const [userId, setUserId] = useState<string | null>(null);
  const [data, setData] = useState<CustomerData>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Each hook instance owns its own realtime topic: supabase-js reuses a channel
  // by topic name, and calling `.on()` on an already-subscribed channel throws.
  const topicRef = useRef(`customer-${Math.random().toString(36).slice(2)}`);

  const load = useCallback(async () => {
    setError(null);
    const { data: auth } = await supabase.auth.getUser();
    const uid = auth.user?.id ?? null;
    setUserId(uid);
    if (!uid) {
      setData(EMPTY);
      setLoading(false);
      return;
    }
    try {
      const [profile, bookings, payments, wallet, reviews, messages, notifications, addresses] =
        await Promise.all([
          supabase.from("profiles").select("*").eq("id", uid).maybeSingle(),
          supabase.from("bookings").select("*").eq("customer_id", uid).order("scheduled_for", { ascending: true }),
          supabase.from("payments").select("*").eq("customer_id", uid).order("created_at", { ascending: false }),
          supabase.from("wallet_transactions").select("*").eq("user_id", uid).order("created_at", { ascending: false }),
          supabase.from("reviews").select("*").eq("customer_id", uid).order("created_at", { ascending: false }),
          supabase
            .from("messages")
            .select("*")
            .or(`sender_id.eq.${uid},recipient_id.eq.${uid}`)
            .order("created_at", { ascending: false }),
          supabase.from("notifications").select("*").eq("user_id", uid).order("created_at", { ascending: false }),
          supabase.from("addresses").select("*").eq("user_id", uid).order("created_at", { ascending: true }),
        ]);

      // A brand-new customer may not have a profile row yet — create it, never crash.
      let profileRow = (profile.data as CustomerProfile | null) ?? null;
      if (!profileRow) profileRow = await ensureCustomerRecords();

      setData({
        profile: profileRow,
        bookings: (bookings.data ?? []) as Booking[],
        payments: (payments.data ?? []) as Payment[],
        wallet: (wallet.data ?? []) as WalletTx[],
        reviews: (reviews.data ?? []) as Review[],
        messages: (messages.data ?? []) as Message[],
        notifications: (notifications.data ?? []) as Notification[],
        addresses: (addresses.data ?? []) as Address[],
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  // Live updates when admin/provider change a booking, or a message/notification arrives.
  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel(`${topicRef.current}-${userId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "bookings" }, () => void load())
      .on("postgres_changes", { event: "*", schema: "public", table: "messages" }, () => void load())
      .on("postgres_changes", { event: "*", schema: "public", table: "notifications" }, () => void load())
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [userId, load]);


  return { userId, data, loading, error, reload: load };
}

/* --------------------------- derived stats --------------------------- */

export function customerStats(d: CustomerData) {
  const completed = d.bookings.filter((b) => b.status === "completed");
  const spent = d.payments.filter((p) => p.status === "successful").reduce((t, p) => t + Number(p.amount), 0);
  return {
    upcoming: d.bookings.filter(isUpcoming).length,
    completed: completed.length,
    totalSpent: spent,
    loyaltyPoints: d.profile?.loyalty_points ?? 0,
    walletBalance: Number(d.profile?.wallet_balance ?? 0),
    unreadMessages: d.messages.filter((m) => !m.read && m.recipient_id === d.profile?.id).length,
    unreadNotifications: d.notifications.filter((n) => !n.read).length,
    reviews: d.reviews.length,
    averageRatingGiven: d.reviews.length
      ? d.reviews.reduce((t, r) => t + r.rating, 0) / d.reviews.length
      : 0,
    totalBookings: d.bookings.length,
  };
}

/* --------------------------- mutations --------------------------- */

export async function createBookingRecord(input: {
  service: string;
  category: string;
  packageName: string;
  amount: number;
  scheduledFor: string;
  address: string;
  notes?: string;
  method: string;
}) {
  const { data: auth } = await supabase.auth.getUser();
  const uid = auth.user?.id;
  if (!uid) return { ok: false as const, error: "You need to be signed in to book." };

  const { data: booking, error } = await supabase
    .from("bookings")
    .insert({
      customer_id: uid,
      service: input.service,
      category: input.category,
      package: input.packageName,
      amount: input.amount,
      scheduled_for: input.scheduledFor,
      address: input.address,
      notes: input.notes ?? null,
      status: "pending",
    })
    .select()
    .single();

  if (error || !booking) return { ok: false as const, error: error?.message ?? "Could not create booking." };

  await supabase.from("payments").insert({
    booking_id: booking.id,
    customer_id: uid,
    amount: input.amount,
    method: input.method,
    status: "pending",
  });

  await supabase.from("notifications").insert({
    user_id: uid,
    type: "booking",
    title: "Booking received",
    body: `${input.service} · ${booking.reference} is awaiting confirmation.`,
  });

  return { ok: true as const, booking: booking as Booking };
}

export async function cancelBooking(id: string) {
  const { error } = await supabase.from("bookings").update({ status: "cancelled" }).eq("id", id);
  return error ? { ok: false as const, error: error.message } : { ok: true as const };
}

export async function submitReview(input: {
  bookingId: string;
  providerId: string | null;
  service: string;
  rating: number;
  comment: string;
}) {
  const { data: auth } = await supabase.auth.getUser();
  const uid = auth.user?.id;
  if (!uid) return { ok: false as const, error: "Not signed in." };
  const { error } = await supabase.from("reviews").insert({
    booking_id: input.bookingId,
    customer_id: uid,
    provider_id: input.providerId,
    service: input.service,
    rating: input.rating,
    comment: input.comment,
  });
  return error ? { ok: false as const, error: error.message } : { ok: true as const };
}

export async function saveAddress(input: {
  id?: string;
  label: string;
  street: string;
  city: string;
  state: string;
  isDefault: boolean;
}) {
  const { data: auth } = await supabase.auth.getUser();
  const uid = auth.user?.id;
  if (!uid) return { ok: false as const, error: "Not signed in." };

  if (input.isDefault) {
    await supabase.from("addresses").update({ is_default: false }).eq("user_id", uid);
  }
  const payload = {
    user_id: uid,
    label: input.label,
    street: input.street,
    city: input.city,
    state: input.state,
    is_default: input.isDefault,
  };
  const { error } = input.id
    ? await supabase.from("addresses").update(payload).eq("id", input.id)
    : await supabase.from("addresses").insert(payload);
  return error ? { ok: false as const, error: error.message } : { ok: true as const };
}

export async function deleteAddress(id: string) {
  const { error } = await supabase.from("addresses").delete().eq("id", id);
  return error ? { ok: false as const, error: error.message } : { ok: true as const };
}

export async function updateProfile(patch: Partial<CustomerProfile>) {
  const { data: auth } = await supabase.auth.getUser();
  const uid = auth.user?.id;
  if (!uid) return { ok: false as const, error: "Not signed in." };
  const { error } = await supabase.from("profiles").update(patch).eq("id", uid);
  return error ? { ok: false as const, error: error.message } : { ok: true as const };
}

export async function markNotificationsRead() {
  const { data: auth } = await supabase.auth.getUser();
  const uid = auth.user?.id;
  if (!uid) return;
  await supabase.from("notifications").update({ read: true }).eq("user_id", uid).eq("read", false);
}

export async function sendSupportMessage(body: string) {
  const { data: auth } = await supabase.auth.getUser();
  const uid = auth.user?.id;
  if (!uid) return { ok: false as const, error: "Not signed in." };
  // Support conversation: stored against the customer until an agent replies.
  const { error } = await supabase.from("messages").insert({ sender_id: uid, recipient_id: uid, body });
  return error ? { ok: false as const, error: error.message } : { ok: true as const };
}

export function ngn(value: number) {
  return `₦${Math.round(value).toLocaleString("en-NG")}`;
}
