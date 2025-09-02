import { sql } from "drizzle-orm";
import { pgTable, serial } from "drizzle-orm/pg-core";
import { drizzle } from "drizzle-orm/node-postgres";
// import { MigrationBuilder } from "drizzle-orm/migrator";

export const up = async (db: any) => {
    await db.execute(sql`
        -- Function to send NOTIFY when invite codes are used up
        CREATE OR REPLACE FUNCTION public.notify_invite_code_exhausted()
        RETURNS TRIGGER AS $$
        DECLARE
            payload JSON;
        BEGIN
        -- Fire only when uses reaches max_uses or when active is set to false
            IF NEW.active = FALSE OR (NEW.max_uses IS NOT NULL AND NEW.uses >= NEW.max_uses) THEN
                payload = json_build_object(
                    'id', NEW.id,
                    'code', NEW.code,
                    'role', NEW.role,
                    'teamName', NEW.team_name,
                    'maxUses', NEW.max_uses,
                    'uses', NEW.uses,
                    'active', NEW.active,
                    'expiresAt', NEW.expires_at
                );
                PERFORM pg_notify('invite_code_exhausted', payload::text);
            END IF;
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

        -- Trigger to call the function on updates to invite_codes table
        DROP TRIGGER IF EXISTS on_invite_code_exhausted ON public.invite_codes;

        CREATE TRIGGER on_invite_code_exhausted
        AFTER UPDATE ON public.invite_codes
        FOR EACH ROW
        EXECUTE FUNCTION public.notify_invite_code_exhausted();
    `);

}

export const down = async (db: any) => {
    await db.execute(sql`
        DROP TRIGGER IF EXISTS on_invite_code_exhausted ON public.invite_codes;
        DROP FUNCTION IF EXISTS public.notify_invite_code_exhausted();
    `);
}
