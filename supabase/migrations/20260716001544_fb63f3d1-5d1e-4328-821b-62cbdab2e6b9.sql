
ALTER TABLE public.agents
  ADD COLUMN IF NOT EXISTS nin_number text,
  ADD COLUMN IF NOT EXISTS nin_document_url text,
  ADD COLUMN IF NOT EXISTS cofo_document_url text,
  ADD COLUMN IF NOT EXISTS id_selfie_url text,
  ADD COLUMN IF NOT EXISTS business_name text,
  ADD COLUMN IF NOT EXISTS kyc_address text,
  ADD COLUMN IF NOT EXISTS kyc_submitted_at timestamptz;

-- Ensure agent can create/update own row
DROP POLICY IF EXISTS "Agents insert own" ON public.agents;
DROP POLICY IF EXISTS "Agents update own" ON public.agents;
DROP POLICY IF EXISTS "Agents select own" ON public.agents;
DROP POLICY IF EXISTS "Agents public read" ON public.agents;

CREATE POLICY "Agents insert own" ON public.agents FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Agents update own" ON public.agents FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Agents public read" ON public.agents FOR SELECT USING (true);

GRANT SELECT, INSERT, UPDATE ON public.agents TO authenticated;
GRANT SELECT ON public.agents TO anon;
