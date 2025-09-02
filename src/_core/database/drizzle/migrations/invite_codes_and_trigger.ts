import { sql } from "drizzle-orm";


// This migration creates an invite_codes table, updates the handle_new_user trigger function to consume invite codes,
// and sets up a trigger on auth.users to call this function when a new user is created or updated.
// It also includes a rollback to drop the trigger and invite_codes table if needed.  
// This migration is designed to be run in a PostgreSQL database using Drizzle ORM.
// The invite_codes table will store invite codes, their roles, team names, and usage limits.
// The handle_new_user function will check for an invite code in the new user's metadata, validate it, and assign the appropriate role and team name.
// If the invite code is valid, it will increment the usage count and create or update the agents table with the new user's information.
// The trigger on auth.users will ensure that the handle_new_user function is called whenever a new user is created or updated in the auth.users table.
// The migration also includes a rollback function to drop the trigger and invite_codes table if needed.    

export const up = sql`
-- 1) Create invite_codes table
CREATE TABLE IF NOT EXISTS public.invite_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  role text NOT NULL,
  team_name text,
  created_by uuid,
  max_uses integer DEFAULT 1,
  uses integer DEFAULT 0,
  revoked boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 2) Update the handle_new_user trigger function to consume invite codes
-- First, drop previous version if present (we re-create a new improved function)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  assigned_role public.user_role := 'agent';
  assigned_team text := NULL;
  invite text;
BEGIN
  -- Check if raw_user_meta_data contains an invite_code
  IF NEW.raw_user_meta_data IS NOT NULL AND (NEW.raw_user_meta_data->>'invite_code') IS NOT NULL THEN
    invite := NEW.raw_user_meta_data->>'invite_code';
    -- Look up invite code row, ensure exists, not revoked, and uses < max_uses
    PERFORM 1 FROM public.invite_codes ic
      WHERE ic.code = invite AND ic.revoked = false AND ic.uses < ic.max_uses;

    IF FOUND THEN
      SELECT role, team_name INTO assigned_role, assigned_team FROM public.invite_codes WHERE code = invite LIMIT 1;

      -- increment uses (atomic)
      UPDATE public.invite_codes
      SET uses = uses + 1
      WHERE code = invite;
    END IF;
  END IF;

  -- fallback to metadata role if present and valid
  IF NEW.raw_user_meta_data IS NOT NULL AND (NEW.raw_user_meta_data->>'role') IS NOT NULL THEN
    BEGIN
      assigned_role := (NEW.raw_user_meta_data->>'role')::public.user_role;
    EXCEPTION WHEN others THEN
      -- invalid role string — keep current assigned_role
      assigned_role := assigned_role;
    END;
  END IF;

  -- create agents row (if not exists)
  INSERT INTO public.agents (id, full_name, email, role, team_name, location, created_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Unnamed User'),
    NEW.email,
    assigned_role,
    COALESCE(assigned_team, NEW.raw_user_meta_data->>'team_name'),
    COALESCE(NEW.raw_user_meta_data->>'location', 'Unknown'),
    now()
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3) (re)create trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
`;

export const down = sql`
-- Rollback: drop trigger and invite_codes table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP TABLE IF EXISTS public.invite_codes;
`;
