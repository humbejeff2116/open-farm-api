import type { Request, Response } from 'express';
import accountService from "../services/index.js";
import { z } from "zod";

class Controller {

    async signUp(req: Request, res: Response) {
        try {
            const data = z.object({
                fullName: z.string().min(3).max(100),
                email: z.string().email().max(255),
                password: z.string().min(6).max(100),   
                teamName: z.string().max(255).optional().nullable(),
                inviteCode: z.string().max(20).optional().nullable(),
            }).parse(req.body);
            // Create account in Supabase Auth  
            await accountService.signUp(data);

            return res.status(201).json({ success: true, message: "User registered successfully" });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ success: false, message: "Server error" });
        }
    }   
}