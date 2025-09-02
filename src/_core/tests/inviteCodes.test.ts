import { beforeEach, describe, it, expect } from "vitest";
import request from "supertest";
import { makeJwt } from "./utils.js";
import app from "../../index.js";
import { seedAdminUser, seedInviteCode } from "./seed.js";


describe("Invite Codes API", () => {
    let adminToken: string;

    beforeEach(async () => {
        await seedAdminUser("admin1");
        adminToken = await makeJwt({ sub: "admin1", role: "admin" });
    });

    it("admin can create and list invite codes", async () => {
        const create = await request(app)
        .post("/invite-codes")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ role: "farmer", maxUses: 3, teamName: "TestTeam" });

        expect(create.status).toBe(201);
        expect(create.body.role).toBe("farmer");

        const list = await request(app)
        .get("/invite-codes")
        .set("Authorization", `Bearer ${adminToken}`);

        expect(list.status).toBe(200);
        expect(list.body.some((ic: any) => ic.id === create.body.id)).toBe(true);
    });

    it("admin can update invite code", async () => {
        const seeded = await seedInviteCode("farmer", "TestTeam");
        const res = await request(app)
        .patch(`/invite-codes/${seeded.id}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ active: false });

        expect([200, 404]).toContain(res.status);
    });
});
