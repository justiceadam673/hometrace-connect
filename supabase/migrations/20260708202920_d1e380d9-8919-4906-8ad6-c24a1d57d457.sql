
-- Extend user_role enum with 'developer' if missing
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'developer' AND enumtypid = 'public.user_role'::regtype) THEN
    ALTER TYPE public.user_role ADD VALUE 'developer';
  END IF;
END $$;

-- Enums
DO $$ BEGIN
  CREATE TYPE public.project_status AS ENUM ('planning', 'pre_launch', 'selling', 'sold_out', 'completed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.unit_status AS ENUM ('available', 'reserved', 'sold');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.team_role AS ENUM ('admin', 'manager', 'agent', 'viewer');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 1) developers
CREATE TABLE IF NOT EXISTS public.developers (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name text NOT NULL,
  slug text UNIQUE,
  logo_url text,
  cover_url text,
  description text,
  website text,
  email text,
  phone text,
  headquarters text,
  established_year integer,
  verification public.verification_status NOT NULL DEFAULT 'unverified',
  featured boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.developers TO authenticated;
GRANT SELECT ON public.developers TO anon;
GRANT ALL ON public.developers TO service_role;
ALTER TABLE public.developers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Developers viewable by everyone" ON public.developers FOR SELECT USING (true);
CREATE POLICY "Users insert own developer" ON public.developers FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users update own developer" ON public.developers FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users delete own developer" ON public.developers FOR DELETE USING (auth.uid() = id);
CREATE TRIGGER developers_set_updated_at BEFORE UPDATE ON public.developers
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- 2) developer_team (define before helper functions reference it)
CREATE TABLE IF NOT EXISTS public.developer_team (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  developer_id uuid NOT NULL REFERENCES public.developers(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  invite_email text,
  full_name text,
  role public.team_role NOT NULL DEFAULT 'viewer',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (developer_id, user_id),
  UNIQUE (developer_id, invite_email)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.developer_team TO authenticated;
GRANT ALL ON public.developer_team TO service_role;
ALTER TABLE public.developer_team ENABLE ROW LEVEL SECURITY;

-- Helper: is caller a manager or admin of this developer?
CREATE OR REPLACE FUNCTION public.is_developer_manager(_developer_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    _developer_id = _user_id
    OR EXISTS (
      SELECT 1 FROM public.developer_team
      WHERE developer_id = _developer_id
        AND user_id = _user_id
        AND role IN ('admin', 'manager')
    );
$$;

-- Helper: is caller a member (any role) of this developer?
CREATE OR REPLACE FUNCTION public.is_developer_member(_developer_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    _developer_id = _user_id
    OR EXISTS (
      SELECT 1 FROM public.developer_team
      WHERE developer_id = _developer_id AND user_id = _user_id
    );
$$;

CREATE POLICY "Team visible to members" ON public.developer_team FOR SELECT
  USING (public.is_developer_member(developer_id, auth.uid()));
CREATE POLICY "Owner manages team" ON public.developer_team FOR INSERT
  WITH CHECK (developer_id = auth.uid() OR public.is_developer_manager(developer_id, auth.uid()));
CREATE POLICY "Owner updates team" ON public.developer_team FOR UPDATE
  USING (developer_id = auth.uid() OR public.is_developer_manager(developer_id, auth.uid()));
CREATE POLICY "Owner deletes team" ON public.developer_team FOR DELETE
  USING (developer_id = auth.uid() OR public.is_developer_manager(developer_id, auth.uid()));

-- 3) projects (estates / developments)
CREATE TABLE IF NOT EXISTS public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  developer_id uuid NOT NULL REFERENCES public.developers(id) ON DELETE CASCADE,
  name text NOT NULL,
  slug text,
  description text,
  state text NOT NULL,
  city text,
  area text,
  address text,
  cover_image text,
  gallery text[] DEFAULT ARRAY[]::text[],
  layout_image text,
  brochure_url text,
  total_units integer DEFAULT 0,
  starting_price bigint,
  status public.project_status NOT NULL DEFAULT 'planning',
  launch_date date,
  completion_date date,
  amenities text[] DEFAULT ARRAY[]::text[],
  featured boolean NOT NULL DEFAULT false,
  views integer NOT NULL DEFAULT 0,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.projects TO authenticated;
GRANT SELECT ON public.projects TO anon;
GRANT ALL ON public.projects TO service_role;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published projects viewable by everyone" ON public.projects FOR SELECT
  USING (published = true OR public.is_developer_member(developer_id, auth.uid()));
CREATE POLICY "Team manages projects insert" ON public.projects FOR INSERT
  WITH CHECK (developer_id = auth.uid() OR public.is_developer_manager(developer_id, auth.uid()));
CREATE POLICY "Team manages projects update" ON public.projects FOR UPDATE
  USING (developer_id = auth.uid() OR public.is_developer_manager(developer_id, auth.uid()));
CREATE POLICY "Team manages projects delete" ON public.projects FOR DELETE
  USING (developer_id = auth.uid() OR public.is_developer_manager(developer_id, auth.uid()));
CREATE TRIGGER projects_set_updated_at BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
CREATE INDEX IF NOT EXISTS projects_developer_idx ON public.projects(developer_id);
CREATE INDEX IF NOT EXISTS projects_state_idx ON public.projects(state);

-- 4) units
CREATE TABLE IF NOT EXISTS public.units (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  developer_id uuid NOT NULL REFERENCES public.developers(id) ON DELETE CASCADE,
  unit_number text NOT NULL,
  unit_type text,
  bedrooms integer DEFAULT 0,
  bathrooms integer DEFAULT 0,
  sqm integer,
  price bigint NOT NULL,
  status public.unit_status NOT NULL DEFAULT 'available',
  floor_plan_url text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (project_id, unit_number)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.units TO authenticated;
GRANT SELECT ON public.units TO anon;
GRANT ALL ON public.units TO service_role;
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Units viewable when project published" ON public.units FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.projects p WHERE p.id = units.project_id AND p.published = true)
    OR public.is_developer_member(developer_id, auth.uid())
  );
CREATE POLICY "Team manages units insert" ON public.units FOR INSERT
  WITH CHECK (developer_id = auth.uid() OR public.is_developer_manager(developer_id, auth.uid()));
CREATE POLICY "Team manages units update" ON public.units FOR UPDATE
  USING (developer_id = auth.uid() OR public.is_developer_manager(developer_id, auth.uid()));
CREATE POLICY "Team manages units delete" ON public.units FOR DELETE
  USING (developer_id = auth.uid() OR public.is_developer_manager(developer_id, auth.uid()));
CREATE TRIGGER units_set_updated_at BEFORE UPDATE ON public.units
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
CREATE INDEX IF NOT EXISTS units_project_idx ON public.units(project_id);
CREATE INDEX IF NOT EXISTS units_developer_idx ON public.units(developer_id);

-- 5) unit_sales
CREATE TABLE IF NOT EXISTS public.unit_sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id uuid NOT NULL REFERENCES public.units(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  developer_id uuid NOT NULL REFERENCES public.developers(id) ON DELETE CASCADE,
  buyer_name text NOT NULL,
  buyer_email text,
  buyer_phone text,
  sale_price bigint NOT NULL,
  deposit bigint DEFAULT 0,
  sale_date date NOT NULL DEFAULT CURRENT_DATE,
  notes text,
  recorded_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.unit_sales TO authenticated;
GRANT ALL ON public.unit_sales TO service_role;
ALTER TABLE public.unit_sales ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Sales visible to team" ON public.unit_sales FOR SELECT
  USING (public.is_developer_member(developer_id, auth.uid()));
CREATE POLICY "Team records sales" ON public.unit_sales FOR INSERT
  WITH CHECK (developer_id = auth.uid() OR public.is_developer_manager(developer_id, auth.uid()));
CREATE POLICY "Team updates sales" ON public.unit_sales FOR UPDATE
  USING (developer_id = auth.uid() OR public.is_developer_manager(developer_id, auth.uid()));
CREATE POLICY "Team deletes sales" ON public.unit_sales FOR DELETE
  USING (developer_id = auth.uid() OR public.is_developer_manager(developer_id, auth.uid()));
CREATE INDEX IF NOT EXISTS unit_sales_developer_idx ON public.unit_sales(developer_id);
CREATE INDEX IF NOT EXISTS unit_sales_project_idx ON public.unit_sales(project_id);

-- Storage policies for shared property-images bucket (already exists) -- developers reuse it.
-- No new bucket needed; upload paths go under `${userId}/...` per existing policies.
