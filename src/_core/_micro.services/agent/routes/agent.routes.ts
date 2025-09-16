import { Router } from "express";
import agentController from "../controllers/index.js";
import { requireRole } from "../../../middlewares/auth/index.js";
const agentRouter = Router();


agentRouter.post('/', requireRole(["admin"]), agentController.registerAgent);
agentRouter.get('/', requireRole(["admin"]), agentController.getAllAgents);
agentRouter.get('/:id', requireRole(["admin", "supervisor", "agent"]), agentController.getAgentById);
// Assign role to agent - only admin can do this
agentRouter.patch("/:id/role", requireRole(["admin"]), agentController.asignRoleToAgent);
agentRouter.patch('/:id', requireRole(["admin", "supervisor"]), agentController.updateAgent);
agentRouter.patch('/:id/restore', requireRole(["admin"]), agentController.restoreAgent)
agentRouter.delete('/:id', requireRole(["admin"]), agentController.deleteAgent);
export default agentRouter;