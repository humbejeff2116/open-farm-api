import { sql } from "drizzle-orm";
import { db } from "../../../../database/index.js";
import { reports } from "../../../../database/drizzle/migrations/schema/reports.js";


class Service {
    async getReportAnalytics() {
        const byType = await db.select({ 
            type: reports.type, 
            count: sql<number>`COUNT(${reports.id})`, 
        })
        .from(reports)
        .groupBy(reports.type);

        const byStatus = await db.select({ 
            status: reports.status, 
            count: sql<number>`COUNT(${reports.id})`, 
        })
        .from(reports)
        .groupBy(reports.status);

        const trends = await db.select({
            week: sql<string>`TO_CHAR(DATE_TRUNC('week', ${reports.createdAt}), 'YYYY-MM-DD')`,
            count: sql<number>`COUNT(${reports.id})`,
        })
        .from(reports)
        .groupBy(sql`DATE_TRUNC('week', ${reports.createdAt})`)
        .orderBy(sql`DATE_TRUNC('week', ${reports.createdAt})`);

        return { byType, byStatus, trends };
    }
}


const reportAnalyticsService = new Service();
export default reportAnalyticsService;
