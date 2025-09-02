import { defineConfig } from "drizzle-kit";
import 'dotenv/config';

if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not set.");
}


export default defineConfig({
    dialect: "postgresql",
    schema: "./src/_core/database/drizzle/migrations/*", // Path to your schema file
    out: "./drizzle", // Path to your migration files
    dbCredentials: {
        url: String(process.env.DATABASE_URL), // Your connection string
    }
});
