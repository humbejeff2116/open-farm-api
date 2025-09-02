import { and, asc, between, count, desc, eq, gte, inArray, isNull, lte, SQL, sql } from "drizzle-orm";
import { z } from "zod";
import { farmers } from "../../../database/drizzle/migrations/schema/farmers.js";
import { db } from "../../../database/index.js";
import { reports } from "../../../database/drizzle/migrations/schema/reports.js";
import { getSortQuery, parsePagination } from "../../../utils/index.js";
    // import { and, gte, lte, eq, inArray, asc, desc } from "drizzle-orm";
// import { reports } from "@/db/schema";



const DateRange = z.object({
    from: z.string().datetime(),
    to: z.string().datetime(),
});

class Service {
    async getReports(reqQuery: any) {
        // List reports with pagination, filtering, sorting
        const { page, pageSize, sort, status, type } = reqQuery;
        const { limit, offset } = parsePagination(reqQuery);
        const sortReports = getSortQuery(reqQuery, reports, reports.createdAt);

        // Base: not soft-deleted
        let where: SQL<unknown> | undefined = isNull(reports.deletedAt);

        if (status) where= and(where, eq(reports.status, status));
        if (type) where = and(where, eq(reports.type, type));


        const rows = await db.select()
        .from(farmers)
        .where(where)
        .orderBy(sortReports)
        .limit(limit)
        .offset(offset);

        const [{ count }] = await db.select({ 
            count: sql<number>`count(*)` 
        })
        .from(farmers);


        return({
            data: rows,
            pagination: {
                page,
                pageSize,
                total: Number(count),
            },
        });
    }

    async getFarmersPerAgentReport(query: any) {
        const { from, to } = DateRange.partial().parse(query);
        // Basic aggregate: farmers per agent within optional date range (assumes createdAt column)
        const where = and(
            isNull(farmers.deletedAt),
            from && to ? between(farmers.createdAt, new Date(from), new Date(to)) : sql`true`
        );

        const rows = await db.select({
            agentId: farmers.agentId,
            total: count(farmers.id).as("total"),
        })
        .from(farmers)
        .where(where)
        .groupBy(farmers.agentId);

        // Optionally join agent details
        const enriched = await Promise.all(
            rows.map(async (row) => {
                const agent = row.agentId
                ? await db.query.agents.findFirst({ 
                    where: (agent: Record<string, any>, { eq }: {eq: any}) => eq(agent.id, row.agentId) 
                }) : null;
                return { agentId: row.agentId, agentName: agent?.name ?? null, total: Number(row.total) };
            })
        );
        return enriched;
    }

    async listReports({ 
        page = 1, 
        pageSize = 20, 
        filters = {
            status: null, 
            type: null, 
            role: null, 
            from: null, 
            to: null, 
            tags: [],
        }, 
        sort = "created_at:desc" 
    }) {
        const conditions = [];

        if (filters.status) conditions.push(eq(reports.status, filters.status));
        if (filters.type) conditions.push(eq(reports.type, filters.type));
        if (filters.role) conditions.push(eq(reports.reporterRole, filters.role));
        if (filters.from) conditions.push(gte(reports.createdAt, new Date(filters.from)));
        if (filters.to) conditions.push(lte(reports.createdAt, new Date(filters.to)));
        if (filters.tags?.length) conditions.push(inArray(reports.tags, filters.tags));

        const sortReports = getSortQuery({sort}, reports, sort);
        const offset = (page - 1) * pageSize;
        const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

        const data = await db
            .select()
            .from(reports)
            .where(whereClause)
            .orderBy(sortReports)
            .limit(pageSize)
            .offset(offset);

        const [{ count }] = await db.select({ count: sql<number>`count(*)` })
            .from(reports)
            .where(whereClause);

        return { data, page, pageSize, total: count, totalPages: Math.ceil(count / pageSize) };
    }

}


const reportService = new Service();
export default reportService;