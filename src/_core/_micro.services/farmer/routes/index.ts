import { Router } from "express";
import farmerController from "../controllers/index.js";
import { requireRole } from "../../../middlewares/auth/index.js";
const farmerRouter = Router();


farmerRouter.post('/', requireRole(["agent", "supervisor", "admin"]), farmerController.registerFarmer);
farmerRouter.get('/', requireRole(["admin", "agent", "farmer"]), farmerController.getFarmers);
farmerRouter.get('/:id', requireRole(["admin", "agent", "farmer"]), farmerController.getFarmerById);
farmerRouter.patch('/:id', requireRole(["admin", "agent"]), farmerController.updateFarmer);
farmerRouter.delete('/:id', requireRole(["admin"]), farmerController.deleteFarmer);


farmerRouter.get("/team", requireRole(["supervisor", "admin"]), farmerController.getFarmersByTeamName); 

export default farmerRouter;