-- After earlier hardening, authenticated users only had SELECT on user_roles.
-- That broke customer signup/login because the app could not attach the customer role
-- when the server-side provisioner was unavailable or failed.
--
-- Restore INSERT for the authenticated role so a signed-in user can claim
-- customer or provider for themselves (never never admin).

GRANT SELECT, INSERT ON TABLE public.user_roles TO authenticated;

-- Re-create claim policy if missing (safe if it already exists)
DO $$ BEGIN
  CREATE POLICY "Users claim non-admin role"
    ON public.user_roles
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id AND role <> 'admin');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
