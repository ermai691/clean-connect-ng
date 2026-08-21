import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { z } from "zod";

/**
 * Provisions only the authenticated caller's customer role.
 * The service-role key stays server-only; the caller identity comes from the
 * bearer token attached by the global Supabase function middleware.
 */
export const provisionCustomerRole = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({ fullName: z.string().trim().max(120).optional() }).parse(input))
  .handler(async ({ data }) => {
    const authorization = getRequestHeader("Authorization");
    const token = authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
    if (!token) return { ok: false as const, error: "You must be signed in." };

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: authData, error: authError } = await supabaseAdmin.auth.getUser(token);
    const user = authData.user;
    if (authError || !user || !user.email_confirmed_at) {
      return { ok: false as const, error: "Please confirm your email before continuing." };
    }

    const { error } = await supabaseAdmin
      .from("user_roles")
      .upsert({ user_id: user.id, role: "customer" }, { onConflict: "user_id,role", ignoreDuplicates: true });
    if (error) return { ok: false as const, error: "Customer role provisioning is not available yet." };

    return { ok: true as const, userId: user.id, fullName: data.fullName ?? null };
  });
