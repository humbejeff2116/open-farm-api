import crypto from "node:crypto";
import { eq, sql, desc, and, SQL } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db } from "../../../database/index.js";
import { inviteCodes } from "../../../database/drizzle/migrations/schema/inviteCodes.js";
import { parsePagination } from "../../../utils/index.js";


class Service {
    async createInviteCode(body: any, req: any) {
        const code = body.code ?? (body.prefix ? body.prefix.toUpperCase() + "-" : "") + crypto.randomBytes(6).toString("base64url"); // URL-safe
        // const code = (body.prefix ? body.prefix.toUpperCase() + "-" : "") + nanoid(8).toUpperCase();
        const payload = {
            code,
            role: body.role,
            teamName: body.teamName ?? null,
            createdBy: req.user.id,
            maxUses: body.maxUses,
            // uses: 0,
            // active: body.active ?? true,
            expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
        }
        const [invite] = await db.insert(inviteCodes).values(payload).returning();
    

        if (!invite) {
            throw new Error("Failed to create invite code");    
        }
        // Return the generated code and its ID
        return {success: true, code: invite.code, id: invite.id };
    }

    async getInviteCodes(query: any) {
        const { limit, offset } = parsePagination(query);
        const { role, teamName, active } = query as { role?: string; teamName?: string; active?: string };
        let where: SQL<unknown> | undefined = sql<string>`true`;

        if (role) where = and(where, eq(inviteCodes.role, role as any));
        if (teamName) where = and(where, eq(inviteCodes.teamName, teamName));
        if (active !== undefined) where = and(where, eq(inviteCodes.active, active === "true"));

        const rows = await db.select().from(inviteCodes)
        .where(where)
        .orderBy(desc(inviteCodes.id))
        .limit(limit)
        .offset(offset);
        return rows;
    }

    async getInviteCodeById(id: string) {
        const row = await db.query.inviteCodes
        .findFirst({ where: (invtCode: Record<string, any>, { eq }:{ eq: any }) => eq(invtCode.id, id) });
        return row || null;
    }

    async updateInviteCode(id: string, updates: any) {
        // Normalize date fields
        const normalized: any = { ...updates }
        
        if ("expiresAt" in updates) {
            normalized.expiresAt = updates.expiresAt ? new Date(updates.expiresAt) : null;
        }
        const result = await db.update(inviteCodes)
        .set(normalized)
        .where(eq(inviteCodes.id, id))
        .returning();
        return result[0];

    }

    async revokeInviteCode(code: string) {
        const [invite] = await db.update(inviteCodes).set({ revoked: true }).where(eq(inviteCodes.code, code)).returning();
        return invite;
    }























    async getRevokedInviteCodes() {
        const codes = await db.select().from(inviteCodes)
        .where(eq(inviteCodes.revoked, true))
        .orderBy(desc(inviteCodes.createdAt));
        return codes;   
    }

    async getAllInviteCodes() {
        const codes = await db.select().from(inviteCodes)
        .orderBy(desc(inviteCodes.createdAt));
        return codes;
    }

    async getInviteCodeByCode(code: string) {
        const [invite] = await db.select().from(inviteCodes)
        .where(eq(inviteCodes.code, code)).limit(1);
        return invite || null;
    }


    async deleteInviteCode(id: string) {
        await db.delete(inviteCodes).where(eq(inviteCodes.id, id));
        return { success: true, message: "Invite code deleted" };
    }

    async purgeOldInviteCodes(days: number) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);

        const deletedCount = await db.delete(inviteCodes)
        .where(
            eq(inviteCodes.createdAt, sql`${inviteCodes.createdAt} < ${cutoffDate}`) // pseudo-code for date comparison
        ).returning().then(res => res.length);

        return { success: true, deletedCount };
    } 
    
    async inviteCodeExists(code: string) {
        const [invite] = await db.select().from(inviteCodes)
        .where(eq(inviteCodes.code, code)).limit(1);
        return !!invite;    
    }

    async getTotalInviteCodesCount() {
        const [{ count }] = await db.select({ count: sql`COUNT(*)` })
        .from(inviteCodes);
        return Number(count) || 0;
    }

    async getActiveInviteCodesCount() {
        const [{ count }] = await db.select({ count: sql`COUNT(*)` })
        .from(inviteCodes).where(eq(inviteCodes.revoked, false));
        return Number(count) || 0;
    }

    async getUsedInviteCodesCount() {
        const [{ count }] = await db.select({ count: sql`COUNT(*)` })
        .from(inviteCodes).where(sql`${inviteCodes.uses} > 0`);
        return Number(count) || 0;
    }

    async getRevokedInviteCodesCount() {
        const [{ count }] = await db.select({ count: sql`COUNT(*)` })
        .from(inviteCodes).where(eq(inviteCodes.revoked, true));
        return Number(count) || 0;
    }

    async getInviteCodesByRole(role: "farmer" | "agent" | "supervisor" | "admin") {
        const codes = await db.select().from(inviteCodes)
        .where(eq(inviteCodes.role, role ))
        .orderBy(desc(inviteCodes.createdAt));
        return codes;
    }

    async getInviteCodesByTeamName(teamName: string) {
        const codes = await db.select().from(inviteCodes)
        .where(eq(inviteCodes.teamName, teamName))
        .orderBy(desc(inviteCodes.createdAt));
        return codes;
    }

    async getInviteCodesByCreator(adminId: string) {
        const codes = await db.select().from(inviteCodes)
        .where(eq(inviteCodes.createdBy, adminId))
        .orderBy(desc(inviteCodes.createdAt));
        return codes;
    }

    async getExpiredInviteCodes(daysValid: number) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysValid);

        const codes = await db.select().from(inviteCodes)
        .where(
            sql`${inviteCodes.createdAt} < ${cutoffDate} AND ${inviteCodes.uses} >= ${inviteCodes.maxUses}`
        ).orderBy(desc(inviteCodes.createdAt));

        return codes;
    }
}

const adminService = new Service();
export default adminService;