import { 
    pgTable, 
    uuid, 
    text, 
    integer,
    timestamp, 
    boolean,
    pgEnum  
} from "drizzle-orm/pg-core";
import { userRoleEnum } from "./users.js";


export const statusEnum = pgEnum("invite_code_status", ["active", "revoked", "expired"]);
// invite_codes table
export const inviteCodes = pgTable("invite_codes", {
    id: uuid("id").defaultRandom().primaryKey(),
    code: text("code").notNull().unique(),         // short code string
    role: userRoleEnum("role").notNull(),                  // 'agent' | 'supervisor' | 'admin'
    teamName: text("team_name"),                   // optional team assignment
    createdBy: uuid("created_by"),                 // admin id who made it
    maxUses: integer("max_uses").default(1),       // how many times it can be used
    uses: integer("uses").default(0),              // current uses
    status: statusEnum("status").default("active").notNull(), // active | revoked | expired
    active: boolean("active").default(true), // simple active flag
    expiresAt: timestamp("expires_at"), // optional expiration
    revoked: boolean("revoked").default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});