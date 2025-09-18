import { 
    pgTable, 
    uuid, 
    timestamp, 
    boolean, 
    varchar,
    text,
    jsonb,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { profiles, userRoleEnum } from "./profiles.schema.js";




export const reports = pgTable("reports", {
    id: uuid("id").defaultRandom().primaryKey(),
    title: varchar("title", { length: 255 }).notNull(),
    description: varchar("description", { length: 1000 }).notNull(),
    status: varchar("status", { length: 50 }).notNull(), // e.g., "open", "resolved", "dismissed"
    reporterRole: userRoleEnum("reporter_role").notNull(), // "farmer", "agent", "admin"
    reporterId: uuid("reporter_id").notNull(), // references either farmers or agents   
    type: varchar("type", { length: 100 }), // e.g., "pest", "weather", "other"
    tags: varchar("tags", { length: 255 }), // comma-separated tags
    assignedTo: uuid("assigned_to").references(() => profiles.id),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    deleted: boolean("deleted").default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    // updatedAt: timestamp("updated_at", { withTimezone: true }),
    closedAt: timestamp("closed_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),

    attachments: jsonb("attachments").default([]),
    // comments: jsonb("comments").default([]),
});

export const reportsComments = pgTable("reports_comments", {
    id: uuid("id").defaultRandom().primaryKey(),
    reportId: uuid("report_id").references(() => reports.id),
    commentMadeBy: uuid("comment_made_by").references(() => profiles.id), 
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
    deleted: boolean("deleted").default(false),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    comment: jsonb("comment").default({}), // e.g. { text: "disease" }
});

export const reportsCommentsReplies = pgTable("reports_comments_replies", {
    id: uuid("id").defaultRandom().primaryKey(),
    commentId: uuid("comment_id").references(() => reportsComments.id),
    replyMadeBy: uuid("reply_made_by").references(() => profiles.id),
    replyTo: uuid("reply_to").references(() => profiles.id), 
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
    deleted: boolean("deleted").default(false),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    reply: jsonb("comment").default({}), // e.g. { text: "disease" }
});

export const reportFilterPresets = pgTable("report_filter_presets", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").notNull().references(() => profiles.id),
    name: text("name").notNull(),
    filters: jsonb("filters").notNull(), // e.g. { status: "open", type: "disease" }
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

export const reportShares = pgTable("report_shares", {
    id: uuid("id").defaultRandom().primaryKey(),
    reportId: uuid("report_id")
    .references(() => reports.id, { onDelete: "cascade" })
    .notNull(),
    sharedWithUserId: uuid("shared_with_user_id")
    .references(() => profiles.id, { onDelete: "cascade" }), // null if external
    permissions: text("permissions").$type<"view" | "edit">().default("view").notNull(),
    token: uuid("token").defaultRandom(), // for external links
    revoked: boolean("revoked").default(false),
    expiresAt: timestamp("expires_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const reportsRelations = relations(reports, ({ one, many }) => ({
    owner: one(profiles, {
        fields: [reports.reporterId],
        references: [profiles.id],
    }),
    shares: many(reportShares),
}));

export const reportSharesRelations = relations(reportShares, ({ one }) => ({
    report: one(reports, {
        fields: [reportShares.reportId],
        references: [reports.id],
    }),
    sharedWith: one(profiles, {
        fields: [reportShares.sharedWithUserId],
        references: [profiles.id],
    }),
}));