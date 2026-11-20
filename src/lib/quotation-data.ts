/**
 * Quotation data layer — Supabase-backed, RLS-scoped to the authenticated user.
 */

import { supabase } from "@/integrations/supabase/client";
import { findService } from "@/lib/service-catalog";

export type QuotationStatus =
  | "pending_review"
  | "under_review"
  | "quotation_sent"
  | "accepted"
  | "declined"
  | "expired"
  | "converted";

export type QuotationRequest = {
  id: string;
  reference: string;
  customer_id: string;
  service_id: string;
  service_name: string;
  customer_name: string;
  customer_phone: string | null;
  customer_email: string | null;
  address_street: string | null;
  address_city: string | null;
  address_state: string | null;
  full_address: string | null;
  details: Record<string, unknown>;
  description: string | null;
  additional_notes: string | null;
  preferred_date: string | null;
  preferred_time: string | null;
  status: QuotationStatus;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
};

export type Quotation = {
  id: string;
  request_id: string;
  issued_by: string | null;
  amount: number;
  breakdown: { label: string; amount: number }[];
  description: string | null;
  valid_until: string | null;
  issued_at: string;
  booking_id: string | null;
  created_at: string;
};

export const QUOTE_STATUS_LABEL: Record<QuotationStatus, string> = {
  pending_review: "Pending Review",
  under_review: "Under Review",
  quotation_sent: "Quotation Sent",
  accepted: "Accepted",
  declined: "Declined",
  expired: "Expired",
  converted: "Converted to Booking",
};

export function quoteStatusTone(status: QuotationStatus) {
  if (status === "accepted" || status === "converted") return "ok";
  if (status === "declined" || status === "expired") return "bad";
  if (status === "pending_review") return "warn";
  return "info";
}

export type SubmitQuoteInput = {
  serviceId: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  addressStreet?: string;
  addressCity?: string;
  addressState?: string;
  fullAddress?: string;
  details?: Record<string, unknown>;
  description?: string;
  additionalNotes?: string;
  preferredDate?: string;
  preferredTime?: string;
};

export async function submitQuotationRequest(input: SubmitQuoteInput) {
  const { data: auth } = await supabase.auth.getUser();
  const uid = auth.user?.id;
  if (!uid) return { ok: false as const, error: "You need to be signed in to request a quote." };

  const service = findService(input.serviceId);
  if (service.pricingType !== "quote") {
    return { ok: false as const, error: "This service does not require a quotation." };
  }

  const { data, error } = await supabase
    .from("quotation_requests")
    .insert({
      customer_id: uid,
      service_id: service.id,
      service_name: service.name,
      customer_name: input.customerName.trim(),
      customer_phone: input.customerPhone?.trim() || null,
      customer_email: input.customerEmail?.trim() || null,
      address_street: input.addressStreet?.trim() || null,
      address_city: input.addressCity?.trim() || null,
      address_state: input.addressState?.trim() || null,
      full_address: input.fullAddress?.trim() || null,
      details: input.details ?? {},
      description: input.description?.trim() || null,
      additional_notes: input.additionalNotes?.trim() || null,
      preferred_date: input.preferredDate || null,
      preferred_time: input.preferredTime || null,
      status: "pending_review",
    })
    .select()
    .single();

  if (error || !data) {
    return { ok: false as const, error: error?.message ?? "Could not submit quotation request." };
  }

  // Notify the customer
  await supabase.from("notifications").insert({
    user_id: uid,
    type: "quotation",
    title: "Quotation request received",
    body: `${service.name} · ${data.reference} is pending review. We'll send you a quote soon.`,
  });

  return { ok: true as const, request: data as QuotationRequest };
}

export async function fetchMyQuotationRequests() {
  const { data: auth } = await supabase.auth.getUser();
  const uid = auth.user?.id;
  if (!uid) return { ok: false as const, error: "Not signed in.", requests: [] as QuotationRequest[] };

  const { data, error } = await supabase
    .from("quotation_requests")
    .select("*")
    .eq("customer_id", uid)
    .order("created_at", { ascending: false });

  if (error) return { ok: false as const, error: error.message, requests: [] as QuotationRequest[] };
  return { ok: true as const, requests: (data ?? []) as QuotationRequest[] };
}

export async function fetchQuotationForRequest(requestId: string) {
  const { data, error } = await supabase
    .from("quotations")
    .select("*")
    .eq("request_id", requestId)
    .maybeSingle();

  if (error) return { ok: false as const, error: error.message, quotation: null };
  return { ok: true as const, quotation: data as Quotation | null };
}

export async function acceptQuotation(requestId: string) {
  const { data: auth } = await supabase.auth.getUser();
  const uid = auth.user?.id;
  if (!uid) return { ok: false as const, error: "Not signed in." };

  const { error } = await supabase
    .from("quotation_requests")
    .update({ status: "accepted" })
    .eq("id", requestId)
    .eq("customer_id", uid)
    .eq("status", "quotation_sent");

  if (error) return { ok: false as const, error: error.message };

  await supabase.from("notifications").insert({
    user_id: uid,
    type: "quotation",
    title: "Quotation accepted",
    body: "You accepted the quotation. You can now proceed to book and pay.",
  });

  return { ok: true as const };
}

export async function declineQuotation(requestId: string) {
  const { data: auth } = await supabase.auth.getUser();
  const uid = auth.user?.id;
  if (!uid) return { ok: false as const, error: "Not signed in." };

  const { error } = await supabase
    .from("quotation_requests")
    .update({ status: "declined" })
    .eq("id", requestId)
    .eq("customer_id", uid)
    .eq("status", "quotation_sent");

  if (error) return { ok: false as const, error: error.message };
  return { ok: true as const };
}

/** Admin helpers */
export async function fetchAllQuotationRequests(statusFilter?: QuotationStatus) {
  let q = supabase
    .from("quotation_requests")
    .select("*")
    .order("created_at", { ascending: false });

  if (statusFilter) q = q.eq("status", statusFilter);

  const { data, error } = await q;
  if (error) return { ok: false as const, error: error.message, requests: [] as QuotationRequest[] };
  return { ok: true as const, requests: (data ?? []) as QuotationRequest[] };
}

export async function issueQuotation(input: {
  requestId: string;
  amount: number;
  breakdown?: { label: string; amount: number }[];
  description?: string;
  validUntil?: string;
}) {
  const { data: auth } = await supabase.auth.getUser();
  const uid = auth.user?.id;
  if (!uid) return { ok: false as const, error: "Not signed in." };

  // Upsert quotation (one per request)
  const { data: existing } = await supabase
    .from("quotations")
    .select("id")
    .eq("request_id", input.requestId)
    .maybeSingle();

  let quotationError;
  if (existing) {
    const { error } = await supabase
      .from("quotations")
      .update({
        amount: input.amount,
        breakdown: input.breakdown ?? [],
        description: input.description ?? null,
        valid_until: input.validUntil || null,
        issued_by: uid,
        issued_at: new Date().toISOString(),
      })
      .eq("id", existing.id);
    quotationError = error;
  } else {
    const { error } = await supabase.from("quotations").insert({
      request_id: input.requestId,
      amount: input.amount,
      breakdown: input.breakdown ?? [],
      description: input.description ?? null,
      valid_until: input.validUntil || null,
      issued_by: uid,
    });
    quotationError = error;
  }

  if (quotationError) return { ok: false as const, error: quotationError.message };

  // Update request status + notify customer
  const { data: req } = await supabase
    .from("quotation_requests")
    .update({ status: "quotation_sent" })
    .eq("id", input.requestId)
    .select("customer_id, service_name, reference")
    .single();

  if (req) {
    await supabase.from("notifications").insert({
      user_id: req.customer_id,
      type: "quotation",
      title: "Quotation ready",
      body: `Your quote for ${req.service_name} (${req.reference}) is ready. Open your dashboard to review and accept.`,
    });
  }

  return { ok: true as const };
}

export async function setRequestStatus(requestId: string, status: QuotationStatus, adminNotes?: string) {
  const patch: Record<string, unknown> = { status };
  if (adminNotes !== undefined) patch.admin_notes = adminNotes;
  const { error } = await supabase.from("quotation_requests").update(patch).eq("id", requestId);
  return error ? { ok: false as const, error: error.message } : { ok: true as const };
}
