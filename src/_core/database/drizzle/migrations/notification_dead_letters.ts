import { sql } from "drizzle-orm";
// import { MigrationBuilder } from "drizzle-orm/migrat";

export const up = sql`
    CREATE TABLE IF NOT EXISTS public.notification_dead_letters (
        id bigserial PRIMARY KEY,
        channel text NOT NULL,
        payload jsonb NOT NULL,
        reason text NOT NULL,
        created_at timestamptz NOT NULL DEFAULT now()
    );
`

export const down = sql`
    DROP TABLE IF EXISTS public.notification_dead_letters;
`