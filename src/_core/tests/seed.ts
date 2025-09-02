import { agents } from "../database/drizzle/migrations/schema/agents.js";
import { farmers } from "../database/drizzle/migrations/schema/farmers.js";
import { inviteCodes } from "../database/drizzle/migrations/schema/inviteCodes.js";
import crypto from "crypto";
import { db } from "../database/index.js";
import { users } from "../database/drizzle/migrations/schema/users.js";
import { reports } from "../database/drizzle/migrations/schema/reports.js";

// Random helper for unique test data
function randomString(len = 8) {
    return crypto.randomBytes(len).toString("hex").slice(0, len);
}

export async function seedAdminUser(id = "admin1") {
    const adminUser = {
        id,
        email: `${id}@test.com`,
        role: "admin" as const,
        passwordHash: "$2b$10$CwTycUXWue0Thwj9ol0e5uJ8h2.PiF3c8h6jv7lYgKqg6ME8f6rG", // bcrypt for "password"
        createdAt: new Date(),
    };
    // Use onConflictDoNothing to avoid duplicate key errors if user already exists
    await db.insert(users).values(adminUser).onConflictDoNothing();
    return ({ id, email: `${id}@test.com`, role: "admin" as const });
}

export async function seedAgent(
    id = `agent-${randomString()}`, 
    teamName = "Test Team"
) {
    const userId = id; // For simplicity, userId same as agent id
    const agent = {
        id,
        userId,
        teamName,
        name: `Agent ${id}`,
        phone: "123456",
        createdAt: new Date(),
    }
    await db.insert(agents).values(agent)
    return ({ id, userId: id, teamName });
}

export async function seedFarmer(
    agentId: string, 
    userId = `farmer-${randomString()}`
) {
    const farmer = {
        id: userId,
        userId,
        agentId,
        name: `Farmer ${userId}`,
        phone: "123456",
        location: "TestVillage",
        createdAt: new Date(),
    }
    await db.insert(farmers).values(farmer);
    return farmer;
}

export async function seedInviteCode(
    role = "farmer", 
    teamName = "Test Team", 
    maxUses = 3
) {
    const invite = {
        id: `invite-${randomString()}`,
        code: `CODE-${randomString(4)}`,
        role,
        teamName,
        maxUses,
        uses: 0,
        active: true,
        expiresAt: null,
    };
    await db.insert(inviteCodes).values(invite);
    return invite;
}


export async function seedReports(number = 10) {
    const reportsData: Array<any> = [];

    for (let i = 0; i < number; i++) {
        reportsData.push({
            userId: `user-${i % 3}`, // 3 users
            type: i % 2 === 0 ? "disease" : "pest",
            status: i % 3 === 0 ? "open" : "resolved",
            createdAt: new Date(),
        });
    }
    await db.insert(reports).values(reportsData); 
    return reportsData;
}

export async function seedReportsAnalytics(number = 10) {
    const reportsData: Array<any> = [];

    for (let i = 0; i < number; i++) {
        reportsData.push({
            userId: `user-${i % 3}`, // 3 users
            type: i % 2 === 0 ? "disease" : "pest",
            status: i % 3 === 0 ? "open" : "resolved",
            createdAt: new Date(),
        });
    }
    await db.insert(reports).values(reportsData); 
    return reportsData;
}


export async function seedUser() {
    const appUser = {
        id: `user-${randomString()}`,
        email: `user-${randomString()}@test.com`,
        role: "farmer" as const,
        passwordHash: "$2b$10$CwTycUXWue0Thwj9ol0e5uJ8h2.PiF3c8h6jv7lYgKqg6ME8f6rG", // bcrypt for "password"
        createdAt: new Date(),
    }

    const [user] = await db.insert(users).values(appUser).returning();
    return user
} 

export async function clearAll() {
    await db.delete(farmers);
    await db.delete(agents);
    await db.delete(inviteCodes);
    await db.delete(reports);
    await db.delete(users);
}
