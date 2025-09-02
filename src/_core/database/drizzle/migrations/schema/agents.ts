import { 
    pgTable, 
    uuid, 
    timestamp, 
    varchar,
    pgEnum, 
} from "drizzle-orm/pg-core";
import { userRoleEnum } from "./users.js";


export const agentStatusEnum = pgEnum("agent_status", ["active", "inactive"]);

// Supabase's auth.users already exists, so we'll reference it:
export const agents = pgTable("agents", {
    id: uuid("id").primaryKey(),  // same as auth.users.id
    name: varchar("name", { length: 255 }).notNull(),
    phone: varchar("phone", { length: 20 }),
    email: varchar("email", { length: 255 }).notNull().unique(),
    teamName: varchar("team_name", { length: 255 }),
    location: varchar("location", { length: 255 }),
    role: userRoleEnum("role").default("agent").notNull(),
    status: agentStatusEnum("status").default("active").notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});