import { and, asc, desc, eq, isNull, like, SQL, sql } from "drizzle-orm";
import { db } from "../../../database/index.js";
import { farmers } from "../../../database/drizzle/migrations/schema/farmers.js";
import { getSortQuery, parsePagination } from "../../../utils/index.js";
import type { Request } from "express";

type SortDirection = "asc" | "desc";
interface FarmerQueryOptions {
  page?: number;
  pageSize?: number;
  sort?: string; // e.g. "name:asc"
}

class Service {
    async registerFarmer(data: any) {
        // Logic to register a farmer
        const [farmer] = await db.insert(farmers).values(data).returning();
        return { success: true, data: farmer };
    }

    async farmerExists(name: string) {
        const farmer = await db.select().from(farmers)
        .where(eq(farmers.fullName, name)).
        limit(1);
        return farmer.length > 0;
    }

    async getFarmerById(user: any, id: string) {
        const row = await db.query.farmers.findFirst({
            where: (
                farmer: Record<string, any>, 
                { and, eq, isNull }: {and: any; eq: any; isNull: any}
            ) =>
                and(
                    eq(farmer.id, id),
                    isNull(farmer.deletedAt),
                    user.role === "farmer" ? eq(farmer.userId, user.id) :
                    user.role === "agent"  ? eq(farmer.agentId, user.id) :
                    // admin: no extra restriction
                    sql`true`
                ),
        });

        return row || null;
    }

    async getAllFarmers(req: Request) {
        const { limit, offset } = parsePagination(req.query);
        let { q } = req.query as { q?: string};
        const user = req.user;
        if (!user) {
            return ({ 
                success: false, 
                data: null,
                message: 'Un Authourized'
            });
        }
        // Whitelist allowed sort fields
        const allowedFields = {
            name: farmers.fullName,
            email: farmers.email,
            createdAt: farmers.createdAt,
        }
        const sortFarmers = getSortQuery(req.query, allowedFields, farmers.createdAt);

        // Base: not soft-deleted
        let where: SQL<unknown> | undefined = isNull(farmers.deletedAt);

        // RBAC scope
        if (user.role === "farmer") {
            where = and(where, eq(farmers.userId, user.id));
        } else if (user.role === "agent") {
            where = and(where, eq(farmers.agentId, user.id));
        }

        // Simple search (name/location)
        const search = q?.trim();
        const rows = await db
        .select()
        .from(farmers)
        .where(
            search
            ? and(where, sql`${farmers.fullName} ILIKE ${"%" + search + "%"} OR ${farmers.location} ILIKE ${"%" + search + "%"}`)
            : where
        )
        .orderBy(sortFarmers)
        .limit(limit)
        .offset(offset);

        const [{ count }] = await db
        .select({ count: sql<number>`count(*)` })
        .from(farmers);

        return {
            success: true,
            data: rows, 
            page: Math.floor(offset / limit) + 1,
            pageSize: limit,
            total: Number(count) || 0,
            totalPages: Math.ceil((Number(count) || 0) / limit),
        }
    }

    async updateFarmer(user: any, id: string, updates: any) {
        // Agents can only edit their assigned farmers
        const scope = user.role === "agent" ? 
        sql`${farmers.agentId} = ${user.id}` : sql`true`;

        const result = await db
        .update(farmers)
        .set({ ...updates })
        .where(sql`${farmers.id} = ${id} AND ${farmers.deletedAt} IS NULL AND ${scope}`)
        .returning();
        return result[0];
    }

    async deleteFarmer(id: string) {
        // Soft delete: set deletedAt timestamp
        const result = await db
        .update(farmers)
        .set({ deletedAt: new Date() })
        .where(and(eq(farmers.id, id), isNull(farmers.deletedAt)))
        .returning();
        return { success: result.length > 0
            ? true
            : false, message: result.length > 0 ? "Farmer deleted" : "Farmer not found or already deleted"  
        }
    } 









    async getFarmersByAgentId(agentId: string) {
        const agentFarmers = await db.select().from(farmers).where(eq(farmers.agentId, agentId));
        return agentFarmers;
    }

    async getFarmersByTeamName(teamName: string) {
        const teamFarmers = await db.select().from(farmers).where(eq(farmers.teamName, teamName));
        return teamFarmers;
    }

    async getFarmersByLocation(location: string) {
        const locationFarmers = await db.select().from(farmers).where(eq(farmers.location, location));
        return locationFarmers;
    }
























    async getFarmersByCropFocus(cropFocus: string) {
        const cropFarmers = await db.select().from(farmers).where(eq(farmers.cropFocus, cropFocus));
        return cropFarmers;
    }

    async getFarmersByFarmSize(farmSize: string) {
        const sizeFarmers = await db.select().from(farmers).where(eq(farmers.farmSize, farmSize));
        return sizeFarmers;
    }
    
    async getFarmersByConsent(consentGiven: boolean) {
        const consentFarmers = await db.select().from(farmers).where(eq(farmers.consentGiven, consentGiven));
        return consentFarmers;
    }

    async getFarmerByPhone(phone: string) {
        const [farmer] = await db.select().from(farmers).where(eq(farmers.phone, phone)).limit(1);
        return farmer || null;
    }

    async getFarmersByName(name: string) {
        const nameFarmers = await db.select().from(farmers).where(eq(farmers.fullName, name));
        return nameFarmers;
    }

}

const farmerService = new Service();
export default farmerService;