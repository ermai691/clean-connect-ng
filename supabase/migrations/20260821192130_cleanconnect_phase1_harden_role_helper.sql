-- CleanConnect Phase 1 hardening: keep SECURITY DEFINER role checks out of the public API schema.
-- Future RLS policies should call private.has_role(...), not public.has_role(...).

CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;

CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  );
$$;

COMMENT ON FUNCTION private.has_role(uuid, public.app_role) IS
  'Secure internal role check for CleanConnect RLS policies; kept outside the public API schema.';

REVOKE ALL ON FUNCTION private.has_role(uuid, public.app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated, service_role;

-- Retain the original foundation symbol for migration compatibility, but do not expose it through RPC.
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated, service_role;
