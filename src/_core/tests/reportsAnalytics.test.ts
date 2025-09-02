import { beforeAll, describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { makeJwt } from "./utils.js";
import app from "../../index.js";
import { seedReportsAnalytics } from "./seed.js";




describe("reportAnalyticsService", () => {
        let adminToken: string;
        let analytics: any;
    
        beforeAll(async () => {
            await seedReportsAnalytics(); // seed 20 reports
            adminToken = await makeJwt({ sub: "admin1", role: "admin" });
            analytics = await request(app)
            .get("/reports/analytics")
            .set("Authorization", `Bearer ${adminToken}`);
        });


    it("groups reports by type", async () => {
        const disease = analytics.byType.find((d: any) => d.type === "disease");
        expect(disease?.count).toBe(2);
    });

    it("groups reports by status", async () => {
        const open = analytics.byStatus.find((s: any) => s.status === "open");
        expect(open?.count).toBe(2);
    });

    it("aggregates reports by week", async () => {
        expect(analytics.trends.length).toBeGreaterThan(0);
    });

    // api route test
    it("returns grouped analytics JSON", async () => {
        const res = await request(app)
        .get("/api/reports/analytics")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

        expect(res.body.byType).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ type: "disease", count: 2 }),
                expect.objectContaining({ type: "soil", count: 1 }),
            ])
        )

        expect(res.body.byStatus).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ status: "open", count: 2 }),
                expect.objectContaining({ status: "resolved", count: 1 }),
            ])
        )

        expect(Array.isArray(res.body.trends)).toBe(true);
    })
})