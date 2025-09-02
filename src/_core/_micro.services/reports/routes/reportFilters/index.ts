import { Router } from "express";
import { authMiddleware, requireRole } from "../../../../middlewares/auth/index.js";
import reportController from "../../controllers/index.js";
const reportFiltersRouter = Router();

// reports filters routes
reportFiltersRouter.get("/", 
    authMiddleware, 
    requireRole(["admin", "supervisor"]), 
    reportController.getReportsFilterPresets
);  


reportFiltersRouter.post("/",
    authMiddleware, 
    requireRole(["admin", "supervisor"]), 
    reportController.createReportsFilterPreset
);


reportFiltersRouter.delete("/:id", 
    authMiddleware, 
    requireRole(["admin", "supervisor"]), 
    reportController.deleteReportFilterPreset
);

export default reportFiltersRouter;