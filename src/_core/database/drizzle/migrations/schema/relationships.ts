import { relations } from "drizzle-orm";
import { agents } from "./agents.js";
import { farmers } from "./farmers.js";
import { visits } from "./visits.js";
import { diagnostics } from "./diagnostics.js";




export const agentsRelations = relations(agents, ({ many }) => ({
    farmers: many(farmers),
    visits: many(visits),
    diagnostics: many(diagnostics),
}));

export const farmersRelations = relations(farmers, ({ one, many }) => ({
    agent: one(agents, {
        fields: [farmers.agentId],
        references: [agents.id],
    }),
    visits: many(visits),
    diagnostics: many(diagnostics),
}));