import { Router } from "express";
import { authMiddleware, requireAdmin } from "../../../middlewares/auth/index.js";
import invitCodesController from "../controller/inviteCodes.controller.js";

const router = Router();


router.get("/", authMiddleware, requireAdmin, invitCodesController.getInviteCodes);
router.get("/:id", authMiddleware, requireAdmin, invitCodesController.getInviteCode);
router.post("/", authMiddleware, requireAdmin, invitCodesController.generateInviteCode);
router.get("/revoked", authMiddleware, requireAdmin, invitCodesController.getRevokedInviteCodes);

router.patch(
    "/revoke/:code", 
    authMiddleware, 
    requireAdmin, 
    invitCodesController.revokeInviteCode
);

export default router;