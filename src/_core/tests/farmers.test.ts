import { beforeEach, describe, it, expect } from "vitest";
import request from "supertest";
import app from "../../index.js";
import { makeJwt } from "./utils.js";
import { seedAdminUser, seedAgent, seedFarmer } from "./seed.js";

describe("Farmers API", () => {
    let adminToken: string;
    let agentToken: string;
    let farmerToken: string;
    let agent: any;
    let farmer: any;

    beforeEach(async () => {
        // Seed admin + agent + farmer
        await seedAdminUser("admin1");
        agent = await seedAgent("agent1");
        farmer = await seedFarmer(agent.id, "farmer1");

        adminToken = await makeJwt({ sub: "admin1", role: "admin" });
        agentToken = await makeJwt({ sub: "agent1", role: "agent" });
        farmerToken = await makeJwt({ sub: "farmer1", role: "farmer" });
    });

    it("admin can list all farmers", async () => {
        const res = await request(app).get("/farmers").set("Authorization", `Bearer ${adminToken}`);
        expect(res.status).toBe(200);
        expect(res.body.length).toBeGreaterThanOrEqual(1);
    });

    it("farmer sees only self", async () => {
        const res = await request(app).get("/farmers").set("Authorization", `Bearer ${farmerToken}`);
        expect(res.status).toBe(200);
        expect(res.body.every((f: any) => f.userId === "farmer1")).toBe(true);
    });

    it("agent can update their farmer", async () => {
        const res = await request(app)
        .patch(`/farmers/${farmer.id}`)
        .send({ name: "Updated Name" })
        .set("Authorization", `Bearer ${agentToken}`);

        expect(res.status).toBe(200);
        expect(res.body.name).toBe("Updated Name");
    });
});
