import { Router } from "express";
import visitController from "../controllers/index.js";
const visitRouter = Router();


visitRouter.post('/visit', visitController.registerVisit);  
visitRouter.get('/visits/:farmerId', visitController.getVisitsByFarmerId);
visitRouter.get('/visits', visitController.getAllVisits);

export default visitRouter;