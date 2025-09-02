import type { NextFunction, Request, Response } from 'express';
import { z } from "zod";
import farmerService from '../services/index.js';

class Controller {
    async registerFarmer(req:Request, res: Response) {
        /* -----------------  Farmers  ----------------- */
        let data;
        
        try {
            const schema = z.object({
                fullName: z.string(),
                phone: z.string(),
                location: z.string().optional(),
                farmSize: z.string().optional(),
                cropFocus: z.string().optional(),
                consentGiven: z.boolean().default(false),
                agentId: z.string().uuid().optional(),
            });

            data = schema.parse(req.body);
        } catch (err: any) {
            return res.status(400).json({
                error: "Validation failed",
                details: err.errors || err.message,
            });
        }

        try {
            // Check if farmer with same name exists
            const farmerExists = await farmerService.farmerExists(data.fullName);

            if (farmerExists) {
                return res.status(400).json({ success: false, message: "Farmer with this name already exists" });
            }

            const farmerResp = farmerService.registerFarmer(data);
            return res.status(200).json({ success: true, data: farmerResp });  
        } catch (err) {
            console.error(err);   
        }
    }

    async getFarmerById(req: Request, res: Response, next: NextFunction) {
        const user = req.user;
        const id = req.params.id;

        try {
            const farmer = await farmerService.getFarmerById(user, id);
            if (!farmer) {
                return res.status(404).json({ success: false, message: "Farmer not found" });
            }
            return res.status(200).json({ success: true, data: farmer });
        } catch (err) {
            next(err);
        }
    }

    async getFarmers(req: Request, res: Response, next: NextFunction) {
        try {
            const farmersResp = await farmerService.getAllFarmers(req);
            return res.status(200).json(farmersResp);
        } catch (err) {
            next(err);
        }   
    }

    async updateFarmer(req: Request, res: Response, next: NextFunction) {
        try {
            const user = req.user;
            const { id } = req.params;

            const schema = z.object({
                fullName: z.string().optional(),
                phone: z.string().optional(),
                location: z.string().optional(),
                farmSize: z.string().optional(),
                cropFocus: z.string().optional(),
                consentGiven: z.boolean().optional(),
                userId: z.string().uuid().optional(),
                agentId: z.string().uuid().optional(),
            });

            const updateData = schema.parse(req.body);
            const updatedFarmer = await farmerService.updateFarmer(user, id, updateData);
            if (!updatedFarmer) {
                return res.status(404).json({ success: false, message: "Farmer not found or no permission to update" });
            }   
            return res.status(200).json({ success: true, data: updatedFarmer });
        } catch (err) {
            next(err);
        }
    }

    async deleteFarmer(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const deleteResp = await farmerService.deleteFarmer(id);
            return res.status(200).json(deleteResp);
        } catch (err) {
            next(err);  
        }
    }


















    // async registerFarmerRLS(req: Request, res: Response) {
    //     // In your route (Authorization: Bearer <agent_jwt> from client or Apps Script):
    //     const supa = supabaseForUser(agentJwt);
    //     // Now queries honor RLS:
    //     await supa.from("farmers").insert({ full_name: "Ada Obi", agent_id: "<ignored by policy or must match auth.uid()>" });

    // }



    async getFarmersByAgentId(req: Request, res: Response, next: NextFunction) {
        const { agentId } = req.params;
        try {
            const farmers = await farmerService.getFarmersByAgentId(agentId);
            return res.status(200).json({ success: true, data: farmers });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: "Server error" });
        }   
    }

    async getFarmersByTeamName(req: Request, res: Response, next: NextFunction) {
        const { teamName } = req.params;
        try {
            const farmers = await farmerService.getFarmersByTeamName(teamName);
            return res.status(200).json({ success: true, data: farmers });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: "Server error" });
        }   
    }
}

const farmerController = new Controller();
export default farmerController;
