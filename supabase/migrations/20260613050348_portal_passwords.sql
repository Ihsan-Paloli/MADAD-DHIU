-- Portal passwords for the Events and Auditing portals.
-- Stores scrypt password hashes. Server fns mutate via service_role.

CREATE TABLE IF NOT EXISTS public.portal_passwords (
  portal TEXT PRIMARY KEY CHECK (portal IN ('events','auditing')),
  password_hash TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

GRANT SELECT ON public.portal_passwords TO authenticated;
GRANT ALL ON public.portal_passwords TO service_role;

ALTER TABLE public.portal_passwords ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins read portal passwords"
  ON public.portal_passwords FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.portal_passwords (portal, password_hash) VALUES
  ('events', NULL),
  ('auditing', NULL)
ON CONFLICT (portal) DO NOTHING;
