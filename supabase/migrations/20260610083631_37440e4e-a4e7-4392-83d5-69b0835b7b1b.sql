-- ROLES
CREATE TYPE public.app_role AS ENUM ('admin', 'auditor', 'wing_lead', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;
REVOKE EXECUTE ON FUNCTION public.touch_updated_at() FROM PUBLIC, anon, authenticated;

-- ENUMS
CREATE TYPE public.event_status AS ENUM (
  'draft','registration_open','registration_closed','completed','result_published','archived'
);
CREATE TYPE public.result_status AS ENUM ('pending','draft','published');

-- ANNOUNCEMENTS
CREATE TABLE public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL, body TEXT NOT NULL, wing TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.announcements TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.announcements TO authenticated;
GRANT ALL ON public.announcements TO service_role;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view announcements" ON public.announcements FOR SELECT USING (true);
CREATE POLICY "Admins manage announcements" ON public.announcements FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER announcements_touch BEFORE UPDATE ON public.announcements FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
ALTER PUBLICATION supabase_realtime ADD TABLE public.announcements;
ALTER TABLE public.announcements REPLICA IDENTITY FULL;

-- PROGRAMS
CREATE TABLE public.programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, wing TEXT NOT NULL, event_date DATE NOT NULL,
  event_time TIME, end_time TIME, venue TEXT, description TEXT, poster_url TEXT,
  status public.event_status NOT NULL DEFAULT 'draft',
  result_status public.result_status NOT NULL DEFAULT 'pending',
  archived_at TIMESTAMPTZ,
  created_by_portal TEXT NOT NULL DEFAULT 'admin',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.programs TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.programs TO authenticated;
GRANT ALL ON public.programs TO service_role;
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view programs" ON public.programs FOR SELECT USING (true);
CREATE POLICY "Admins manage programs" ON public.programs FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER programs_touch BEFORE UPDATE ON public.programs FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
ALTER PUBLICATION supabase_realtime ADD TABLE public.programs;
ALTER TABLE public.programs REPLICA IDENTITY FULL;
CREATE INDEX programs_event_date_idx ON public.programs(event_date, event_time);
CREATE INDEX programs_wing_idx ON public.programs(wing);
CREATE INDEX programs_status_idx ON public.programs(status);
CREATE INDEX programs_archived_idx ON public.programs(archived_at);

CREATE OR REPLACE FUNCTION public.auto_complete_programs()
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE public.programs SET status = 'completed'
  WHERE archived_at IS NULL AND status IN ('registration_open','registration_closed') AND event_date < CURRENT_DATE;
$$;

-- EVENT REGISTRATIONS
CREATE TABLE public.event_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES public.programs(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL, email TEXT, phone TEXT, wing TEXT, notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.event_registrations TO authenticated;
GRANT INSERT ON public.event_registrations TO anon;
GRANT ALL ON public.event_registrations TO service_role;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can register" ON public.event_registrations FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Users view own registrations" ON public.event_registrations FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE INDEX event_registrations_program_idx ON public.event_registrations(program_id);

-- EVENT RESULTS
CREATE TABLE public.event_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL UNIQUE REFERENCES public.programs(id) ON DELETE CASCADE,
  first_place TEXT, first_place_photo_url TEXT,
  second_place TEXT, second_place_photo_url TEXT,
  third_place TEXT, third_place_photo_url TEXT,
  special_mention TEXT, special_mention_photo_url TEXT,
  result_pdf_url TEXT,
  attachments JSONB NOT NULL DEFAULT '[]'::jsonb,
  gallery_image_urls JSONB NOT NULL DEFAULT '[]'::jsonb,
  additional_info TEXT,
  status public.result_status NOT NULL DEFAULT 'draft',
  published_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.event_results TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.event_results TO authenticated;
GRANT ALL ON public.event_results TO service_role;
ALTER TABLE public.event_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view published results" ON public.event_results FOR SELECT USING (status = 'published');
CREATE POLICY "Admins view all results" ON public.event_results FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins manage results" ON public.event_results FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER event_results_touch BEFORE UPDATE ON public.event_results FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
ALTER PUBLICATION supabase_realtime ADD TABLE public.event_results;
ALTER TABLE public.event_results REPLICA IDENTITY FULL;

CREATE OR REPLACE FUNCTION public.sync_program_result_status()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  UPDATE public.programs
  SET result_status = NEW.status,
      status = CASE WHEN NEW.status = 'published' THEN 'result_published' ELSE status END,
      updated_at = now()
  WHERE id = NEW.program_id;
  RETURN NEW;
END; $$;
CREATE TRIGGER event_results_sync_program AFTER INSERT OR UPDATE ON public.event_results FOR EACH ROW EXECUTE FUNCTION public.sync_program_result_status();

-- GALLERY
CREATE TABLE public.gallery_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL, caption TEXT, category TEXT, wing TEXT,
  event_year INTEGER,
  program_id UUID REFERENCES public.programs(id) ON DELETE SET NULL,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.gallery_photos TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.gallery_photos TO authenticated;
GRANT ALL ON public.gallery_photos TO service_role;
ALTER TABLE public.gallery_photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view gallery" ON public.gallery_photos FOR SELECT USING (true);
CREATE POLICY "Admins manage gallery" ON public.gallery_photos FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER gallery_photos_touch BEFORE UPDATE ON public.gallery_photos FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
ALTER PUBLICATION supabase_realtime ADD TABLE public.gallery_photos;
ALTER TABLE public.gallery_photos REPLICA IDENTITY FULL;
CREATE INDEX gallery_photos_year_idx ON public.gallery_photos(event_year);
CREATE INDEX gallery_photos_wing_idx ON public.gallery_photos(wing);
CREATE INDEX gallery_photos_program_idx ON public.gallery_photos(program_id);

-- STATIONERY
CREATE TABLE public.stationery_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, price NUMERIC(10,2) NOT NULL DEFAULT 0,
  quantity INTEGER NOT NULL DEFAULT 0, description TEXT, image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.stationery_items TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.stationery_items TO authenticated;
GRANT ALL ON public.stationery_items TO service_role;
ALTER TABLE public.stationery_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view stationery" ON public.stationery_items FOR SELECT USING (true);
CREATE POLICY "Admins manage stationery" ON public.stationery_items FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER stationery_touch BEFORE UPDATE ON public.stationery_items FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
ALTER PUBLICATION supabase_realtime ADD TABLE public.stationery_items;
ALTER TABLE public.stationery_items REPLICA IDENTITY FULL;

-- AUDIT REPORTS
CREATE TABLE public.audit_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL, body TEXT, file_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.audit_reports TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.audit_reports TO authenticated;
GRANT ALL ON public.audit_reports TO service_role;
ALTER TABLE public.audit_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view audit reports" ON public.audit_reports FOR SELECT USING (true);
CREATE POLICY "Admins or auditors manage reports" ON public.audit_reports FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'auditor'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'auditor'));
CREATE TRIGGER audit_reports_touch BEFORE UPDATE ON public.audit_reports FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
ALTER PUBLICATION supabase_realtime ADD TABLE public.audit_reports;
ALTER TABLE public.audit_reports REPLICA IDENTITY FULL;

-- WING STATS OVERRIDES
CREATE TABLE public.wing_stats_overrides (
  wing TEXT PRIMARY KEY, total_programs INTEGER, active_members INTEGER, notes TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.wing_stats_overrides TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.wing_stats_overrides TO authenticated;
GRANT ALL ON public.wing_stats_overrides TO service_role;
ALTER TABLE public.wing_stats_overrides ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view wing stats" ON public.wing_stats_overrides FOR SELECT USING (true);
CREATE POLICY "Admins or auditors manage wing stats" ON public.wing_stats_overrides FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'auditor'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'auditor'));
ALTER PUBLICATION supabase_realtime ADD TABLE public.wing_stats_overrides;
ALTER TABLE public.wing_stats_overrides REPLICA IDENTITY FULL;

-- NOTIFICATIONS
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL, title TEXT NOT NULL, message TEXT,
  program_id UUID REFERENCES public.programs(id) ON DELETE CASCADE,
  link TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.notifications TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view notifications" ON public.notifications FOR SELECT USING (true);
CREATE POLICY "Admins manage notifications" ON public.notifications FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
CREATE INDEX notifications_created_idx ON public.notifications(created_at DESC);

REVOKE EXECUTE ON FUNCTION public.auto_complete_programs() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.sync_program_result_status() FROM PUBLIC, anon, authenticated;

-- STORAGE POLICIES
CREATE POLICY "Public read posters" ON storage.objects FOR SELECT USING (bucket_id = 'posters');
CREATE POLICY "Auth upload posters" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'posters');
CREATE POLICY "Auth update posters" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'posters');
CREATE POLICY "Auth delete posters" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'posters' AND public.has_role(auth.uid(),'admin'));

CREATE POLICY "Public read gallery" ON storage.objects FOR SELECT USING (bucket_id = 'gallery');
CREATE POLICY "Auth upload gallery" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'gallery');
CREATE POLICY "Auth update gallery" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'gallery');
CREATE POLICY "Admins delete gallery" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'gallery' AND public.has_role(auth.uid(),'admin'));

CREATE POLICY "Public read results" ON storage.objects FOR SELECT USING (bucket_id = 'results');
CREATE POLICY "Auth upload results" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'results');
CREATE POLICY "Auth update results" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'results');
CREATE POLICY "Admins delete results" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'results' AND public.has_role(auth.uid(),'admin'));

CREATE POLICY "Public read documents" ON storage.objects FOR SELECT USING (bucket_id = 'documents');
CREATE POLICY "Auth upload documents" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'documents');
CREATE POLICY "Auth update documents" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'documents');
CREATE POLICY "Admins delete documents" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'documents' AND public.has_role(auth.uid(),'admin'));

CREATE POLICY "Public read reports" ON storage.objects FOR SELECT USING (bucket_id = 'reports');
CREATE POLICY "Auth upload reports" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'reports' AND (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'auditor')));
CREATE POLICY "Auth update reports" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'reports' AND (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'auditor')));
CREATE POLICY "Auth delete reports" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'reports' AND (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'auditor')));

CREATE POLICY "Public read stationery" ON storage.objects FOR SELECT USING (bucket_id = 'stationery');
CREATE POLICY "Admin upload stationery" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'stationery' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admin update stationery" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'stationery' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admin delete stationery" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'stationery' AND public.has_role(auth.uid(),'admin'));

-- FEEDBACK
CREATE TABLE public.feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text,
  email text NOT NULL,
  subject text,
  category text,
  rating int CHECK (rating BETWEEN 1 AND 5),
  message text NOT NULL,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','in_progress','resolved','rejected')),
  reviewed boolean NOT NULL DEFAULT false,
  admin_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.feedback TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.feedback TO authenticated;
GRANT ALL ON public.feedback TO service_role;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit feedback" ON public.feedback FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins manage feedback" ON public.feedback FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER feedback_touch BEFORE UPDATE ON public.feedback FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
ALTER PUBLICATION supabase_realtime ADD TABLE public.feedback;

-- EMAIL VERIFICATIONS
CREATE TABLE public.email_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL, code text NOT NULL,
  verified_at timestamptz,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '15 minutes'),
  attempts int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX email_verifications_email_idx ON public.email_verifications(email);
GRANT ALL ON public.email_verifications TO service_role;
ALTER TABLE public.email_verifications ENABLE ROW LEVEL SECURITY;

-- QUICK LINKS
CREATE TABLE public.quick_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL, description text, url text NOT NULL,
  category text NOT NULL CHECK (category IN ('events','academic','institutional','partner','media','other')),
  icon_url text, display_order int NOT NULL DEFAULT 0,
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.quick_links TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.quick_links TO authenticated;
GRANT ALL ON public.quick_links TO service_role;
ALTER TABLE public.quick_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public reads enabled quick links" ON public.quick_links FOR SELECT USING (enabled = true);
CREATE POLICY "Admins manage quick_links" ON public.quick_links FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER quick_links_touch BEFORE UPDATE ON public.quick_links FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
ALTER PUBLICATION supabase_realtime ADD TABLE public.quick_links;

-- ACHIEVEMENTS
CREATE TABLE public.achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL, description text,
  category text NOT NULL,
  achievement_year int NOT NULL, achievement_date date,
  photo_url text, certificate_url text,
  level text CHECK (level IN ('institution','district','state','national','international','special')),
  related_program_id uuid REFERENCES public.programs(id) ON DELETE SET NULL,
  archived boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX achievements_year_idx ON public.achievements(achievement_year);
CREATE INDEX achievements_category_idx ON public.achievements(category);
GRANT SELECT ON public.achievements TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.achievements TO authenticated;
GRANT ALL ON public.achievements TO service_role;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public reads non-archived achievements" ON public.achievements FOR SELECT USING (archived = false);
CREATE POLICY "Admins manage achievements" ON public.achievements FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER achievements_touch BEFORE UPDATE ON public.achievements FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
ALTER PUBLICATION supabase_realtime ADD TABLE public.achievements;