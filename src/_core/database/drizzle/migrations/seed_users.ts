import { sql } from "drizzle-orm";

export const up = sql`
  -- Seed an Admin
  INSERT INTO public.agents (id, full_name, email, location, team_name, role)
  VALUES (
    gen_random_uuid(),
    'System Admin',
    'admin@openfarm.local',
    'HQ',
    'Admin Team',
    'admin'
  )
  ON CONFLICT (email) DO NOTHING;

  -- Seed a Supervisor
  INSERT INTO public.agents (id, full_name, email, location, team_name, role)
  VALUES (
    gen_random_uuid(),
    'Jane Supervisor',
    'supervisor@openfarm.local',
    'Region A',
    'Team Alpha',
    'supervisor'
  )
  ON CONFLICT (email) DO NOTHING;

  -- Seed an Agent
  INSERT INTO public.agents (id, full_name, email, location, team_name, role)
  VALUES (
    gen_random_uuid(),
    'John Agent',
    'agent@openfarm.local',
    'Region A',
    'Team Alpha',
    'agent'
  )
  ON CONFLICT (email) DO NOTHING;
`;

export const down = sql`
  DELETE FROM public.agents WHERE email IN (
    'admin@openfarm.local',
    'supervisor@openfarm.local',
    'agent@openfarm.local'
  );
`;
