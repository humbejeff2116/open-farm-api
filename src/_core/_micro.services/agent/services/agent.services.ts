import { and, eq, inArray, desc, sql, isNull } from "drizzle-orm";
import { db } from "../../../database/index.js";
import { agents } from "../../../database/drizzle/migrations/schema/agents.js";
import { roleAudits } from "../../../database/drizzle/migrations/schema/roleAudits.js";
import type { Request } from "express";
import type { AppUser } from "../../../middlewares/auth/index.js";
import type { IAgentService } from "../../../common/interfaces/agent.interface.js";
import { inject, injectable, singleton } from "tsyringe";
import type { IUserService } from "../../../common/interfaces/user.interface.js";
import type { IReportService } from "../../../common/interfaces/reports.interface.js";
import { getSortQuery, parsePagination } from "../../../utils/req.utils.js";


@singleton()
@injectable()
export class AgentService implements IAgentService {
    constructor(
        @inject('IUserService') private userService: IUserService,
        @inject('IReportService') private reportService: IReportService
    ) {}


    async registerAgent(data: any): Promise<any> {
        // Logic to register an agent
        const [agent] = await db.insert(agents).values(data).returning();

        return { success: true, data };
    }

    public async getAgent(id: string): Promise<any> {
        return {};
    }

    //A supervisor can update agents in their team
    //An admin can update any agent
    updateAgent(user: AppUser, id: string, updates: any): Promise<any | null> {
        return db.transaction(async (tx) => {
            const row = await tx.query.agents.findFirst({
                where: (agent: Record<string, any>, { and, eq }: {and: any; eq: any}) =>
                    and(
                        eq(agent.id, id),
                        user.role === "supervisor" ? eq(agent.teamName, user.teamName) :
                        // admin: no extra restriction
                        sql`true`
                    ),
            });

            if (!row) return null; // not found or no permission

            const result = await tx.update(agents).set(updates).where(eq(agents.id, id)).returning();
            return result[0];
        });  
    }

    async deleteAgent(id: string): Promise<any> {
        // Soft delete: set deletedAt timestamp
            const result = await db
            .update(agents)
            .set({ deletedAt: new Date() })
            .where(and(eq(agents.id, id), isNull(agents.deletedAt)))
            .returning();

            return ({ 
                success: result.length > 0 ? true 
                : false, message: result.length > 0 ? "Agent deleted" : "Agent not found or already deleted"  
            })
    }

    async restoreAgent(id: string): Promise<any> {
        //TODO...
        //PATCH /agents/:id/restore → restore (deleted_at = NULL)

    }


    //get agent by id with user context for RBAC, if user is agent, can only get self
    // if user is supervisor, can get agents in their team
    // if user is admin, can get any agent
    async getAgentById(user: AppUser, id: string): Promise<any | null> {
        const row = await db.query.agents.findFirst({
            where: (agent: Record<string, any>, { and, eq }: {and: any, eq: any}) =>
                and(
                    eq(agent.id, id),
                    user.role === "agent" ? eq(agent.id, user.id) :
                    user.role === "supervisor" ? eq(agent.teamName, user.teamName) :
                    // admin: no extra restriction
                    sql`true`
                ),
        });

        return row || null;  
    }

    async getAgentsByIds(ids: string[]): Promise<any[]> {
        const agentsList = await db.select().from(agents).where(inArray(agents.id, ids));
        return agentsList;  
    }

    async getAgents(req: Request): Promise<any[]> {
            const { limit, offset } = parsePagination(req.query);
            const { includeDeleted } = req.query;

            // Whitelist allowed sort fields
            const allowedFields = {
                name: agents.name,
                email: agents.email,
                createdAt: agents.createdAt,
            }
            const sortAgents = getSortQuery(req.query, allowedFields, agents.createdAt);


            //TODO... modify query to include soft deleted agents if includeDeleted value is true
            const rows = await db.select().from(agents)
            .orderBy(sortAgents)
            .limit(limit)
            .offset(offset);

            return rows;
    }

    async asignRoleToAgent(
        id: string, 
        previousRole: string, 
        currentRole: "agent" | "supervisor" | "admin",
        reason: string
        , req: Request  
    ):  Promise<any> {
        const {id: userId, role: userRole} = req.user as AppUser;

        if (userRole !== "admin") {
            return { success: false, error: "Only admins can change roles" };
        }

        await db.transaction(async (tx) => {
            await tx.update(agents).set({ role: currentRole }).where(eq(agents.id, id));

            await tx.insert(roleAudits).values({
                subjectAgentId: id,
                previousRole: previousRole as any,
                newRole: currentRole as any,
                changedByAgentId: userId,
                reason: reason ?? null,
            });
        });

        const [updatedAgent] = await db.select().from(agents).where(eq(agents.id, id));
        return { success: true, data: updatedAgent };
    }

    async assignRolesToAgentsInBulk(
        changes: Array<{ 
            id: string; 
            role: "agent" | "supervisor" | "admin"; 
            reason?: string 
        }>,       
        req: Request       
    ): Promise<any> {
        const {id: userId, role: userRole} = req.user as AppUser;
        if (userRole !== "admin") {
            return { success: false, error: "Only admins can change roles" };
        }
        if (changes.length === 0) {
            return { success: false, error: "No changes provided" };
        }
        // Fetch current roles for all agents to be changed
        const agentIds = changes.map(c => c.id);
        const agentsList = await this.getAgentsByIds(agentIds);
        const byId = new Map(agentsList.map(a => [a.id, a]));

        await db.transaction(async (tx) => {
            for (const change of changes) {
                const agent = byId.get(change.id);

                if (!agent) continue; // skip not found

                if (agent.role === change.role) continue; // skip unchanged

                await tx.update(agents).set({ role: change.role }).where(eq(agents.id, change.id));

                await tx.insert(roleAudits).values({
                    subjectAgentId: change.id,
                    previousRole: agent.role as any,
                    newRole: change.role as any,
                    changedByAgentId: userId,
                    reason: change.reason ?? null,
                });
            }
        });

        const updatedAgents = await this.getAgentsByIds(agentIds);
        return { success: true, data: updatedAgents };                  

    }

    async getRoleAudits(query: any): Promise<any[]> {
        const { subjectId, changedById, limit, skip } = query;

        let rows = await db.select().from(roleAudits);
        
        if (subjectId) {
            rows = rows.filter(r => r.subjectAgentId === subjectId);
        }
        if (changedById) {
            rows = rows.filter(r => r.changedByAgentId === changedById);
        }
        // Sort by createdAt descending and apply limit/skip
        rows = rows.sort((a, b) => (new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()))
        .slice(0, limit || 50);

        return rows;
    }
}