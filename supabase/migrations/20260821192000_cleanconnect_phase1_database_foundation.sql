-- CleanConnect Phase 1: Database Foundation
-- Scope: application roles, user_roles foundation, secure role-check helper, and minimum RLS.
-- This migration intentionally does not create customer, booking, provider, payment,
-- messaging, notification, storage, or Edge Function objects.

DO $$
BEGIN
  CREATE TYPE public.app_role AS ENUM ('customer', 'provider', 'admin');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role)
);

COMMENT ON TABLE public.user_roles IS
  'Authoritative CleanConnect application roles. Authorization must use this table, not frontend state.';
COMMENT ON COLUMN public.user_roles.role IS
  'CleanConnect role: customer, provider, or admin.';

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON TABLE public.user_roles TO authenticated;
GRANT ALL ON TABLE public.user_roles TO service_role;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'user_roles'
      AND policyname = 'Users can read their own roles'
  ) THEN
    CREATE POLICY "Users can read their own roles"
      ON public.user_roles
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END
$$;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
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

COMMENT ON FUNCTION public.has_role(uuid, public.app_role) IS
  'Secure role check for RLS policies. Reads authoritative user_roles data under a controlled search_path.';

REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;
