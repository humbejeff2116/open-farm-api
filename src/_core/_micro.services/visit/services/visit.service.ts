import { eq } from "drizzle-orm";
import { db } from "../../../database/index.js";
import { visits } from "../../../database/drizzle/migrations/schema/index.js";

class Service {
    async registerVisit(data: any) {
        // Logic to register a visit
        const [visit] = await db.insert(visits).values(data).returning();

        return { success: true, data: visit };
    }

    async getVisitsByFarmerId(farmerId: string) {
        const farmerVisits = await db.select().from(visits).where(eq(visits.farmerId, farmerId));
        return farmerVisits;
    }

    async getAllVisits() {
        const allVisits = await db.select().from(visits);
        return allVisits;
    }
}

const visitService = new Service();
export default visitService;