import { 
    pgTable, 
    text, 
    bigint,
    timestamp, 
    jsonb,
    uuid,  
} from "drizzle-orm/pg-core";


export const notificationDeadLetters = pgTable("notification_dead_letters", {
    // id: bigint("id", { mode: "number" }).primaryKey(),
    id: uuid("id").defaultRandom().primaryKey(),
    channel: text("channel").notNull(),
    payload: jsonb("payload").notNull(),
    reason: text("reason").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});