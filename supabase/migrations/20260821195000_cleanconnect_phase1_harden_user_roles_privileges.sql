-- CleanConnect Phase 1 security hardening: least-privilege table grants.
-- Scope is limited to public.user_roles table privileges.
-- RLS, policies, functions, constraints, and application-domain objects are unchanged.

REVOKE ALL PRIVILEGES ON TABLE public.user_roles FROM anon;
REVOKE ALL PRIVILEGES ON TABLE public.user_roles FROM authenticated;
GRANT SELECT ON TABLE public.user_roles TO authenticated;

-- service_role retains its existing trusted privileges for future server-side provisioning.
