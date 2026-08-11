import { createFileRoute } from "@tanstack/react-router";

// TEMPORARY debug-only endpoint (removed after verification).
export const Route = createFileRoute("/api/public/dev-test-user")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { email, password } = (await request.json()) as { email: string; password: string };
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data, error } = await supabaseAdmin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: { full_name: "Debug Tester" },
        });
        return new Response(JSON.stringify({ id: data?.user?.id, error: error?.message }), {
          headers: { "content-type": "application/json" },
        });
      },
    },
  },
});
