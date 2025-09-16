import { 
    and, 
    asc, 
    between, 
    count, 
    desc, 
    eq, 
    gte, 
    inArray, 
    isNull, 
    lte, 
    SQL, 
    sql 
} from "drizzle-orm";
import { z } from "zod";
import { reports } from "../../../database/drizzle/migrations/schema/reports.schema.js";
import { getSortQuery, parsePagination } from "../../../utils/req.utils.js";
import { io } from "../../../../index.js";
import type { IReportService } from "../../../common/interfaces/reports.interface.js";
import { injectable, singleton } from "tsyringe";
import { db } from "../../../database/index.database.js";



const DateRange = z.object({
    from: z.string().datetime(),
    to: z.string().datetime(),
});


@singleton()
@injectable()
export class ReportService implements IReportService {
    // async getReports(reqQuery: any) {
    //     // List reports with pagination, filtering, sorting
    //     const { page, pageSize, sort, status, type } = reqQuery;
    //     const { limit, offset } = parsePagination(reqQuery);
    //     const sortReports = getSortQuery(reqQuery, reports, reports.createdAt);

    //     // Base: not soft-deleted
    //     let where: SQL<unknown> | undefined = isNull(reports.deletedAt);

    //     if (status) where= and(where, eq(reports.status, status));
    //     if (type) where = and(where, eq(reports.type, type));


    //     const rows = await db.select()
    //     .from(farmers)
    //     .where(where)
    //     .orderBy(sortReports)
    //     .limit(limit)
    //     .offset(offset);

    //     const [{ count }] = await db.select({ 
    //         count: sql<number>`count(*)` 
    //     })
    //     .from(farmers);


    //     return({
    //         data: rows,
    //         pagination: {
    //             page,
    //             pageSize,
    //             total: Number(count),
    //         },
    //     });
    // }

    // async getFarmersPerAgentReport(query: any) {
    //     const { from, to } = DateRange.partial().parse(query);
    //     // Basic aggregate: farmers per agent within optional date range (assumes createdAt column)
    //     const where = and(
    //         isNull(farmers.deletedAt),
    //         from && to ? between(farmers.createdAt, new Date(from), new Date(to)) : sql`true`
    //     );

    //     const rows = await db.select({
    //         agentId: farmers.agentId,
    //         total: count(farmers.id).as("total"),
    //     })
    //     .from(farmers)
    //     .where(where)
    //     .groupBy(farmers.agentId);

    //     // Optionally join agent details
    //     const enriched = await Promise.all(
    //         rows.map(async (row) => {
    //             const agent = row.agentId
    //             ? await db.query.agents.findFirst({ 
    //                 where: (agent: Record<string, any>, { eq }: {eq: any}) => eq(agent.id, row.agentId) 
    //             }) : null;
    //             return { agentId: row.agentId, agentName: agent?.name ?? null, total: Number(row.total) };
    //         })
    //     );
    //     return enriched;
    // }

    public async getReport(id: string): Promise<any> {
        return {}
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

        // const data = await db
        //     .select()
        //     .from(reports)
        //     .where(whereClause)
            
        //     .orderBy(sortReports)
        //     .limit(pageSize)
        //     .offset(offset);

        const data = db.query.reports.findMany({
            where: whereClause,
            orderBy:sortReports,
            limit: pageSize,
            offset: offset,
            with: { owner: true },
        });

        const [{ count }] = await db.select({ count: sql<number>`count(*)` })
            .from(reports)
            .where(whereClause);

        return { 
            data, 
            page, 
            pageSize, 
            total: count, 
            totalPages: Math.ceil(count / pageSize) 
        };
    }


    // PATCH /reports/bulk
    // Body:
    // {
    // "reportIds": [1, 2, 3],
    // "action": "archive" | "restore" | "assign" | "update_status",
    // "payload": { "assignedTo": "agent_123", "status": "resolved" }
    // }
    // Response:
    // { "updatedCount": 3, "failed": [ ] }
    async bulkUpdateReports({ reportIds, action, payload }: {
        reportIds: Array<string>;
        action:  "archive" | "restore" | "assign" | "update_status"
        payload: { assignedTo: string, status: string }
    }) {

        return await db.transaction(async (tx) => {
            let result: Array<any>;

            switch (action) {
                case "archive":
                    result = await tx.update(reports)
                    .set({ status: "archived", updatedAt: new Date() })
                    .where(inArray(reports.id, reportIds))
                    .returning();
                    break;

                case "restore":
                    result = await tx.update(reports)
                    .set({ status: "active", updatedAt: new Date() })
                    .where(inArray(reports.id, reportIds))
                    .returning();
                    break;

                case "assign":
                    if (!payload?.assignedTo) throw new Error("Missing assignedTo");
                    result = await tx.update(reports)
                    .set({ assignedTo: payload.assignedTo, updatedAt: new Date() })
                    .where(inArray(reports.id, reportIds))
                    .returning();
                    break;

                case "update_status":
                    if (!payload?.status) throw new Error("Missing status");
                    result = await tx.update(reports)
                    .set({ status: payload.status, updatedAt: new Date() })
                    .where(inArray(reports.id, reportIds))
                    .returning();
                    break;

                default:
                    throw new Error("Invalid action");
            }
            return result;
        });
    }

    async bulkDeleteReports({ reportIds }: {
        reportIds: Array<string>
    }) {
        const result = await db
        .delete(reports)
        .where(inArray(reports.id, reportIds));

        return result.rowCount ?? 0;
    }

    async getExportReports({ status, assignedTo }: {
        status: string
        assignedTo: string
    }) {
        
        // let conditions: any[] = [];
        // if (status) conditions.push(eq(reports.status, status as string));
        // if (assignedTo) conditions.push(eq(reports.assignedTo, assignedTo as string));


        const rows = await db.query.reports.findMany({
            where: (report, { eq, and }) => {
                let conditions: any[] = [];
                if (status) conditions.push(eq(report.status, status as string));
                if (assignedTo) conditions.push(eq(report.assignedTo, assignedTo as string));

                return and(and(...conditions))
            },
            with: { owner: true },
        });
        // const rows = await db.select().from(reports).where(and(...conditions));
        return rows
    }

    async getReportWithShares(reportId: string) {
        const result = await db.query.reports.findFirst({
            where: (report, { eq }) => eq(report.id, reportId),
            with: {
                owner: true,
                shares: {
                    with: {
                        sharedWith: true,
                    },
                },
            },
        });

        return result;
    }

        // Create report
    async create(data: {
        title: string;
        description?: string;
        createdBy: string;
        status?: "draft" | "final" | "open" | "resolved" | "dismissed" | "archived";
    }) {
        const [report] = await db
        .insert(reports)
        .values(data)
        .returning();

        io.emit("dashboard:update", { entity: "report", action: "create", data: report });
        return report;
    }

    // Fetch a single report with owner + shares
    async getById(reportId: string) {
        return db.query.reports.findFirst({
            where: (r, { eq }) => eq(r.id, reportId),
            with: {
                owner: true,
                shares: {
                    with: {
                        sharedWith: true,
                    },
                },
            },
        });
    }


    // Update report
    async update(reportId: string, updates: Partial<typeof reports.$inferInsert>) {
        const [report] = await db
        .update(reports)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(reports.id, reportId))
        .returning();

        io.emit("dashboard:update", { entity: "report", action: "update", data: report });
        return report;
    }

    // Soft delete
    async softDelete(reportId: string) {
        const [report] = await db
        .update(reports)
        .set({ deleted: true, updatedAt: new Date() })
        .where(eq(reports.id, reportId))
        .returning();

        io.emit("dashboard:update", { entity: "report", action: "delete", data: report });
        return report;
    }

    // Restore
    async restore(reportId: string) {
        const [report] = await db
        .update(reports)
        .set({ deleted: false, updatedAt: new Date() })
        .where(eq(reports.id, reportId))
        .returning();
        return report;
    }
}