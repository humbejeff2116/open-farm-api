import { 
    pgTable, 
    uuid, 
    timestamp, 
    boolean, 
    varchar,
} from "drizzle-orm/pg-core";
import { userRoleEnum } from "./users.js";
import { agents } from "./agents.js";
import { email } from "zod";


export const farmers = pgTable("farmers", {
    id: uuid("id").defaultRandom().primaryKey(),
    fullName: varchar("full_name", { length: 255 }).notNull(),
    phone: varchar("phone", { length: 20 }).notNull(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    location: varchar("location", { length: 255 }),
    farmSize: varchar("farm_size", { length: 255 }),
    cropFocus: varchar("crop_focus", { length: 255 }),
    consentGiven: boolean("consent_given").default(false),
    role: userRoleEnum("role").default("farmer").notNull(),
    userId: uuid("user_id").notNull(), // references auth.users.id
    agentId: uuid("agent_id").references(() => agents.id, { onDelete: "set null" }),
    teamName: varchar("team_name", { length: 255 }),
    // status: farmerStatusEnum("status").default("active").notNull(),  
    deactivatedAt: timestamp("deactivated_at", { withTimezone: true }),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});