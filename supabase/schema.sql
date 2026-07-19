-- ============================================================
-- JobPortal — Full Database Migration
-- Run this in the Supabase SQL Editor
-- ============================================================

-- ──────────────────────────────────────────
-- 1. ENUMS
-- ──────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('seeker', 'employer', 'admin');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE proficiency_level AS ENUM ('beginner', 'intermediate', 'expert');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE job_type_enum AS ENUM ('full_time', 'part_time', 'contract', 'internship', 'remote');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE job_status_enum AS ENUM ('open', 'closed', 'draft');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE application_status_enum AS ENUM ('pending', 'reviewing', 'interviewing', 'offered', 'rejected');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE interview_type_enum AS ENUM ('technical', 'cultural', 'hr', 'final');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ──────────────────────────────────────────
-- 2. TABLE 1: users (extends auth.users)
-- ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.users (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  role        user_role NOT NULL DEFAULT 'seeker',
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  last_login  TIMESTAMPTZ
);

-- ──────────────────────────────────────────
-- 3. TABLE 2: companies
-- ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.companies (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  industry      TEXT,
  description   TEXT,
  website_url   TEXT,
  logo_url      TEXT,
  founded_year  INT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ──────────────────────────────────────────
-- 4. TABLE 3: employer_profiles
-- ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.employer_profiles (
  user_id          UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  company_id       UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  title_at_company TEXT,
  is_company_admin BOOLEAN DEFAULT FALSE,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ──────────────────────────────────────────
-- 5. TABLE 4: seeker_profiles
-- ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.seeker_profiles (
  user_id    UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL DEFAULT '',
  last_name  TEXT NOT NULL DEFAULT '',
  headline   TEXT,
  bio        TEXT,
  location   TEXT,
  resume_url TEXT,
  github_url TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ──────────────────────────────────────────
-- 6. TABLE 5: seeker_experience
-- ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.seeker_experience (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seeker_id       UUID NOT NULL REFERENCES public.seeker_profiles(user_id) ON DELETE CASCADE,
  company_name    TEXT NOT NULL,
  job_title       TEXT NOT NULL,
  start_date      DATE NOT NULL,
  end_date        DATE,
  is_current_role BOOLEAN DEFAULT FALSE,
  description     TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ──────────────────────────────────────────
-- 7. TABLE 6: seeker_education
-- ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.seeker_education (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seeker_id        UUID NOT NULL REFERENCES public.seeker_profiles(user_id) ON DELETE CASCADE,
  institution_name TEXT NOT NULL,
  degree           TEXT NOT NULL,
  field_of_study   TEXT,
  start_date       DATE NOT NULL,
  end_date         DATE,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ──────────────────────────────────────────
-- 8. TABLE 7: skills (master dictionary)
-- ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.skills (
  id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name     TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL
);

-- ──────────────────────────────────────────
-- 9. TABLE 10: jobs (defined before junction tables)
-- ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.jobs (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id        UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  posted_by_user_id UUID NOT NULL REFERENCES public.users(id),
  title             TEXT NOT NULL,
  description       TEXT NOT NULL,
  location          TEXT,
  salary_min        INT,
  salary_max        INT,
  job_type          job_type_enum DEFAULT 'full_time',
  status            job_status_enum DEFAULT 'draft',
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ──────────────────────────────────────────
-- 10. TABLE 8: seeker_skills (junction)
-- ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.seeker_skills (
  seeker_id           UUID REFERENCES public.seeker_profiles(user_id) ON DELETE CASCADE,
  skill_id            UUID REFERENCES public.skills(id) ON DELETE CASCADE,
  years_of_experience NUMERIC(3,1),
  proficiency         proficiency_level DEFAULT 'intermediate',
  PRIMARY KEY (seeker_id, skill_id)
);

-- ──────────────────────────────────────────
-- 11. TABLE 9: job_skills (junction)
-- ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.job_skills (
  job_id      UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
  skill_id    UUID REFERENCES public.skills(id) ON DELETE CASCADE,
  is_required BOOLEAN DEFAULT TRUE,
  PRIMARY KEY (job_id, skill_id)
);

-- ──────────────────────────────────────────
-- 12. TABLE 11: applications
-- ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.applications (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id       UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  seeker_id    UUID NOT NULL REFERENCES public.seeker_profiles(user_id) ON DELETE CASCADE,
  cover_letter TEXT,
  status       application_status_enum DEFAULT 'pending',
  applied_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (job_id, seeker_id)
);

-- ──────────────────────────────────────────
-- 13. TABLE 12: interviews
-- ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.interviews (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id  UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  interviewer_id  UUID REFERENCES public.employer_profiles(user_id) ON DELETE SET NULL,
  scheduled_at    TIMESTAMPTZ NOT NULL,
  interview_type  interview_type_enum DEFAULT 'technical',
  notes           TEXT,
  feedback_score  SMALLINT CHECK (feedback_score BETWEEN 1 AND 5),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ──────────────────────────────────────────
-- 14. INDEXES
-- ──────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_jobs_company        ON public.jobs(company_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status         ON public.jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at     ON public.jobs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_applications_job    ON public.applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_seeker ON public.applications(seeker_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON public.applications(status);
CREATE INDEX IF NOT EXISTS idx_seeker_exp_seeker   ON public.seeker_experience(seeker_id);
CREATE INDEX IF NOT EXISTS idx_seeker_edu_seeker   ON public.seeker_education(seeker_id);
CREATE INDEX IF NOT EXISTS idx_interviews_app      ON public.interviews(application_id);
CREATE INDEX IF NOT EXISTS idx_job_skills_job      ON public.job_skills(job_id);
CREATE INDEX IF NOT EXISTS idx_seeker_skills       ON public.seeker_skills(seeker_id);
CREATE INDEX IF NOT EXISTS idx_skills_name         ON public.skills(name);

-- ──────────────────────────────────────────
-- 15. AUTO-UPDATE updated_at TRIGGER
-- ──────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER seeker_profiles_updated_at
  BEFORE UPDATE ON public.seeker_profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE OR REPLACE TRIGGER jobs_updated_at
  BEFORE UPDATE ON public.jobs
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ──────────────────────────────────────────
-- 16. AUTO-INSERT users ON AUTH SIGN-UP
-- ──────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'role'), 'seeker')::public.user_role
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-create seeker_profile when role is seeker
CREATE OR REPLACE FUNCTION public.handle_new_seeker()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role = 'seeker' THEN
    INSERT INTO public.seeker_profiles (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  IF NEW.role = 'employer' THEN
    INSERT INTO public.employer_profiles (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_user_role_set
  AFTER INSERT ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_seeker();

-- ──────────────────────────────────────────
-- 17. ROW LEVEL SECURITY — Enable on all tables
-- ──────────────────────────────────────────
ALTER TABLE public.users              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employer_profiles  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seeker_profiles    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seeker_experience  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seeker_education   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seeker_skills      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_skills         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interviews         ENABLE ROW LEVEL SECURITY;

-- ──────────────────────────────────────────
-- 18. RLS POLICIES
-- ──────────────────────────────────────────

-- users
CREATE POLICY "users_read_own" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- companies: anyone can read, only company admins can write
CREATE POLICY "companies_read_all" ON public.companies
  FOR SELECT USING (TRUE);

CREATE POLICY "companies_insert_employer" ON public.companies
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'employer')
  );

CREATE POLICY "companies_update_admin" ON public.companies
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.employer_profiles ep
      WHERE ep.user_id = auth.uid()
        AND ep.company_id = companies.id
        AND ep.is_company_admin = TRUE
    )
  );

-- employer_profiles
CREATE POLICY "employer_profiles_read_own" ON public.employer_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "employer_profiles_insert_own" ON public.employer_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "employer_profiles_update_own" ON public.employer_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- seeker_profiles
CREATE POLICY "seeker_profiles_read_all" ON public.seeker_profiles
  FOR SELECT USING (TRUE);

CREATE POLICY "seeker_profiles_insert_own" ON public.seeker_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "seeker_profiles_update_own" ON public.seeker_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- seeker_experience
CREATE POLICY "seeker_exp_read_all" ON public.seeker_experience
  FOR SELECT USING (TRUE);

CREATE POLICY "seeker_exp_insert_own" ON public.seeker_experience
  FOR INSERT WITH CHECK (auth.uid() = seeker_id);

CREATE POLICY "seeker_exp_update_own" ON public.seeker_experience
  FOR UPDATE USING (auth.uid() = seeker_id);

CREATE POLICY "seeker_exp_delete_own" ON public.seeker_experience
  FOR DELETE USING (auth.uid() = seeker_id);

-- seeker_education
CREATE POLICY "seeker_edu_read_all" ON public.seeker_education
  FOR SELECT USING (TRUE);

CREATE POLICY "seeker_edu_insert_own" ON public.seeker_education
  FOR INSERT WITH CHECK (auth.uid() = seeker_id);

CREATE POLICY "seeker_edu_update_own" ON public.seeker_education
  FOR UPDATE USING (auth.uid() = seeker_id);

CREATE POLICY "seeker_edu_delete_own" ON public.seeker_education
  FOR DELETE USING (auth.uid() = seeker_id);

-- skills: anyone can read, only admins can insert
CREATE POLICY "skills_read_all" ON public.skills
  FOR SELECT USING (TRUE);

CREATE POLICY "skills_insert_authenticated" ON public.skills
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- seeker_skills
CREATE POLICY "seeker_skills_read_all" ON public.seeker_skills
  FOR SELECT USING (TRUE);

CREATE POLICY "seeker_skills_manage_own" ON public.seeker_skills
  FOR ALL USING (auth.uid() = seeker_id);

-- job_skills: anyone can read, employers manage their own
CREATE POLICY "job_skills_read_all" ON public.job_skills
  FOR SELECT USING (TRUE);

CREATE POLICY "job_skills_manage_employer" ON public.job_skills
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.jobs j
      JOIN public.employer_profiles ep ON ep.company_id = j.company_id
      WHERE j.id = job_skills.job_id AND ep.user_id = auth.uid()
    )
  );

-- jobs: open jobs visible to all, employers manage own
CREATE POLICY "jobs_read_open" ON public.jobs
  FOR SELECT USING (status = 'open' OR posted_by_user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.employer_profiles ep
      WHERE ep.user_id = auth.uid() AND ep.company_id = jobs.company_id
    )
  );

CREATE POLICY "jobs_insert_employer" ON public.jobs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.employer_profiles ep
      WHERE ep.user_id = auth.uid() AND ep.company_id = jobs.company_id
    )
  );

CREATE POLICY "jobs_update_employer" ON public.jobs
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.employer_profiles ep
      WHERE ep.user_id = auth.uid() AND ep.company_id = jobs.company_id
    )
  );

CREATE POLICY "jobs_delete_admin" ON public.jobs
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.employer_profiles ep
      WHERE ep.user_id = auth.uid() AND ep.company_id = jobs.company_id
        AND ep.is_company_admin = TRUE
    )
  );

-- applications: seekers see own, employers see for their company
CREATE POLICY "applications_seeker_own" ON public.applications
  FOR SELECT USING (auth.uid() = seeker_id);

CREATE POLICY "applications_employer_view" ON public.applications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.jobs j
      JOIN public.employer_profiles ep ON ep.company_id = j.company_id
      WHERE j.id = applications.job_id AND ep.user_id = auth.uid()
    )
  );

CREATE POLICY "applications_seeker_insert" ON public.applications
  FOR INSERT WITH CHECK (auth.uid() = seeker_id);

CREATE POLICY "applications_employer_update_status" ON public.applications
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.jobs j
      JOIN public.employer_profiles ep ON ep.company_id = j.company_id
      WHERE j.id = applications.job_id AND ep.user_id = auth.uid()
    )
  );

-- interviews
CREATE POLICY "interviews_seeker_view" ON public.interviews
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.applications a
      WHERE a.id = interviews.application_id AND a.seeker_id = auth.uid()
    )
  );

CREATE POLICY "interviews_employer_manage" ON public.interviews
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.applications a
      JOIN public.jobs j ON j.id = a.job_id
      JOIN public.employer_profiles ep ON ep.company_id = j.company_id
      WHERE a.id = interviews.application_id AND ep.user_id = auth.uid()
    )
  );

-- ──────────────────────────────────────────
-- 19. STORAGE BUCKETS
-- ──────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public) VALUES
  ('resumes', 'resumes', FALSE),
  ('logos',   'logos',   TRUE),
  ('avatars', 'avatars', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS
CREATE POLICY "resumes_owner_only" ON storage.objects
  FOR ALL USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "logos_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'logos');

CREATE POLICY "logos_employer_upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'logos' AND auth.uid() IS NOT NULL);

CREATE POLICY "avatars_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "avatars_owner_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "avatars_owner_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1])
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "avatars_owner_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ──────────────────────────────────────────
-- 20. SEED: Skills Data
-- ──────────────────────────────────────────
INSERT INTO public.skills (name, category) VALUES
  -- Engineering
  ('JavaScript', 'Engineering'), ('TypeScript', 'Engineering'),
  ('React', 'Engineering'), ('Next.js', 'Engineering'),
  ('Node.js', 'Engineering'), ('Python', 'Engineering'),
  ('PostgreSQL', 'Engineering'), ('GraphQL', 'Engineering'),
  ('Docker', 'Engineering'), ('Kubernetes', 'Engineering'),
  ('AWS', 'Engineering'), ('Go', 'Engineering'),
  ('Rust', 'Engineering'), ('Java', 'Engineering'),
  ('Spring Boot', 'Engineering'), ('C++', 'Engineering'),
  ('Redis', 'Engineering'), ('MongoDB', 'Engineering'),
  ('Git', 'Engineering'), ('CI/CD', 'Engineering'),
  -- Design
  ('Figma', 'Design'), ('UI/UX Design', 'Design'),
  ('Adobe XD', 'Design'), ('Sketch', 'Design'),
  ('Illustrator', 'Design'), ('Photoshop', 'Design'),
  -- Data & AI
  ('Machine Learning', 'Data & AI'), ('Data Analysis', 'Data & AI'),
  ('TensorFlow', 'Data & AI'), ('PyTorch', 'Data & AI'),
  ('SQL', 'Data & AI'), ('Tableau', 'Data & AI'),
  ('Power BI', 'Data & AI'), ('R', 'Data & AI'),
  -- Marketing
  ('SEO', 'Marketing'), ('Content Marketing', 'Marketing'),
  ('Google Ads', 'Marketing'), ('Social Media', 'Marketing'),
  ('Email Marketing', 'Marketing'),
  -- Business
  ('Project Management', 'Business'), ('Agile/Scrum', 'Business'),
  ('Sales', 'Business'), ('Customer Success', 'Business'),
  ('Business Analysis', 'Business'), ('Product Management', 'Business'),
  ('Leadership', 'Business'), ('Communication', 'Business')
ON CONFLICT (name) DO NOTHING;
