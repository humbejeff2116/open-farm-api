import { sql } from "drizzle-orm";

export const up = sql`
  -- 1. Enum and role column
  DO $$ BEGIN
    CREATE TYPE public.user_role AS ENUM ('agent', 'supervisor', 'admin');
  EXCEPTION WHEN duplicate_object THEN NULL; END $$;

  ALTER TABLE public.agents
    ADD COLUMN IF NOT EXISTS role public.user_role NOT NULL DEFAULT 'agent';

  -- 2. Helper functions
  CREATE OR REPLACE FUNCTION public.current_role() RETURNS public.user_role
  LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
    SELECT a.role FROM public.agents a WHERE a.id = auth.uid();
  $$;

  CREATE OR REPLACE FUNCTION public.current_team() RETURNS text
  LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
    SELECT a.team_name FROM public.agents a WHERE a.id = auth.uid();
  $$;

  -- 3. Enable RLS
  ALTER TABLE public.agents       ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.farmers      ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.visits       ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.diagnostics  ENABLE ROW LEVEL SECURITY;

  -- 4. Agents policies
  CREATE POLICY agents_select_self ON public.agents
  FOR SELECT USING (id = auth.uid());

  CREATE POLICY agents_update_self ON public.agents
  FOR UPDATE USING (id = auth.uid());

  CREATE POLICY agents_admin_all ON public.agents
  FOR ALL USING (public.current_role() = 'admin') WITH CHECK (public.current_role() = 'admin');

  -- 5. Farmers policies
  CREATE POLICY farmers_insert_self ON public.farmers
  FOR INSERT WITH CHECK (agent_id = auth.uid());

  CREATE POLICY farmers_select_own ON public.farmers
  FOR SELECT USING (agent_id = auth.uid());

  CREATE POLICY farmers_select_team ON public.farmers
  FOR SELECT USING (
    public.current_role() = 'supervisor'
    AND EXISTS (
      SELECT 1 FROM public.agents ag_farmer
      WHERE ag_farmer.id = public.farmers.agent_id
        AND ag_farmer.team_name = public.current_team()
    )
  );

  CREATE POLICY farmers_select_admin ON public.farmers
  FOR SELECT USING (public.current_role() = 'admin');

  CREATE POLICY farmers_update_own ON public.farmers
  FOR UPDATE USING (agent_id = auth.uid()) WITH CHECK (agent_id = auth.uid());

  CREATE POLICY farmers_admin_update ON public.farmers
  FOR UPDATE USING (public.current_role() = 'admin') WITH CHECK (public.current_role() = 'admin');

  CREATE POLICY farmers_admin_delete ON public.farmers
  FOR DELETE USING (public.current_role() = 'admin');

  -- 6. Visits policies
  CREATE POLICY visits_insert_self ON public.visits
  FOR INSERT WITH CHECK (
    agent_id = auth.uid()
    AND EXISTS (SELECT 1 FROM public.farmers f WHERE f.id = visits.farmer_id AND f.agent_id = auth.uid())
  );

  CREATE POLICY visits_select_own ON public.visits
  FOR SELECT USING (
    agent_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.farmers f WHERE f.id = visits.farmer_id AND f.agent_id = auth.uid())
  );

  CREATE POLICY visits_select_team ON public.visits
  FOR SELECT USING (
    public.current_role() = 'supervisor' AND EXISTS (
      SELECT 1 FROM public.farmers f
      JOIN public.agents ag_farmer ON ag_farmer.id = f.agent_id
      WHERE f.id = visits.farmer_id
        AND ag_farmer.team_name = public.current_team()
    )
  );

  CREATE POLICY visits_admin_all ON public.visits
  FOR ALL USING (public.current_role() = 'admin') WITH CHECK (public.current_role() = 'admin');

  -- 7. Diagnostics policies
  CREATE POLICY diagnostics_insert_self ON public.diagnostics
  FOR INSERT WITH CHECK (
    agent_id = auth.uid()
    AND EXISTS (SELECT 1 FROM public.farmers f WHERE f.id = diagnostics.farmer_id AND f.agent_id = auth.uid())
  );

  CREATE POLICY diagnostics_select_own ON public.diagnostics
  FOR SELECT USING (
    agent_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.farmers f WHERE f.id = diagnostics.farmer_id AND f.agent_id = auth.uid())
  );

  CREATE POLICY diagnostics_select_team ON public.diagnostics
  FOR SELECT USING (
    public.current_role() = 'supervisor' AND EXISTS (
      SELECT 1
      FROM public.farmers f
      JOIN public.agents ag_farmer ON ag_farmer.id = f.agent_id
      WHERE f.id = diagnostics.farmer_id
        AND ag_farmer.team_name = public.current_team()
    )
  );

  CREATE POLICY diagnostics_admin_all ON public.diagnostics
  FOR ALL USING (public.current_role() = 'admin') WITH CHECK (public.current_role() = 'admin');
`;

export const down = sql`
  -- Rollback: remove policies, disable RLS
  DROP POLICY IF EXISTS agents_select_self ON public.agents;
  DROP POLICY IF EXISTS agents_update_self ON public.agents;
  DROP POLICY IF EXISTS agents_admin_all ON public.agents;

  DROP POLICY IF EXISTS farmers_insert_self ON public.farmers;
  DROP POLICY IF EXISTS farmers_select_own ON public.farmers;
  DROP POLICY IF EXISTS farmers_select_team ON public.farmers;
  DROP POLICY IF EXISTS farmers_select_admin ON public.farmers;
  DROP POLICY IF EXISTS farmers_update_own ON public.farmers;
  DROP POLICY IF EXISTS farmers_admin_update ON public.farmers;
  DROP POLICY IF EXISTS farmers_admin_delete ON public.farmers;

  DROP POLICY IF EXISTS visits_insert_self ON public.visits;
  DROP POLICY IF EXISTS visits_select_own ON public.visits;
  DROP POLICY IF EXISTS visits_select_team ON public.visits;
  DROP POLICY IF EXISTS visits_admin_all ON public.visits;

  DROP POLICY IF EXISTS diagnostics_insert_self ON public.diagnostics;
  DROP POLICY IF EXISTS diagnostics_select_own ON public.diagnostics;
  DROP POLICY IF EXISTS diagnostics_select_team ON public.diagnostics;
  DROP POLICY IF EXISTS diagnostics_admin_all ON public.diagnostics;

  ALTER TABLE public.agents DISABLE ROW LEVEL SECURITY;
  ALTER TABLE public.farmers DISABLE ROW LEVEL SECURITY;
  ALTER TABLE public.visits DISABLE ROW LEVEL SECURITY;
  ALTER TABLE public.diagnostics DISABLE ROW LEVEL SECURITY;

  DROP FUNCTION IF EXISTS public.current_role();
  DROP FUNCTION IF EXISTS public.current_team();
  DROP TYPE IF EXISTS public.user_role;
`;
