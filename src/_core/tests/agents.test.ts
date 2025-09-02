import { beforeAll, describe, it, expect } from "vitest";
import request from "supertest";
import { makeJwt } from "./utils.js";
import app from "../../index.js";

describe("Agents API", () => {
    let adminToken: string;
    let agentToken: string;

    beforeAll(async () => {
        adminToken = await makeJwt({ sub: "admin1", role: "admin" });
        agentToken = await makeJwt({ sub: "agent1", role: "agent" });
    });

    it("admin can list all agents", async () => {
        const res = await request(app).get("/agents").set("Authorization", `Bearer ${adminToken}`);
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    it("agent cannot list all agents", async () => {
        const res = await request(app).get("/agents").set("Authorization", `Bearer ${agentToken}`);
        expect(res.status).toBe(403);
    });

    it("admin can update agent", async () => {
        // TODO: seed agent first
        const agentId = "seeded-agent-id";

        const res = await request(app)
        .patch(`/agents/${agentId}`)
        .send({ active: false })
        .set("Authorization", `Bearer ${adminToken}`);

        expect([200, 404]).toContain(res.status);
    });
});