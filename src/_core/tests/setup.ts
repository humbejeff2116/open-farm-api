import { beforeEach, afterAll, beforeAll } from "vitest";
import { clearAll } from "./seed.js";
import { PostgreSqlContainer } from '@testcontainers/postgresql';
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { drizzle } from "drizzle-orm/node-postgres";
import { Client } from "pg";
import { db } from "../database/index.js";
import { sql } from "drizzle-orm";

const migrationsFolder = '../database/drizzle/migrations/schema/agents.js';
let container: any;
let client: Client;

export async function resetDb() {
    await db.execute(sql`TRUNCATE TABLE reports RESTART IDENTITY CASCADE`);
    await db.execute(sql`TRUNCATE TABLE report_filter_presets RESTART IDENTITY CASCADE`);
    await db.execute(sql`TRUNCATE TABLE users RESTART IDENTITY CASCADE`);
}


beforeAll(async () => {
    container = await new PostgreSqlContainer("postgres:15-alpine")
    .withDatabase("testdb")
    .withUsername("test")
    .withPassword("test")
    .start()

    client = new Client({ connectionString: container.getConnectionUri() });
    await client.connect();

    const db = drizzle(client);
    await migrate(db, { migrationsFolder: migrationsFolder });
})

beforeEach(async () => {
    await clearAll(); // wipe tables before each test
})

afterAll(async () => {
    await client.end();
    await container.stop();
})