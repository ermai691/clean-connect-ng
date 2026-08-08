/**
 * CleanConnect — centralized platform data layer.
 *
 * One source of truth shared by the Customer, Provider and Admin dashboards.
 * Currently persisted to localStorage; swap `read`/`write` for Lovable Cloud
 * (or any backend) later without touching the dashboards.
 *
 * The platform starts COMPLETELY EMPTY — every collection is `[]` and every
 * derived statistic is 0 until real users generate activity.
 */

import { useSyncExternalStore } from "react";

/* ----------------------------- types ----------------------------- */

export type BookingStatus =
  | "pending"
  | "accepted"
  | "confirmed"
  | "ongoing"
  | "completed"
  | "cancelled"
  | "rejected";

export type ProviderStatus = "pending" | "approved" | "rejected" | "suspended";
export type CustomerStatus = "active" | "suspended";
export type PaymentStatus = "pending" | "paid" | "refunded" | "failed";

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  status: CustomerStatus;
  createdAt: string;
}

export interface Provider {
  id: string;
  name: string;
  email: string;
  phone?: string;
  services: string[];
  location?: string;
  rating: number;
  reviewCount: number;
  status: ProviderStatus;
  verified: boolean;
  createdAt: string;
}

export interface Booking {
  id: string;
  reference: string;
  customerId: string;
  customerName: string;
  providerId?: string;
  providerName?: string;
  service: string;
  category: string;
  amount: number;
  scheduledFor: string;
  status: BookingStatus;
  createdAt: string;
}

export interface Payment {
  id: string;
  bookingId: string;
  customerName: string;
  amount: number;
  method: string;
  status: PaymentStatus;
  createdAt: string;
}

export interface Review {
  id: string;
  bookingId: string;
  customerName: string;
  providerName: string;
  service: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Message {
  id: string;
  from: string;
  subject: string;
  body: string;
  read: boolean;
  createdAt: string;
}

export interface AppNotification {
  id: string;
  type: string;
  title: string;
  body?: string;
  read: boolean;
  createdAt: string;
}

export interface Activity {
  id: string;
  type:
    | "customer_registered"
    | "provider_registered"
    | "provider_approved"
    | "provider_rejected"
    | "booking_created"
    | "booking_completed"
    | "payment_received"
    | "review_submitted";
  title: string;
  detail?: string;
  createdAt: string;
}

export interface Service {
  id: string;
  name: string;
  category: string;
  price: number;
  active: boolean;
}

export interface PlatformState {
  customers: Customer[];
  providers: Provider[];
  bookings: Booking[];
  payments: Payment[];
  reviews: Review[];
  messages: Message[];
  notifications: AppNotification[];
  activity: Activity[];
  services: Service[];
}

export const EMPTY_STATE: PlatformState = {
  customers: [],
  providers: [],
  bookings: [],
  payments: [],
  reviews: [],
  messages: [],
  notifications: [],
  activity: [],
  services: [],
};

/* ----------------------------- store ----------------------------- */

const KEY = "cleanconnect_platform_v1";
const EVENT = "cc-platform-change";

const isBrowser = () => typeof window !== "undefined";

function read(): PlatformState {
  if (!isBrowser()) return EMPTY_STATE;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return EMPTY_STATE;
    return { ...EMPTY_STATE, ...(JSON.parse(raw) as Partial<PlatformState>) };
  } catch {
    return EMPTY_STATE;
  }
}

let cache: PlatformState | null = null;

function snapshot(): PlatformState {
  if (!cache) cache = read();
  return cache;
}

function write(next: PlatformState) {
  cache = next;
  if (isBrowser()) {
    window.localStorage.setItem(KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(EVENT));
  }
}

function update(fn: (state: PlatformState) => PlatformState) {
  write(fn(snapshot()));
}

function subscribe(cb: () => void) {
  if (!isBrowser()) return () => {};
  const handler = () => cb();
  window.addEventListener(EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}

/** Subscribe a component to the whole platform state. */
export function usePlatformData(): PlatformState {
  return useSyncExternalStore(subscribe, snapshot, () => EMPTY_STATE);
}

const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);
const now = () => new Date().toISOString();

function pushActivity(state: PlatformState, type: Activity["type"], title: string, detail?: string): Activity[] {
  return [{ id: uid(), type, title, detail, createdAt: now() }, ...state.activity].slice(0, 50);
}

function pushNotification(state: PlatformState, type: string, title: string, body?: string): AppNotification[] {
  return [{ id: uid(), type, title, body, read: false, createdAt: now() }, ...state.notifications].slice(0, 50);
}

/* ----------------------------- actions ----------------------------- */

export function registerCustomer(input: { name: string; email: string; phone?: string }) {
  update((s) => {
    if (s.customers.some((c) => c.email.toLowerCase() === input.email.toLowerCase())) return s;
    const customer: Customer = {
      id: uid(),
      name: input.name,
      email: input.email.toLowerCase(),
      phone: input.phone,
      status: "active",
      createdAt: now(),
    };
    return {
      ...s,
      customers: [customer, ...s.customers],
      activity: pushActivity(s, "customer_registered", "New customer registered", customer.name),
      notifications: pushNotification(s, "customer", "New customer registered", customer.name),
    };
  });
}

/** Called when a professional completes the "Join CleanConnect" registration. */
export function submitProviderApplication(input: {
  name: string;
  email: string;
  phone?: string;
  services?: string[];
  location?: string;
}) {
  update((s) => {
    if (s.providers.some((p) => p.email.toLowerCase() === input.email.toLowerCase())) return s;
    const provider: Provider = {
      id: uid(),
      name: input.name,
      email: input.email.toLowerCase(),
      phone: input.phone,
      services: input.services ?? [],
      location: input.location,
      rating: 0,
      reviewCount: 0,
      status: "pending",
      verified: false,
      createdAt: now(),
    };
    return {
      ...s,
      providers: [provider, ...s.providers],
      activity: pushActivity(s, "provider_registered", "New provider application", provider.name),
      notifications: pushNotification(s, "provider", "Provider application received", provider.name),
    };
  });
}

export function setProviderStatus(id: string, status: ProviderStatus) {
  update((s) => {
    const provider = s.providers.find((p) => p.id === id);
    if (!provider) return s;
    return {
      ...s,
      providers: s.providers.map((p) =>
        p.id === id ? { ...p, status, verified: status === "approved" ? true : p.verified } : p,
      ),
      activity:
        status === "approved"
          ? pushActivity(s, "provider_approved", "Provider approved", provider.name)
          : status === "rejected"
            ? pushActivity(s, "provider_rejected", "Provider application rejected", provider.name)
            : s.activity,
    };
  });
}

export function createBooking(input: {
  customerName: string;
  customerId?: string;
  service: string;
  category: string;
  amount: number;
  scheduledFor: string;
  providerId?: string;
  providerName?: string;
}) {
  const id = uid();
  update((s) => {
    const booking: Booking = {
      id,
      reference: `CC-${id.slice(0, 6).toUpperCase()}`,
      customerId: input.customerId ?? "",
      customerName: input.customerName,
      providerId: input.providerId,
      providerName: input.providerName,
      service: input.service,
      category: input.category,
      amount: input.amount,
      scheduledFor: input.scheduledFor,
      status: "pending",
      createdAt: now(),
    };
    return {
      ...s,
      bookings: [booking, ...s.bookings],
      activity: pushActivity(s, "booking_created", "New booking received", `${booking.service} · ${booking.customerName}`),
      notifications: pushNotification(s, "booking", "New booking received", booking.service),
    };
  });
  return id;
}

export function setBookingStatus(id: string, status: BookingStatus) {
  update((s) => {
    const booking = s.bookings.find((b) => b.id === id);
    if (!booking) return s;
    return {
      ...s,
      bookings: s.bookings.map((b) => (b.id === id ? { ...b, status } : b)),
      activity:
        status === "completed"
          ? pushActivity(s, "booking_completed", "Booking completed", `${booking.service} · ${booking.customerName}`)
          : s.activity,
    };
  });
}

export function recordPayment(input: {
  bookingId: string;
  customerName: string;
  amount: number;
  method: string;
  status?: PaymentStatus;
}) {
  update((s) => {
    const payment: Payment = {
      id: uid(),
      bookingId: input.bookingId,
      customerName: input.customerName,
      amount: input.amount,
      method: input.method,
      status: input.status ?? "paid",
      createdAt: now(),
    };
    return {
      ...s,
      payments: [payment, ...s.payments],
      activity: pushActivity(
        s,
        "payment_received",
        `Payment of ${formatNaira(payment.amount)} received`,
        payment.customerName,
      ),
    };
  });
}

export function addReview(input: {
  bookingId: string;
  customerName: string;
  providerName: string;
  service: string;
  rating: number;
  comment: string;
}) {
  update((s) => {
    const review: Review = { id: uid(), ...input, createdAt: now() };
    return {
      ...s,
      reviews: [review, ...s.reviews],
      providers: s.providers.map((p) => {
        if (p.name !== input.providerName) return p;
        const count = p.reviewCount + 1;
        return { ...p, reviewCount: count, rating: (p.rating * p.reviewCount + input.rating) / count };
      }),
      activity: pushActivity(s, "review_submitted", "New review submitted", `${input.rating}★ · ${input.providerName}`),
    };
  });
}

/** Development helper — wipes all platform activity back to the zero state. */
export function resetPlatform() {
  write(EMPTY_STATE);
}

/* ----------------------------- selectors ----------------------------- */

export function formatNaira(value: number) {
  return `₦${Math.round(value).toLocaleString("en-NG")}`;
}

const isToday = (iso: string) => new Date(iso).toDateString() === new Date().toDateString();

export interface AdminStats {
  totalCustomers: number;
  totalProviders: number;
  activeProviders: number;
  pendingProviders: number;
  todaysBookings: number;
  totalBookings: number;
  completedBookings: number;
  pendingBookings: number;
  cancelledBookings: number;
  totalRevenue: number;
  monthlyRevenue: number;
  totalReviews: number;
  averageRating: number;
  unreadMessages: number;
  unreadNotifications: number;
}

export function selectAdminStats(s: PlatformState): AdminStats {
  const paid = s.payments.filter((p) => p.status === "paid");
  const month = new Date().getMonth();
  return {
    totalCustomers: s.customers.length,
    totalProviders: s.providers.length,
    activeProviders: s.providers.filter((p) => p.status === "approved").length,
    pendingProviders: s.providers.filter((p) => p.status === "pending").length,
    todaysBookings: s.bookings.filter((b) => isToday(b.createdAt)).length,
    totalBookings: s.bookings.length,
    completedBookings: s.bookings.filter((b) => b.status === "completed").length,
    pendingBookings: s.bookings.filter((b) => b.status === "pending").length,
    cancelledBookings: s.bookings.filter((b) => b.status === "cancelled" || b.status === "rejected").length,
    totalRevenue: paid.reduce((t, p) => t + p.amount, 0),
    monthlyRevenue: paid
      .filter((p) => new Date(p.createdAt).getMonth() === month)
      .reduce((t, p) => t + p.amount, 0),
    totalReviews: s.reviews.length,
    averageRating: s.reviews.length
      ? s.reviews.reduce((t, r) => t + r.rating, 0) / s.reviews.length
      : 0,
    unreadMessages: s.messages.filter((m) => !m.read).length,
    unreadNotifications: s.notifications.filter((n) => !n.read).length,
  };
}

export const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Bookings per month for the current year — all zeros until real bookings exist. */
export function selectMonthlyBookings(s: PlatformState): number[] {
  const year = new Date().getFullYear();
  const out = new Array(12).fill(0) as number[];
  for (const b of s.bookings) {
    const d = new Date(b.createdAt);
    if (d.getFullYear() === year) out[d.getMonth()] += 1;
  }
  return out;
}

/** Revenue per month for the current year — all zeros until real payments exist. */
export function selectMonthlyRevenue(s: PlatformState): number[] {
  const year = new Date().getFullYear();
  const out = new Array(12).fill(0) as number[];
  for (const p of s.payments) {
    if (p.status !== "paid") continue;
    const d = new Date(p.createdAt);
    if (d.getFullYear() === year) out[d.getMonth()] += p.amount;
  }
  return out;
}

/** Share of bookings by service category. Empty array while there are no bookings. */
export function selectCategoryBreakdown(s: PlatformState): { category: string; count: number; pct: number }[] {
  if (!s.bookings.length) return [];
  const map = new Map<string, number>();
  for (const b of s.bookings) map.set(b.category, (map.get(b.category) ?? 0) + 1);
  return [...map.entries()]
    .map(([category, count]) => ({ category, count, pct: (count / s.bookings.length) * 100 }))
    .sort((a, b) => b.count - a.count);
}
