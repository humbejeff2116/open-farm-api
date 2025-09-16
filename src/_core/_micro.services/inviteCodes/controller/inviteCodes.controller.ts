import type { Request, Response, NextFunction } from "express";
import { container } from "tsyringe";
import { z } from "zod";
import { InviteService } from "../services/inviteCodes.service.js";

const inviteCodesService = container.resolve(InviteService);



// const schema = z.object({
//     prefix: z.string().min(2).max(6).optional(), // optional human prefix
//     role: z.enum(["farmer", "agent", "supervisor", "admin"]),
//     teamName: z.string().max(255).optional().nullable(),
//     maxUses: z.number().int().min(1).max(100).optional().default(1),
// });
const CreateInviteCodeSchema = z.object({
    prefix: z.string().min(2).max(6).optional(), // optional human prefix
    role: z.enum(["admin", "agent", "supervisor", "farmer"]),
    teamName: z.string().max(255).optional().nullable(),
    maxUses: z.number().int().min(1).max(100).optional().default(1),
    expiresAt: z.string().datetime().optional(), // ISO
    status: z.enum(["active", "revoked", "expired"]).optional().default("active"),
    code: z.string().min(6).max(64).optional(), // allow custom or auto
    active: z.boolean().optional(),
});

const UpdateInviteCodeSchema = z.object({
    teamName: z.string().min(1).max(255).optional(),
    maxUses: z.number().int().min(1).max(100).optional(),
    expiresAt: z.string().datetime().nullable().optional(),
    status: z.enum(["active", "revoked", "expired"]).optional(),
    active: z.boolean().optional(),
});


class Controller {
    async generateInviteCode(req: Request, res: Response, next: NextFunction) {
        try {
            const user = req.user;
            if (!user) {
                return res.status(401).json({ success: false, message: "Unauthorized" });   
            }
            const body = CreateInviteCodeSchema.parse(req.body);
            const codeResp = await inviteCodesService.createInviteCode(body, user);
            return res.status(200).json(codeResp);
        } catch (err) {
            next(err);
        }
    }

    async getInviteCodes(req: Request, res: Response, next: NextFunction) {
        try {
            const codes = await inviteCodesService.getInviteCodes(req.query);
            return res.status(200).json({ success: true, data: codes });    
        } catch (err) {
            next(err);
        }
    }

    async getInviteCode(req: Request, res: Response, next: NextFunction) {
        const { id } = req.params;
        try {
            const invite = await inviteCodesService.getInviteCodeById(id);
            if (!invite) {
                return res.status(404).json({ success: false, message: "Invite code not found" });
            }
            return res.status(200).json({ success: true, data: invite });
        } catch (err) {
            next(err);
        }
    }
 
    async updateInviteCode(req: Request, res: Response, next: NextFunction) {
        try {
            const user = req.user;
            const id = req.params.id;
            const updates = UpdateInviteCodeSchema.parse(req.body);
            const updated = await inviteCodesService.updateInviteCode(id, updates);
            if (!updated) {
                return res.status(404).json({ success: false, message: "Invite code not found" });
            }
            return res.status(200).json({ success: true, data: updated });
        } catch (err) {
            next(err);
        }
    }














    async revokeInviteCode(req: Request, res: Response) {
        const { code } = req.params;
        try {
            const revoked = await inviteCodesService.revokeInviteCode(code);
            if (!revoked) {
                return res.status(404).json({ success: false, message: "Invite code not found" });
            }
            return res.status(200).json({ success: true, data: revoked });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: "Server error" });
        }
    }

    async getRevokedInviteCodes(req: Request, res: Response) {
        try {
            const codes = await inviteCodesService.getRevokedInviteCodes();
            return res.status(200).json({ success: true, data: codes });    
        } catch (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: "Server error" });
        }
    }

    async getAllInviteCodes(req: Request, res: Response) {
        try {
            const codes = await inviteCodesService.getAllInviteCodes();
            return res.status(200).json({ success: true, data: codes });    
        } catch (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: "Server error" });
        }
    }

    async getInviteCodeByCode(req: Request, res: Response) {
        const { code } = req.params;
        try {
            const invite = await inviteCodesService.getInviteCodeByCode(code);
            if (!invite) {
                return res.status(404).json({ success: false, message: "Invite code not found" });
            }
            return res.status(200).json({ success: true, data: invite });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: "Server error" });
        }
    }

}

const invitCodesController = new Controller();
export default invitCodesController;
