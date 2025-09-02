import { createClient } from "@supabase/supabase-js";
import type { Request, Response, NextFunction } from "express";
import { userPermission, UserPermissions } from "../data/roles.js";
import { APIError, HttpStatusCode } from "../../lib/logs/errorHandler.js";



type UserRole = "farmer" | "agent" | "supervisor" | "admin";

// Adapt to your Supabase project settings
const SUPABASE_JWT_SECRET = new TextEncoder().encode(process.env.SUPABASE_JWT_SECRET);

export type AppUser = {
    id: string;          // UUID from auth.users
    role: UserRole;
    email?: string;
    teamName?: string;
}

declare global {
    namespace Express {
        interface Request {
            user?: AppUser;
        }
    }
}

const supabaseAdmin = createClient(
    process.env.SUPABASE_URL as string,
    process.env.SUPABASE_SERVICE_ROLE_KEY as string // keep safe, server only
);

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const token = authHeader.split(" ")[1]; // Expecting "Bearer <token>"
        if (!token) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
        if (error || !user) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        req.user = { 
            id: user.id, 
            role: user.role as UserRole || "farmer", // default to farmer if role is missing
            email: user.email as string | undefined,
            teamName: user.user_metadata?.teamName as string | undefined
        } // Attach user ID to request for further use
        next();
    } catch (err) {
        console.error(err);
        return res.status(500).json({ err: "Server error" });   
    }
}

export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
    const user = req.user;

    try {
        if (!user || user.role !== "admin") return res.status(403).json({ error: "Admin role required" });
        next();
    } catch (err) {
        console.error(err);
        return res.status(500).json({ err: "Server error" });   
    }
}

export function requireRole(roles: (UserRole)[]) {
    return async (req: Request, res: Response, next: NextFunction) => {
        const user = req.user
        try {
            if (!user) return res.status(401).json({ error: "Unauthorized" });

            if (!user || !user.role || !roles.includes(user.role)) {
                return res.status(403).json({ error: `Role ${roles.join(" or ")} required` });
            }
            next();
        } catch (err) {
            console.error(err);
            return res.status(500).json({ err: "Server error" });   
        }
    }
}

export function allowPermission(permission: UserPermissions) {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = req.user
            if (!user) return res.status(401).json({ error: "Unauthorized" });

            const userRole = user.role ?? "guest";
            const userPermissions = userPermission.getPermissionsByRoleName(userRole);

            if (userPermissions.includes(permission)) {
                next();
            } else {
                next(new APIError('Access denied', HttpStatusCode.FORBIDDEN))
            }
        } catch (err) {
            next(err);
            // if (err instanceof JsonWebTokenError) {
            //     next(new APIError('Invalid token', HttpStatusCode.UNAUTHORIZED));
            // } else {
            //     next(err);
            // }
        }
    }
}