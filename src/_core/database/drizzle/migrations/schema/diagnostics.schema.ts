import { 
    pgTable, 
    uuid, 
    text, 
    timestamp, 
    jsonb,  
} from "drizzle-orm/pg-core";
import { farmers } from "./farmers.js";
import { agents } from "./agents.js";



export const diagnostics = pgTable("diagnostics", {
    id: uuid("id").defaultRandom().primaryKey(),
    farmerId: uuid("farmer_id").references(() => farmers.id, { onDelete: "cascade" }),
    agentId: uuid("agent_id").references(() => agents.id, { onDelete: "set null" }),
    diagnosisType: text("diagnosis_type").notNull(),
    result: jsonb("result"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});