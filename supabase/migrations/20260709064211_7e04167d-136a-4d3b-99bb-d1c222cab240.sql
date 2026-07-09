
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS whatsapp_number text,
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS bio text,
  ADD COLUMN IF NOT EXISTS company text,
  ADD COLUMN IF NOT EXISTS location text;

-- Allow authenticated users to view any profile so buyers can see agent contact info
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON public.profiles;
CREATE POLICY "Profiles are viewable by authenticated users"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

-- Also allow anon to view basic profile (for agent contact on public listing pages)
DROP POLICY IF EXISTS "Profiles are viewable by anon" ON public.profiles;
CREATE POLICY "Profiles are viewable by anon"
  ON public.profiles FOR SELECT
  TO anon
  USING (true);

GRANT SELECT ON public.profiles TO anon;
