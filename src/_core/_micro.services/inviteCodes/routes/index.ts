import { Router } from "express";
import { authMiddleware, requireAdmin } from "../../../middlewares/auth/index.js";
import agentController from "../../agent/controllers/index.js";
import adminController from "../controller/index.js";

const router = Router();


router.get("/",authMiddleware, requireAdmin, adminController.getInviteCodes);
router.get("/:id", authMiddleware, requireAdmin, adminController.getInviteCode);
router.post("/", authMiddleware, requireAdmin, adminController.generateInviteCode);
router.patch("/:id", authMiddleware, requireAdmin, agentController.asignRoleToAgent);
router.get("/revoked", authMiddleware, requireAdmin, adminController.getRevokedInviteCodes);

router.patch(
    "/revoke/:code", 
    authMiddleware, 
    requireAdmin, 
    adminController.revokeInviteCode
);

export default router;