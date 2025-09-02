import { 
    pgTable, 
    uuid, 
    text, 
    timestamp, 
} from "drizzle-orm/pg-core";
import { agents } from "./agents.js";
import { farmers } from "./farmers.js";

export const visits = pgTable("visits", {
    id: uuid("id").defaultRandom().primaryKey(),
    farmerId: uuid("farmer_id").references(() => farmers.id, { onDelete: "cascade" }),
    agentId: uuid("agent_id").references(() => agents.id, { onDelete: "set null" }),
    notes: text("notes"),
    visitDate: timestamp("visit_date").defaultNow(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});