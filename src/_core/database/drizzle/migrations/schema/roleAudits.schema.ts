
import { 
    pgTable, 
    uuid, 
    text, 
    timestamp, 
} from "drizzle-orm/pg-core";
import { userRoleEnum } from "./users.js";


export const roleAudits = pgTable("role_audits", {
    id: uuid("id").defaultRandom().primaryKey(),
    subjectAgentId: uuid("subject_agent_id").notNull(), // whose role changed
    previousRole: userRoleEnum("previous_role").notNull(),
    newRole: userRoleEnum("new_role").notNull(),
    changedByAgentId: uuid("changed_by_agent_id").notNull(), // admin who made change
    reason: text("reason"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});