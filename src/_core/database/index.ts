import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { createClient } from "@supabase/supabase-js";
import * as schema from "./drizzle/migrations/schema/index.js";

const pool = new Pool({
    connectionString: process.env.DATABASE_URL, // Supabase connection string
});



export function supabaseForUser(accessToken: string) {
    if (!accessToken) {
        throw new Error("Access token is required to create Supabase client for user.");
    }
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
        throw new Error("Supabase environment variables are not set.");
    }
    const client = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, {
        global: { headers: { Authorization: `Bearer ${accessToken}` } }
    });
    return client;
}

export const db = drizzle(pool, { schema });
