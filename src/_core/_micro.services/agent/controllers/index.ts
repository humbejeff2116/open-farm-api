import type { NextFunction, Request, Response } from 'express';
import { z } from "zod";
import agentService from '../services/index.js';

const roleSchema = z.enum(["agent", "supervisor", "admin"]);

const registerAgentSchema = z.object({
    name: z.string(),
    phone: z.string().optional(),
    teamName: z.string().optional(),
    location: z.string().optional(),
});

const updateAgentSchema = z.object({
    name: z.string().min(1).optional(),
    teamName: z.string().min(1).optional(),
    active: z.boolean().optional(),
});

class Controller {
    async registerAgent(req:Request, res: Response, next: NextFunction) {
        /* -----------------  Agents  ----------------- */

        const data = registerAgentSchema.parse(req.body);
        try {
            const agentResp = await agentService.registerAgent(data); 
            return res.status(200).json(agentResp);  
        } catch (err) {
            next(err);   
        }
    }

    async updateAgent(req: Request, res: Response, next: NextFunction) {
        const user = req.user;
        try {
            if (!user) {
                return res.status(401).json({ success: false, message: "Unauthorized" });   
            }
            const id = req.params.id;
            const updates = updateAgentSchema.parse(req.body);
            const updatedAgent = await agentService.updateAgent(user, id, updates);
            if (!updatedAgent) {
                return res.status(404).json({ success: false, message: "Agent not found" });
            }   
            return res.status(200).json({ success: true, data: updatedAgent });
        } catch (e) {
            next(e);
        }
    }

    async getAgentById(req: Request, res: Response, next: NextFunction) {
        const user = req.user;
        const { id } = req.params;
        try {
            if (!user) {
                return res.status(401).json({ success: false, message: "Unauthorized" });   
            }
            const agent = await agentService.getAgentById(user, id);
            if (!agent) {
                return res.status(404).json({ success: false, message: "Agent not found" });
            }
            return res.status(200).json({ success: true, data: agent });
        } catch (err) {
            next(err);
        }
    }

    async getAllAgents(req: Request, res: Response, next: NextFunction) {
        try {
            const agents = await agentService.getAgents(req);
            return res.status(200).json({ success: true, data: agents });
        } catch (err) {
           next(err);
        }   
    } 

    async deleteAgent(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const deleteResp = await agentService.deleteAgent(id);
            return res.status(200).json(deleteResp);
        } catch (err) {
            next(err);  
        }
    }

    async restoreAgent(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const restoreResp = await agentService.restoreAgent(id);
            return res.status(200).json(restoreResp);
        } catch (err) {
            next(err);  
        }
    }






    
    async asignRoleToAgent(req: Request, res: Response, next: NextFunction) {
        try { 
            const user = req.user;
            const { id:agentId } = req.params;
            if (!user) {
                return res.status(401).json({ success: false, message: "Unauthorized" });   
            }
            const body = z.object({ role: roleSchema, reason: z.string().max(500).optional() }).parse(req.body);
            // Fetch agent to check current role
            const agent = await agentService.getAgentById(user, agentId);
            if (!agent) return res.status(404).json({ error: "Agent not found" });

            if (agent.role === body.role) {
                return res.json({ ok: true, unchanged: true, agent: agent });
            }
            const asignRoleResp = await agentService.asignRoleToAgent(
                agentId,
                agent.role,
                body.role,
                body.reason ?? "",
                req
            );
            if (!asignRoleResp.success) {   
                return res.status(200).json(asignRoleResp);
            }
        } catch (err) {
            next(err);
        }
    }

    async assignRoleToAgentInBulk(req: Request, res: Response, next: NextFunction) {
        try {
            const user = req.user;
            if (!user) {    
                return res.status(401).json({ success: false, message: "Unauthorized" });   
            }
            
            const body = z.object({
                changes: z.array(z.object({
                    id: z.string().uuid(),
                    role: roleSchema,
                    reason: z.string().max(500).optional(),
                })).min(1),
            }).parse(req.body);

            if (body.changes.length > 50) {
                return res.status(400).json({ error: "Max 50 changes at a time" });
            } 
            const resp = await agentService.assignRolesToAgentsInBulk(body.changes, req);       
            return res.status(200).json(resp);
        } catch (err) { 
            console.error(err);
            return res.status(500).json({ success: false, message: "Server error" });
        }   
    }

    async getAgentsByIds(req: Request, res: Response, next: NextFunction) {
        const ids = z.array(z.string().uuid()).parse(req.query.ids);
        // Validate IDs
        if (!Array.isArray(ids)) {  
            return res.status(400).json({ error: "Invalid IDs format" });
        }
        if (!ids || ids.length === 0) {
            return res.status(400).json({ error: "No IDs provided" });
        }
        if (ids.length > 100) {
            return res.status(400).json({ error: "Max 100 IDs at a time" });
        }
        
        
        try {
            if (ids.length === 1) {
                return this.getAgentById(req, res, next); // reuse existing method for single ID
            }
            const agents = await agentService.getAgentsByIds(ids);
            if (agents.length === 0) {
                return res.status(404).json({ success: false, message: "No agents found for the provided IDs" });
            }
            if (agents.length !== ids.length) {
                console.warn(`Some agents not found for IDs: ${ids.filter(id => !agents.some(a => a.id === id))}`);
            }
            // Return all found agents
            return res.status(200).json({ success: true, data: agents });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: "Server error" });
        }
    } 
    
    async getRoleAudits(req: Request, res: Response, next: NextFunction) {
        const query = z.object({
            subjectId: z.string().uuid().optional(),
            changedById: z.string().uuid().optional(),
            limit: z.coerce.number().min(1).max(200).default(50),
        }).parse(req.query);

        try {
            let rows = agentService.getRoleAudits(query);
            return res.json({ ok: true, audits: rows });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: "Server error" });
        }
    }
}

const agentController = new Controller();
export default agentController;