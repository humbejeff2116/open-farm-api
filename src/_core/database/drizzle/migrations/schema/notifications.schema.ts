import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const notifications = pgTable("notifications", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").notNull(),
    message: text("message").notNull(),
    severity: text("severity").default("info"), // info | success | warning | critical
    createdAt: timestamp("created_at").defaultNow(),
    readAt: timestamp("read_at"),
});