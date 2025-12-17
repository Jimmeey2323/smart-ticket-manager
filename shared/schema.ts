import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  varchar,
  boolean,
  integer,
  timestamp,
  jsonb,
  index,
  real,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);

// Users table with role-based access
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role", { length: 50 }).default("staff"),
  teamId: varchar("team_id"),
  studioId: varchar("studio_id"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Teams table
export const teams = pgTable("teams", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  teamLeadId: varchar("team_lead_id"),
  email: varchar("email"),
  escalationEmail: varchar("escalation_email"),
  slaHours: integer("sla_hours").default(24),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Studios table
export const studios = pgTable("studios", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  code: varchar("code"),
  address: text("address"),
  phone: varchar("phone"),
  email: varchar("email"),
  managerUserId: varchar("manager_user_id"),
  timeZone: varchar("time_zone"),
  operatingHours: text("operating_hours"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Categories table
export const categories = pgTable("categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  icon: varchar("icon"),
  defaultTeamId: varchar("default_team_id"),
  defaultPriority: varchar("default_priority").default("medium"),
  defaultSlaHours: integer("default_sla_hours").default(24),
  isActive: boolean("is_active").default(true),
  sortOrder: integer("sort_order").default(0),
});

// Subcategories table
export const subcategories = pgTable("subcategories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  categoryId: varchar("category_id").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  requiredFields: jsonb("required_fields"),
  defaultTeamId: varchar("default_team_id"),
  defaultPriority: varchar("default_priority"),
  slaHours: integer("sla_hours"),
  resolutionTemplate: text("resolution_template"),
  isActive: boolean("is_active").default(true),
  sortOrder: integer("sort_order").default(0),
});

// Tickets table - core entity
export const tickets = pgTable("tickets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ticketNumber: varchar("ticketNumber", { length: 50 }).unique(),
  studioId: varchar("studioId").notNull(),
  categoryId: varchar("categoryId"),
  subcategoryId: varchar("subcategoryId"),
  priority: varchar("priority", { length: 50 }).default("medium"),
  status: varchar("status", { length: 50 }).default("new"),
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description"),
  customerName: varchar("customerName", { length: 255 }),
  customerEmail: varchar("customerEmail"),
  customerPhone: varchar("customerPhone"),
  customerMembershipId: varchar("customerMembershipId"),
  customerStatus: varchar("customerStatus"),
  clientMood: varchar("clientMood"),
  assignedToUserId: varchar("assignedToUserId"),
  assignedTeamId: varchar("assignedTeamId"),
  assignedDepartmentId: varchar("assignedDepartmentId"),
  reportedByUserId: varchar("reportedByUserId"),
  source: varchar("source", { length: 100 }),
  severity: varchar("severity", { length: 50 }),
  tags: text("tags").array(),
  estimatedResolutionTime: timestamp("estimatedResolutionTime"),
  actualResolutionTime: timestamp("actualResolutionTime"),
  slaBreached: boolean("slaBreached").default(false),
  slaDueAt: timestamp("slaDueAt"),
  incidentDateTime: timestamp("incidentDateTime"),
  firstResponseAt: timestamp("firstResponseAt"),
  escalatedAt: timestamp("escalatedAt"),
  resolvedAt: timestamp("resolvedAt"),
  closedAt: timestamp("closedAt"),
  reopenedAt: timestamp("reopenedAt"),
  lastActivityAt: timestamp("lastActivityAt"),
  dynamicFieldData: jsonb("dynamicFieldData"),
  satisfactionRating: integer("satisfactionRating"),
  resolutionSummary: text("resolutionSummary"),
  internalNotes: text("internalNotes"),
  isInternalTicket: boolean("isInternalTicket").default(false),
  parentTicketId: varchar("parentTicketId"),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
}, (table) => [
  index("idx_tickets_status").on(table.status),
  index("idx_tickets_priority").on(table.priority),
  index("idx_tickets_category").on(table.categoryId),
  index("idx_tickets_studio").on(table.studioId),
]);

// Ticket comments
export const ticketComments = pgTable("ticketComments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ticketId: varchar("ticketId").notNull(),
  userId: varchar("userId").notNull(),
  content: text("content").notNull(),
  commentType: varchar("commentType").default("comment"),
  isInternal: boolean("isInternal").default(false),
  isResolution: boolean("isResolution").default(false),
  timeSpentMinutes: integer("timeSpentMinutes"),
  attachments: jsonb("attachments"),
  mentionedUserIds: text("mentionedUserIds").array(),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

// Ticket attachments
export const ticketAttachments = pgTable("ticketAttachments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ticketId: varchar("ticketId").notNull(),
  commentId: varchar("commentId"),
  fileName: varchar("fileName", { length: 255 }).notNull(),
  originalFileName: varchar("originalFileName", { length: 255 }).notNull(),
  filePath: text("filePath").notNull(),
  fileSize: integer("fileSize"),
  mimeType: varchar("mimeType"),
  uploadedByUserId: varchar("uploadedByUserId"),
  isPublic: boolean("isPublic").default(false),
  createdAt: timestamp("createdAt").defaultNow(),
});

// Ticket history for audit trail
export const ticketHistory = pgTable("ticketHistory", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ticketId: varchar("ticketId").notNull(),
  changedByUserId: varchar("changedByUserId"),
  action: varchar("action", { length: 100 }).notNull(),
  fieldChanged: varchar("fieldChanged", { length: 100 }),
  oldValue: jsonb("oldValue"),
  newValue: jsonb("newValue"),
  changeReason: text("changeReason"),
  automatedChange: boolean("automatedChange").default(false),
  ipAddress: varchar("ipAddress"),
  userAgent: text("userAgent"),
  createdAt: timestamp("createdAt").defaultNow(),
});

// Notifications
export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  ticketId: varchar("ticket_id"),
  type: varchar("type", { length: 50 }),
  title: varchar("title", { length: 255 }),
  message: text("message"),
  isRead: boolean("is_read").default(false),
  sentViaEmail: boolean("sent_via_email").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ one }) => ({
  team: one(teams, {
    fields: [users.teamId],
    references: [teams.id],
  }),
  studio: one(studios, {
    fields: [users.studioId],
    references: [studios.id],
  }),
}));

export const ticketsRelations = relations(tickets, ({ one, many }) => ({
  studio: one(studios, {
    fields: [tickets.studioId],
    references: [studios.id],
  }),
  reportedBy: one(users, {
    fields: [tickets.reportedByUserId],
    references: [users.id],
    relationName: "reportedBy",
  }),
  assignedTo: one(users, {
    fields: [tickets.assignedToUserId],
    references: [users.id],
    relationName: "assignedTo",
  }),
  assignedTeam: one(teams, {
    fields: [tickets.assignedTeamId],
    references: [teams.id],
  }),
  comments: many(ticketComments),
  attachments: many(ticketAttachments),
  history: many(ticketHistory),
}));

export const ticketCommentsRelations = relations(ticketComments, ({ one }) => ({
  ticket: one(tickets, {
    fields: [ticketComments.ticketId],
    references: [tickets.id],
  }),
  user: one(users, {
    fields: [ticketComments.userId],
    references: [users.id],
  }),
}));

export const subcategoriesRelations = relations(subcategories, ({ one }) => ({
  category: one(categories, {
    fields: [subcategories.categoryId],
    references: [categories.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, updatedAt: true });
export const insertTeamSchema = createInsertSchema(teams).omit({ id: true, createdAt: true });
export const insertStudioSchema = createInsertSchema(studios).omit({ id: true, createdAt: true });
export const insertCategorySchema = createInsertSchema(categories).omit({ id: true });
export const insertSubcategorySchema = createInsertSchema(subcategories).omit({ id: true });
export const insertTicketSchema = createInsertSchema(tickets).omit({ id: true, ticketNumber: true, createdAt: true, updatedAt: true });
export const insertTicketCommentSchema = createInsertSchema(ticketComments).omit({ id: true, createdAt: true });
export const insertTicketAttachmentSchema = createInsertSchema(ticketAttachments).omit({ id: true, createdAt: true });
export const insertNotificationSchema = createInsertSchema(notifications).omit({ id: true, createdAt: true });

// Update/patch schemas (all fields optional, excluding immutable fields)
export const updateTicketSchema = insertTicketSchema
  .omit({ reportedByUserId: true })
  .partial();
export const updateTeamSchema = insertTeamSchema.partial();
export const updateStudioSchema = insertStudioSchema.partial();

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Team = typeof teams.$inferSelect;
export type InsertTeam = z.infer<typeof insertTeamSchema>;

export type Studio = typeof studios.$inferSelect;
export type InsertStudio = z.infer<typeof insertStudioSchema>;

export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

export type Subcategory = typeof subcategories.$inferSelect;
export type InsertSubcategory = z.infer<typeof insertSubcategorySchema>;

export type Ticket = typeof tickets.$inferSelect;
export type InsertTicket = z.infer<typeof insertTicketSchema>;

export type TicketComment = typeof ticketComments.$inferSelect;
export type InsertTicketComment = z.infer<typeof insertTicketCommentSchema>;

export type TicketAttachment = typeof ticketAttachments.$inferSelect;
export type InsertTicketAttachment = z.infer<typeof insertTicketAttachmentSchema>;

export type TicketHistory = typeof ticketHistory.$inferSelect;

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

// Enums/constants for the application
export const PRIORITIES = ["low", "medium", "high", "critical"] as const;
export const STATUSES = ["new", "assigned", "in_progress", "pending_customer", "resolved", "closed", "reopened"] as const;
export const ROLES = ["admin", "manager", "team_lead", "staff", "viewer"] as const;
export const CLIENT_MOODS = ["calm", "frustrated", "angry", "disappointed", "understanding"] as const;
export const CLIENT_STATUSES = ["existing_active", "existing_inactive", "new_prospect", "trial_client", "guest"] as const;
export const DEPARTMENTS = ["Operations", "Facilities", "Training", "Sales", "Client Success", "Marketing", "Finance", "Management", "IT/Tech Support", "HR", "Security"] as const;

export type Priority = typeof PRIORITIES[number];
export type Status = typeof STATUSES[number];
export type Role = typeof ROLES[number];
export type ClientMood = typeof CLIENT_MOODS[number];
