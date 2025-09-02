import { beforeAll, describe, it, expect } from "vitest";
import request from "supertest";
import { makeJwt } from "./utils.js";
import app from "../../index.js";
import { seedReports } from "./seed.js";
import { db } from "../database/index.js";
import { reportFilterPresets } from "../database/drizzle/migrations/schema/reports.js";


describe("Reports API", () => {
    let adminToken: string;
    let agentToken: string;

    beforeAll(async () => {
        adminToken = await makeJwt({ sub: "admin1", role: "admin" });
        agentToken = await makeJwt({ sub: "agent1", role: "agent" });
    });

    it("admin can fetch reports", async () => {
        const res = await request(app)
        .get("/reports")
        .set("Authorization", `Bearer ${adminToken}`);

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    it("non-admin cannot fetch farmer reports", async () => {
        const res = await request(app)
        .get("/reports")
        .set("Authorization", `Bearer ${agentToken}`);

        expect(res.status).toBe(403);
    });
});


// beforeAll(async () => {
//   await clearDb();
//   await seedReports(); // insert a few reports into db
// });

// afterAll(async () => {
//   await clearDb();
// });

describe("Reports API Integration", () => {
    let adminToken: string;

    beforeAll(async () => {
        await seedReports(); // seed 20 reports
        adminToken = await makeJwt({ sub: "admin1", role: "admin" });
    });


    describe("GET /api/reports/analytics", () => {
        it("should return report analytics grouped by type and status", async () => {
            const res = await request(app).get("/api/reports/analytics");
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("byType");
            expect(res.body).toHaveProperty("byStatus");
            expect(res.body).toHaveProperty("trends");
            expect(Array.isArray(res.body.byType)).toBe(true);
            expect(Array.isArray(res.body.byStatus)).toBe(true);
            expect(Array.isArray(res.body.trends)).toBe(true);
        });
    });

    describe("Report Filters", () => {
            it("should create a new filter preset", async () => {
                const res = await request(app)
                .post("/api/report-filters")
                .set("Authorization", `Bearer ${adminToken}`)
                .send({ name: "Open Reports", filters: { status: "open" } });

                expect(res.status).toBe(201);
                expect(res.body).toHaveProperty("id");
                expect(res.body.name).toBe("Open Reports");
            });

            it("should reject filter preset with missing fields", async () => {
                const res = await request(app)
                .post("/api/report-filters")
                .set("Authorization", `Bearer ${adminToken}`)
                .send({ name: "" });
                
                expect(res.status).toBe(400);
                expect(res.body).toHaveProperty("error");
            });

            it("should list filter presets", async () => {
                const res = await request(app)
                .get("/api/report-filters")
                .set("Authorization", `Bearer ${adminToken}`);

                expect(res.status).toBe(200);
                expect(Array.isArray(res.body)).toBe(true);
                expect(res.body.length).toBeGreaterThan(0);
            });

            it("should return 204 when deleting valid preset", async () => {
                const [preset] = await db.select().from(reportFilterPresets).limit(1);
                const res = await request(app)
                .delete(`/api/report-filters/${preset.id}`)
                .set("Authorization", `Bearer ${adminToken}`);

                expect(res.status).toBe(204);
            });

            it("should return 500 when deleting non-existent preset", async () => {
                const res = await request(app)
                .delete(`/api/report-filters/00000000-0000-0000-0000-000000000000`)
                .set("Authorization", `Bearer ${adminToken}`);

                expect([404, 500]).toContain(res.status); // depending on how your handler responds
            });

            it("should delete a filter preset", async () => {
                const [preset] = await db.select().from(reportFilterPresets).limit(1);
                const res = await request(app)
                .delete(`/api/report-filters/${preset.id}`)
                .set("Authorization", `Bearer ${adminToken}`);

                expect(res.status).toBe(204);
            });
    });

    describe("Reports Listing", () => {
        it("should return paginated reports", async () => {
            const res = await request(app)
            .get("/api/reports?page=1&pageSize=5")
            .set("Authorization", `Bearer ${adminToken}`);

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("data");
            expect(res.body).toHaveProperty("pagination");
            expect(Array.isArray(res.body.data)).toBe(true);
            expect(res.body.pagination).toHaveProperty("total");
        });

        it("should return empty data when no reports match filter", async () => {
            const res = await request(app)
            .get("/api/reports?status=nonexistent")
            .set("Authorization", `Bearer ${adminToken}`);

            expect(res.status).toBe(200);
            expect(res.body.data).toEqual([]);
            expect(res.body.pagination.total).toBe(0);
        });

        it("should reject invalid page/pageSize query params", async () => {
            const res = await request(app)
            .get("/api/reports?page=-1&pageSize=0")
            .set("Authorization", `Bearer ${adminToken}`);

            expect([400, 422]).toContain(res.status); // depending on validation strategy
        });

        it("should reject invalid sort query param", async () => {
            const res = await request(app)
            .get("/api/reports?sort=badfield:asc")
            .set("Authorization", `Bearer ${adminToken}`);

            expect([400, 422]).toContain(res.status);
        });

        it("should return filtered reports by status", async () => {
            const res = await request(app)
            .get("/api/reports?status=open&page=1&pageSize=5")
            .set("Authorization", `Bearer ${adminToken}`);

            expect(res.status).toBe(200);
            expect(res.body.data.every((r: any) => r.status === "open")).toBe(true);
        });

        it("should return sorted reports", async () => {
            const res = await request(app)
            .get("/api/reports?page=1&pageSize=5&sort=createdAt:desc")
            .set("Authorization", `Bearer ${adminToken}`);

            expect(res.status).toBe(200);
            const data = res.body.data;
            if (data.length >= 2) {
                const first = new Date(data[0].createdAt).getTime();
                const second = new Date(data[1].createdAt).getTime();
                expect(first).toBeGreaterThanOrEqual(second);
            }
        })
    })
})

