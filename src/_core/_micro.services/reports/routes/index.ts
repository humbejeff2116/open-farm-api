import { Router } from "express";
import { authMiddleware, requireRole } from "../../../middlewares/auth/index.js";   
import reportController from "../controllers/index.js";
const router = Router();


// router.get("/:type", authMiddleware, requireRole(["admin", "supervisor"]), reportController.generateReport);
router.get("/farmers", authMiddleware, requireRole(["admin", "supervisor"]), reportController.getFarmersPerAgent); 


// reports analytics
router.get(
    "/analytics",
    authMiddleware, 
    requireRole(["admin", "supervisor"]),
    reportController.getReportsAnalytics 
);

export default router;