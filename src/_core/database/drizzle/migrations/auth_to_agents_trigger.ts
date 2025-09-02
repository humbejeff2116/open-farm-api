// Trigger function to handle new user creation in auth.users
import { sql } from "drizzle-orm";

export const up = sql`
  -- Update trigger function to handle role assignment from metadata
  CREATE OR REPLACE FUNCTION public.handle_new_user()
  RETURNS trigger AS $$
  DECLARE
    assigned_role user_role;
  BEGIN
    -- If metadata has role, use it; else default to agent
    assigned_role := COALESCE(
      (NEW.raw_user_meta_data->>'role')::user_role,
      'agent'::user_role
    );

    INSERT INTO public.agents (id, full_name, email, role, team_name, location)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'full_name', 'Unnamed User'),
      NEW.email,
      assigned_role,
      COALESCE(NEW.raw_user_meta_data->>'team_name', 'Unassigned'),
      COALESCE(NEW.raw_user_meta_data->>'location', 'Unknown')
    )
    ON CONFLICT (id) DO NOTHING;

    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql SECURITY DEFINER;

  -- Replace old trigger
  DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
  CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
`;

export const down = sql`
  DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
  DROP FUNCTION IF EXISTS public.handle_new_user();
`;