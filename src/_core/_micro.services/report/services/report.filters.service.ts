import { and, eq } from "drizzle-orm";
import { reportFilterPresets } from "../../../database/drizzle/migrations/schema/reports.schema.js";
import { db } from "../../../database/index.database.js";

class ReportsFilterService {


    async savePreset(userId: string, name: string, filters: any) {
        // Check if preset with same name exists for user
        const existing = await db.select()
        .from(reportFilterPresets)
        .where(and(
            eq(reportFilterPresets.userId, userId),
            eq(reportFilterPresets.name, name)
        ));
        if (existing.length > 0) {
            return ({
                data: null,
                message: "Preset with this name already exists"
            })
            // throw new Error("Preset with this name already exists");
        }


        const [preset] = await db.insert(reportFilterPresets)
        .values({
            userId,
            name,
            filters,
        }).returning();

        return ({
            data: preset,
            message: "Preset saved succesfully"
        });
    }

    async listPresets(userId: string) {
        // if (userId) {
        //     const filters = await this.listPresets(userId);
        //     return filters;
        // }
        const filters = await db.select()
        .from(reportFilterPresets);
        return filters;
    }

    async listUserPresets(userId: string) {
        const [filter] = await db.select()
        .from(reportFilterPresets)
        .where(eq(reportFilterPresets.userId, userId));

        return filter;
    }

    async deletePreset(userId: string, presetId: string) {
        const result = await db.delete(reportFilterPresets)
        .where(and(
            eq(reportFilterPresets.id, presetId),
            eq(reportFilterPresets.userId, userId)
        ))
        .returning();
        return result[0] || null;
    }
}

const reportsFilterService = new ReportsFilterService();
export default reportsFilterService;