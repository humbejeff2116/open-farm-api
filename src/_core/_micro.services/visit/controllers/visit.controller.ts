import type { NextFunction, Request, Response } from 'express';
import { z } from "zod";
import visitService from '../services/index.js';

class Controller {

    async registerVisit(req:Request, res: Response) {
        /* -----------------  Visits  ----------------- */
        const schema = z.object({
            farmerId: z.string().uuid(),
            agentId: z.string().uuid().optional(),
            visitDate: z.string().optional(),
            notes: z.string().optional(),
        });

        const data = schema.parse(req.body);
        try {
            const visitResp = await visitService.registerVisit(data); 
            return res.status(200).json(visitResp);  
        } catch (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: "Server error" });   
        }
    }

    async getVisitsByFarmerId(req: Request, res: Response, next: NextFunction) {
        const { farmerId } = req.params;
        try {
            const visits = await visitService.getVisitsByFarmerId(farmerId);
            return res.status(200).json({ success: true, data: visits });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: "Server error" });
        }   
    } 
    
    async getAllVisits(req: Request, res: Response, next: NextFunction) {
        try {
            const visits = await visitService.getAllVisits();
            return res.status(200).json({ success: true, data: visits });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: "Server error" });
        }   
    }   
}

const visitController = new Controller();
export default visitController;

