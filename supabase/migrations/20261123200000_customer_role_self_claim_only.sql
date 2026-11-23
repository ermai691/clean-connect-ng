-- Customers may claim only the customer role for themselves.
-- Provider and admin roles must be assigned with the service role (never from the browser).

GRANT SELECT, INSERT ON TABLE public.user_roles TO authenticated;

DROP POLICY IF EXISTS "Users claim non-admin role" ON public.user_roles;
DROP POLICY IF EXISTS "Users claim customer role only" ON public.user_roles;

CREATE POLICY "Users claim customer role only"
  ON public.user_roles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id AND role = 'customer');
