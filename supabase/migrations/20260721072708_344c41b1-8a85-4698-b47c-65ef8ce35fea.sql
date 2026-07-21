
-- Require verified developer before creating projects
DROP POLICY IF EXISTS "Team manages projects insert" ON public.projects;
CREATE POLICY "Team manages projects insert" ON public.projects
FOR INSERT TO authenticated
WITH CHECK (
  ((developer_id = auth.uid()) OR is_developer_manager(developer_id, auth.uid()))
  AND EXISTS (SELECT 1 FROM public.developers d WHERE d.id = projects.developer_id AND d.verification = 'verified')
);

-- Require verified agent before creating property listings
DROP POLICY IF EXISTS "Agents can create their own listings" ON public.properties;
CREATE POLICY "Agents can create their own listings" ON public.properties
FOR INSERT TO authenticated
WITH CHECK (
  (auth.uid() = agent_id)
  AND EXISTS (SELECT 1 FROM public.agents a WHERE a.id = auth.uid() AND a.verification = 'verified')
);
