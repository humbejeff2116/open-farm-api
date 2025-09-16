import { 
    pgTable, 
    uuid, 
    timestamp, 
    boolean, 
    varchar,
    text,
    jsonb,
} from "drizzle-orm/pg-core";
import { userRoleEnum, users } from "./users.js";
import { agents } from "./agents.js";
import { email } from "zod";


export const reports = pgTable("reports", {
    id: uuid("id").defaultRandom().primaryKey(),
    title: varchar("title", { length: 255 }).notNull(),
    description: varchar("description", { length: 1000 }).notNull(),
    status: varchar("status", { length: 50 }).notNull(), // e.g., "open", "resolved", "dismissed"
    reporterRole: userRoleEnum("reporter_role").notNull(), // "farmer", "agent", "admin"
    reporterId: uuid("reporter_id").notNull(), // references either farmers or agents   
    type: varchar("type", { length: 100 }), // e.g., "pest", "weather", "other"
    tags: varchar("tags", { length: 255 }), // comma-separated tags
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const reportFilterPresets = pgTable("report_filter_presets", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").notNull().references(() => users.id),
    name: text("name").notNull(),
    filters: jsonb("filters").notNull(), // e.g. { status: "open", type: "disease" }
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

