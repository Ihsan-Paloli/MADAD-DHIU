DROP POLICY IF EXISTS "Anyone can register" ON public.event_registrations;
CREATE POLICY "Anyone can register with required details"
ON public.event_registrations
FOR INSERT
TO anon, authenticated
WITH CHECK (program_id IS NOT NULL AND length(trim(full_name)) > 0);

DROP POLICY IF EXISTS "Anyone can submit feedback" ON public.feedback;
CREATE POLICY "Anyone can submit feedback with required details"
ON public.feedback
FOR INSERT
TO anon, authenticated
WITH CHECK (length(trim(email)) > 3 AND position('@' in email) > 1 AND length(trim(message)) > 0);

CREATE POLICY "No client access to email verification records"
ON public.email_verifications
FOR ALL
TO anon, authenticated
USING (false)
WITH CHECK (false);

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO service_role;