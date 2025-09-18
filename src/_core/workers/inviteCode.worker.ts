import { Client } from "pg";
import { z } from "zod";
import { sendSlackNotification } from "../notificationProviders/slack.js";
import { sendEmailNotification } from "../notificationProviders/email.js";
import { startHealthServer } from "./healthServer.js";
import { db } from "../database/index.js"; //your Drizzle instance
import { notificationDeadLetters } from "../database/drizzle/migrations/schema/notificationDeadLetters.js";

// ---- Config ----
const DATABASE_URL = process.env.DATABASE_URL;
const CHANNEL = "invite_code_events";
const APPLICATION_LOCK_KEY = 23_451_987;
const MIN_RETRY = 500;
const MAX_RETRY = 30_000;
const MAX_DISPATCH_RETRIES = 5;
const DISPATCH_INITIAL_DELAY = 1000;

// ---- Logging ----
const log = {
    info: (msg: string, meta?: any) => console.log(JSON.stringify({ level: "info", msg, ...meta })),
    warn: (msg: string, meta?: any) => console.warn(JSON.stringify({ level: "warn", msg, ...meta })),
    error: (msg: string, meta?: any) => console.error(JSON.stringify({ level: "error", msg, ...meta })),
};

// ---- Types ----
const InviteCodeExhausted = z.object({
    event: z.literal("invite_code_exhausted"),
    invite_id: z.union([z.number().int(), z.string()]),
    code: z.string(),
    team_name: z.string().nullable().optional(),
    role: z.string(),
    max_uses: z.number().int(),
});

type InviteCodeExhausted = z.infer<typeof InviteCodeExhausted>;

// ---- Dead Letter ----
async function deadLetter(payload: unknown, reason: string) {
    log.error("Dead-lettering payload", { reason, payload });
    await db.insert(notificationDeadLetters).values({
        channel: CHANNEL as any,
        payload: payload as any,
        reason: reason as any,
        createdAt: new Date(),
    });
}

// ---- Notification Dispatch ----
async function dispatchInviteCodeExhausted(p: InviteCodeExhausted, attempt: number): Promise<void> {
    const text = `🚨 Invite code exhausted: ${p.code} (role=${p.role}, max=${p.max_uses})`;

    await Promise.allSettled([
        sendSlackNotification(text),
        sendEmailNotification("Invite Code Exhausted", text),
    ]);
}

// ---- Retry helpers ----
function sleep(ms: number) {
    return new Promise((res) => setTimeout(res, ms));
}

function backoffDelay(base: number, factor: number, cap: number, attempt: number) {
    const exp = Math.min(cap, base * Math.pow(factor, attempt));
    const jitter = Math.random() * 0.25 * exp;
    return Math.floor(exp + jitter);
}

async function withRetries<T>(
    fn: (attempt: number) => Promise<T>,
    maxAttempts: number,
    baseDelay: number,
): Promise<T> {
    let lastErr: any;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        try {
            return await fn(attempt + 1);
        } catch (err) {
            lastErr = err;
            const delay = backoffDelay(baseDelay, 2, MAX_RETRY, attempt);
            log.warn("Dispatch failed; retrying", { attempt: attempt + 1, delay });
            await sleep(delay);
        }
    }
    throw lastErr;
}

// ---- Advisory Lock ----
async function tryAcquireLock(client: Client): Promise<boolean> {
    const { rows } = await client.query<{ pg_try_advisory_lock: boolean }>(
        "SELECT pg_try_advisory_lock($1) AS pg_try_advisory_lock",
        [APPLICATION_LOCK_KEY],
    );
    return rows[0]?.pg_try_advisory_lock ?? false;
}

async function releaseLock(client: Client) {
    try {
        await client.query("SELECT pg_advisory_unlock($1)", [APPLICATION_LOCK_KEY]);
    } catch {}
}

// ---- Listener ----
class InviteCodeListener {
    private client: Client | null = null;
    private stopping = false;

    async start() {
        log.info("Starting InviteCodeListener");
        await this.connectWithRetry();
        startHealthServer(); // HTTP health endpoint
        this.setupProcessSignals();
    }

    private async connectWithRetry() {
        let attempt = 0;
        while (!this.stopping) {
            try {
                const client = new Client({ connectionString: DATABASE_URL });
                await client.connect();
                await client.query(`SET application_name = 'open-farm.invite-code-listener'`);
                const locked = await tryAcquireLock(client);
                if (!locked) {
                    log.warn("Another instance holds the advisory lock; retrying...");
                    await client.end();
                    throw new Error("Advisory lock not acquired");
                }

                await client.query(`LISTEN ${CHANNEL}`);
                client.on("notification", (msg) => this.onNotification(msg));
                client.on("error", (err) => this.onClientError(err));
                client.on("end", () => this.onClientEnd());

                this.client = client;
                log.info("Connected to Postgres and listening", { channel: CHANNEL });
                return;
            } catch (err) {
                attempt++;
                const delay = backoffDelay(MIN_RETRY, 2, MAX_RETRY, attempt);
                log.error("Connection attempt failed", { attempt, delay, error: String(err) });
                await sleep(delay);
            }
        }
    }

    private async onNotification(msg: { channel: string; payload?: string }) {
        if (msg.channel !== CHANNEL) return;
        let parsed: unknown;
        try {
            parsed = JSON.parse(msg.payload ?? "{}");
        } catch {
            return deadLetter(msg.payload, "Invalid JSON");
        }

        const parsedResult = InviteCodeExhausted.safeParse(parsed);
        if (!parsedResult.success) {
            return deadLetter(parsed, "Unsupported event schema");
        }

        const event = parsedResult.data;
        try {
            await withRetries(
                (attempt) => dispatchInviteCodeExhausted(event, attempt),
                MAX_DISPATCH_RETRIES,
                DISPATCH_INITIAL_DELAY,
            );
        } catch (err) {
            await deadLetter(event, `Dispatch failed after retries: ${String(err)}`);
        }
    }

    private async onClientError(err: any) {
        log.error("pg client error", { error: String(err) });
    }

    private async onClientEnd() {
        log.warn("pg client ended");
        if (!this.stopping) {
            await this.reconnect();
        }
    }

    private async reconnect() {
        log.info("Reconnecting...");
        await this.cleanupClient();
        await this.connectWithRetry();
    }

    private async cleanupClient() {
        const c = this.client;
        this.client = null;
        if (!c) return;
        try {
            await releaseLock(c);
        } catch {}
        try {
            await c.end();
        } catch {}
    }

    private setupProcessSignals() {
        const shutdown = async (sig: string) => {
            if (this.stopping) return;
            this.stopping = true;
            log.info(`Received ${sig}; shutting down...`);
            try {
                await this.cleanupClient();
            } finally {
                process.exit(0);
            }
        }

        process.on("SIGINT", () => shutdown("SIGINT"));
        process.on("SIGTERM", () => shutdown("SIGTERM"));
    }
}

// ---- Entrypoint ----
if (!DATABASE_URL) {
    log.error("DATABASE_URL not set");
    process.exit(1);
}

new InviteCodeListener().start().catch((err) => {
    log.error("Fatal start error", { error: String(err) });
    process.exit(1);
});
