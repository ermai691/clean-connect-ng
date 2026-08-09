import { createServerFn } from "@tanstack/react-start";
import { getRequestUrl } from "@tanstack/react-start/server";
import { z } from "zod";

/**
 * Sends a real password-reset email to the configured CleanConnect administrator.
 *
 * - The allowed admin address lives in the server-only ADMIN_EMAIL secret.
 * - The admin auth account is provisioned on first request (no public admin sign-up).
 * - Any other address returns the same generic response (no account enumeration).
 * - No password is ever generated, returned or stored in the frontend.
 */
export const requestAdminPasswordSetup = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({ email: z.string().email() }).parse(input))
  .handler(async ({ data }) => {
    const adminEmail = process.env["ADMIN_EMAIL"]?.trim().toLowerCase();
    const email = data.email.trim().toLowerCase();
    const generic = { ok: true as const };

    if (!adminEmail || email !== adminEmail) return generic;

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Find or create the administrator auth account.
    let userId: string | null = null;
    const { data: list } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 200 });
    userId = list?.users.find((u) => u.email?.toLowerCase() === email)?.id ?? null;

    if (!userId) {
      const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: { full_name: "CleanConnect Admin" },
      });
      if (error || !created.user) return generic;
      userId = created.user.id;
    }

    await supabaseAdmin
      .from("user_roles")
      .upsert({ user_id: userId, role: "admin" }, { onConflict: "user_id,role" });

    const origin = new URL(getRequestUrl()).origin;
    await supabaseAdmin.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/reset-password`,
    });

    return generic;
  });
