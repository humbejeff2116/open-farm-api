
import { relations, sql } from "drizzle-orm";
import { 
    pgTable, 
    uuid, 
    text, 
    integer,
    bigint,
    timestamp, 
    boolean, 
    jsonb, 
    date,
    varchar,
    pgEnum, 
} from "drizzle-orm/pg-core";

// Define enum for roles
export const userRoleEnum = pgEnum("user_role", ["farmer", "agent", "supervisor", "admin"]);


export const profiles = pgTable("profiles", {
    id: uuid("id").defaultRandom().primaryKey(),
    fullName: varchar("full_name", { length: 255 }).notNull(),
    phone: varchar("phone", { length: 20 }).notNull(),
    location: varchar("location", { length: 255 }),
    role: userRoleEnum("role").default("farmer").notNull(),
    inviteCode: text("code").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});