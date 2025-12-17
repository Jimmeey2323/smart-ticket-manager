-- Comprehensive Supabase Database Schema for Enterprise-Grade Ticket Management System
-- This script creates all tables, relationships, and sample data for the Physique 57 India ticket system
-- Execute this SQL in your Supabase SQL Editor

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For better text search performance

-- ============================================================================
-- DROP EXISTING TABLES (Clean Slate)
-- ============================================================================
-- Drop in correct order to handle foreign key dependencies

DROP TABLE IF EXISTS "customerFeedback" CASCADE;
DROP TABLE IF EXISTS "sessions" CASCADE;
DROP TABLE IF EXISTS "businessHours" CASCADE;
DROP TABLE IF EXISTS "workflowRules" CASCADE;
DROP TABLE IF EXISTS "slaRules" CASCADE;
DROP TABLE IF EXISTS "notifications" CASCADE;
DROP TABLE IF EXISTS "ticketWatchers" CASCADE;
DROP TABLE IF EXISTS "ticketHistory" CASCADE;
DROP TABLE IF EXISTS "ticketAttachments" CASCADE;
DROP TABLE IF EXISTS "ticketComments" CASCADE;
DROP TABLE IF EXISTS "tickets" CASCADE;
DROP TABLE IF EXISTS "userStudioAccess" CASCADE;
DROP TABLE IF EXISTS "users" CASCADE;
DROP TABLE IF EXISTS "dynamicFields" CASCADE;
DROP TABLE IF EXISTS "fieldTypes" CASCADE;
DROP TABLE IF EXISTS "subcategories" CASCADE;
DROP TABLE IF EXISTS "categories" CASCADE;
DROP TABLE IF EXISTS "studios" CASCADE;
DROP TABLE IF EXISTS "teams" CASCADE;
DROP TABLE IF EXISTS "departments" CASCADE;

-- ============================================================================
-- CORE REFERENCE TABLES
-- ============================================================================

-- Departments table
CREATE TABLE IF NOT EXISTS "departments" (
    "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    "name" text NOT NULL UNIQUE,
    "description" text,
    "code" text UNIQUE NOT NULL,
    "managerEmail" text,
    "isActive" boolean DEFAULT true,
    "createdAt" timestamp DEFAULT now(),
    "updatedAt" timestamp DEFAULT now()
);

-- Teams table (updated with department relationship)
CREATE TABLE IF NOT EXISTS "teams" (
    "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    "name" text NOT NULL,
    "description" text,
    "departmentId" uuid REFERENCES "departments"("id"),
    "leadUserId" text,
    "isActive" boolean DEFAULT true,
    "createdAt" timestamp DEFAULT now(),
    "updatedAt" timestamp DEFAULT now()
);

-- Studios/Locations table (enhanced)
CREATE TABLE IF NOT EXISTS "studios" (
    "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    "name" text NOT NULL,
    "code" text UNIQUE NOT NULL,
    "address" jsonb, -- Store full address with components
    "phone" text,
    "email" text,
    "managerUserId" text,
    "timeZone" text DEFAULT 'Asia/Kolkata',
    "operatingHours" jsonb,
    "isActive" boolean DEFAULT true,
    "createdAt" timestamp DEFAULT now(),
    "updatedAt" timestamp DEFAULT now()
);

-- Categories table (main categories)
CREATE TABLE IF NOT EXISTS "categories" (
    "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    "name" text NOT NULL UNIQUE,
    "description" text,
    "code" text UNIQUE NOT NULL,
    "defaultPriority" text DEFAULT 'medium',
    "defaultDepartmentId" uuid REFERENCES "departments"("id"),
    "defaultTeamId" uuid REFERENCES "teams"("id"),
    "color" text DEFAULT '#3B82F6', -- Hex color for UI
    "icon" text DEFAULT 'Ticket', -- Icon name for UI
    "sortOrder" integer DEFAULT 0,
    "slaHours" integer DEFAULT 48, -- Default SLA in hours
    "isActive" boolean DEFAULT true,
    "createdAt" timestamp DEFAULT now(),
    "updatedAt" timestamp DEFAULT now()
);

-- Subcategories table (detailed breakdowns)
CREATE TABLE IF NOT EXISTS "subcategories" (
    "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    "categoryId" uuid NOT NULL REFERENCES "categories"("id") ON DELETE CASCADE,
    "name" text NOT NULL,
    "description" text,
    "code" text UNIQUE NOT NULL,
    "defaultPriority" text DEFAULT 'medium',
    "slaHours" integer, -- Override category SLA if needed
    "sortOrder" integer DEFAULT 0,
    "isActive" boolean DEFAULT true,
    "createdAt" timestamp DEFAULT now(),
    "updatedAt" timestamp DEFAULT now(),
    UNIQUE("categoryId", "name")
);

-- ============================================================================
-- DYNAMIC FIELDS SYSTEM
-- ============================================================================

-- Field Types lookup
CREATE TABLE IF NOT EXISTS "fieldTypes" (
    "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    "name" text NOT NULL UNIQUE,
    "description" text,
    "inputComponent" text NOT NULL, -- React component to render
    "validationRules" jsonb, -- JSON schema for validation
    "isActive" boolean DEFAULT true
);

-- Dynamic Fields definition
CREATE TABLE IF NOT EXISTS "dynamicFields" (
    "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    "label" text NOT NULL,
    "uniqueId" text NOT NULL UNIQUE, -- From CSV: GLB-001, BT-APP-001, etc.
    "description" text,
    "fieldTypeId" uuid NOT NULL REFERENCES "fieldTypes"("id"),
    "categoryId" uuid REFERENCES "categories"("id"), -- NULL for global fields
    "subcategoryId" uuid REFERENCES "subcategories"("id"), -- NULL for category-wide fields
    "options" text[], -- For dropdowns, multi-select, etc.
    "validationRules" jsonb, -- Field-specific validation
    "defaultValue" text,
    "isRequired" boolean DEFAULT false,
    "isHidden" boolean DEFAULT false,
    "sortOrder" integer DEFAULT 0,
    "isActive" boolean DEFAULT true,
    "createdAt" timestamp DEFAULT now(),
    "updatedAt" timestamp DEFAULT now()
);

-- ============================================================================
-- USER MANAGEMENT
-- ============================================================================

-- Users table (enhanced)
CREATE TABLE IF NOT EXISTS "users" (
    "id" text PRIMARY KEY, -- Supabase user ID
    "email" text UNIQUE,
    "firstName" text,
    "lastName" text,
    "displayName" text,
    "profileImageUrl" text,
    "role" text DEFAULT 'staff',
    "departmentId" uuid REFERENCES "departments"("id"),
    "teamId" uuid REFERENCES "teams"("id"),
    "studioId" uuid REFERENCES "studios"("id"), -- Primary studio
    "permissions" text[] DEFAULT '{}', -- Array of permission strings
    "isActive" boolean DEFAULT true,
    "lastLoginAt" timestamp,
    "createdAt" timestamp DEFAULT now(),
    "updatedAt" timestamp DEFAULT now()
);

-- User Studio Access (many-to-many)
CREATE TABLE IF NOT EXISTS "userStudioAccess" (
    "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    "userId" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "studioId" uuid NOT NULL REFERENCES "studios"("id") ON DELETE CASCADE,
    "accessLevel" text DEFAULT 'read', -- read, write, admin
    "createdAt" timestamp DEFAULT now(),
    UNIQUE("userId", "studioId")
);

-- ============================================================================
-- TICKETS SYSTEM
-- ============================================================================

-- Tickets table (comprehensive)
CREATE TABLE IF NOT EXISTS "tickets" (
    "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    "ticketNumber" text NOT NULL UNIQUE,
    "studioId" uuid NOT NULL REFERENCES "studios"("id"),
    "categoryId" uuid NOT NULL REFERENCES "categories"("id"),
    "subcategoryId" uuid REFERENCES "subcategories"("id"),
    "priority" text DEFAULT 'medium' CHECK ("priority" IN ('low', 'medium', 'high', 'critical')),
    "status" text DEFAULT 'new' CHECK ("status" IN ('new', 'open', 'in-progress', 'pending', 'resolved', 'closed', 'cancelled')),
    "title" text NOT NULL,
    "description" text NOT NULL,
    
    -- Customer Information
    "customerName" text,
    "customerEmail" text,
    "customerPhone" text,
    "customerMembershipId" text,
    "customerStatus" text,
    "clientMood" text,
    
    -- Assignment
    "assignedToUserId" text REFERENCES "users"("id"),
    "assignedTeamId" uuid REFERENCES "teams"("id"),
    "assignedDepartmentId" uuid REFERENCES "departments"("id"),
    "reportedByUserId" text REFERENCES "users"("id"),
    
    -- Tracking
    "source" text DEFAULT 'in-person', -- How issue was reported
    "severity" text DEFAULT 'normal',
    "tags" text[] DEFAULT '{}',
    "estimatedResolutionTime" timestamp,
    "actualResolutionTime" timestamp,
    "slaBreached" boolean DEFAULT false,
    "slaDueAt" timestamp,
    
    -- Dates and timing
    "incidentDateTime" timestamp, -- When issue occurred
    "firstResponseAt" timestamp,
    "escalatedAt" timestamp,
    "resolvedAt" timestamp,
    "closedAt" timestamp,
    "reopenedAt" timestamp,
    "lastActivityAt" timestamp DEFAULT now(),
    
    -- Dynamic field data
    "dynamicFieldData" jsonb DEFAULT '{}', -- Stores all dynamic field values
    
    -- Metadata
    "satisfactionRating" integer CHECK ("satisfactionRating" >= 1 AND "satisfactionRating" <= 5),
    "resolutionSummary" text,
    "internalNotes" text,
    "isInternalTicket" boolean DEFAULT false,
    "parentTicketId" uuid REFERENCES "tickets"("id"), -- For related/child tickets
    
    "createdAt" timestamp DEFAULT now(),
    "updatedAt" timestamp DEFAULT now()
);

-- ============================================================================
-- TICKET INTERACTIONS
-- ============================================================================

-- Ticket Comments/Updates
CREATE TABLE IF NOT EXISTS "ticketComments" (
    "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    "ticketId" uuid NOT NULL REFERENCES "tickets"("id") ON DELETE CASCADE,
    "userId" text NOT NULL REFERENCES "users"("id"),
    "content" text NOT NULL,
    "commentType" text DEFAULT 'comment' CHECK ("commentType" IN ('comment', 'update', 'solution', 'escalation')),
    "isInternal" boolean DEFAULT false,
    "isResolution" boolean DEFAULT false,
    "timeSpentMinutes" integer, -- Time tracking
    "attachments" jsonb, -- File references
    "mentionedUserIds" text[] DEFAULT '{}', -- For notifications
    "createdAt" timestamp DEFAULT now(),
    "updatedAt" timestamp DEFAULT now()
);

-- Ticket Attachments
CREATE TABLE IF NOT EXISTS "ticketAttachments" (
    "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    "ticketId" uuid NOT NULL REFERENCES "tickets"("id") ON DELETE CASCADE,
    "commentId" uuid REFERENCES "ticketComments"("id") ON DELETE CASCADE,
    "fileName" text NOT NULL,
    "originalFileName" text NOT NULL,
    "filePath" text NOT NULL, -- Storage path
    "fileSize" integer,
    "mimeType" text,
    "uploadedByUserId" text NOT NULL REFERENCES "users"("id"),
    "isPublic" boolean DEFAULT false, -- Visible to customer
    "createdAt" timestamp DEFAULT now()
);

-- Ticket History (audit trail)
CREATE TABLE IF NOT EXISTS "ticketHistory" (
    "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    "ticketId" uuid NOT NULL REFERENCES "tickets"("id") ON DELETE CASCADE,
    "changedByUserId" text REFERENCES "users"("id"),
    "action" text NOT NULL, -- created, updated, assigned, status_changed, etc.
    "fieldChanged" text,
    "oldValue" jsonb,
    "newValue" jsonb,
    "changeReason" text,
    "automatedChange" boolean DEFAULT false,
    "ipAddress" inet,
    "userAgent" text,
    "createdAt" timestamp DEFAULT now()
);

-- Ticket Watchers (for notifications)
CREATE TABLE IF NOT EXISTS "ticketWatchers" (
    "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    "ticketId" uuid NOT NULL REFERENCES "tickets"("id") ON DELETE CASCADE,
    "userId" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "watchType" text DEFAULT 'all' CHECK ("watchType" IN ('all', 'updates', 'comments', 'status')),
    "addedByUserId" text REFERENCES "users"("id"),
    "createdAt" timestamp DEFAULT now(),
    UNIQUE("ticketId", "userId")
);

-- ============================================================================
-- NOTIFICATIONS & MESSAGING
-- ============================================================================

-- Notifications
CREATE TABLE IF NOT EXISTS "notifications" (
    "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    "userId" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "title" text NOT NULL,
    "message" text NOT NULL,
    "type" text DEFAULT 'info' CHECK ("type" IN ('info', 'warning', 'error', 'success')),
    "category" text DEFAULT 'general', -- ticket, system, announcement, etc.
    "priority" text DEFAULT 'normal' CHECK ("priority" IN ('low', 'normal', 'high', 'urgent')),
    "relatedTicketId" uuid REFERENCES "tickets"("id"),
    "relatedEntityType" text, -- ticket, user, studio, etc.
    "relatedEntityId" text,
    "actionUrl" text, -- Where to go when clicked
    "actionLabel" text, -- Button text
    "data" jsonb, -- Additional data
    "channels" text[] DEFAULT '{in-app}', -- in-app, email, sms, push
    "isRead" boolean DEFAULT false,
    "readAt" timestamp,
    "sentAt" timestamp,
    "deliveredAt" timestamp,
    "expiresAt" timestamp,
    "createdAt" timestamp DEFAULT now(),
    "updatedAt" timestamp DEFAULT now()
);

-- ============================================================================
-- WORKFLOW & AUTOMATION
-- ============================================================================

-- SLA Rules
CREATE TABLE IF NOT EXISTS "slaRules" (
    "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    "name" text NOT NULL,
    "description" text,
    "categoryId" uuid REFERENCES "categories"("id"),
    "subcategoryId" uuid REFERENCES "subcategories"("id"),
    "priority" text,
    "studioId" uuid REFERENCES "studios"("id"), -- NULL for all studios
    "firstResponseHours" integer DEFAULT 4,
    "resolutionHours" integer DEFAULT 24,
    "escalationHours" integer DEFAULT 12,
    "businessHoursOnly" boolean DEFAULT true,
    "isActive" boolean DEFAULT true,
    "sortOrder" integer DEFAULT 0, -- Higher numbers = higher priority rules
    "createdAt" timestamp DEFAULT now(),
    "updatedAt" timestamp DEFAULT now()
);

-- Workflow Rules (basic automation)
CREATE TABLE IF NOT EXISTS "workflowRules" (
    "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    "name" text NOT NULL,
    "description" text,
    "triggerEvent" text NOT NULL, -- ticket_created, status_changed, etc.
    "conditions" jsonb NOT NULL, -- When to trigger
    "actions" jsonb NOT NULL, -- What to do
    "isActive" boolean DEFAULT true,
    "runOrder" integer DEFAULT 0,
    "createdAt" timestamp DEFAULT now(),
    "updatedAt" timestamp DEFAULT now()
);

-- ============================================================================
-- REPORTING & ANALYTICS
-- ============================================================================

-- Business Hours definition
CREATE TABLE IF NOT EXISTS "businessHours" (
    "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    "studioId" uuid REFERENCES "studios"("id"), -- NULL for global
    "dayOfWeek" integer NOT NULL CHECK ("dayOfWeek" >= 0 AND "dayOfWeek" <= 6), -- 0=Sunday
    "openTime" time NOT NULL,
    "closeTime" time NOT NULL,
    "isWorkingDay" boolean DEFAULT true,
    "timeZone" text DEFAULT 'Asia/Kolkata',
    "createdAt" timestamp DEFAULT now(),
    "updatedAt" timestamp DEFAULT now()
);

-- Customer Feedback
CREATE TABLE IF NOT EXISTS "customerFeedback" (
    "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    "ticketId" uuid NOT NULL REFERENCES "tickets"("id"),
    "customerEmail" text,
    "customerName" text,
    "rating" integer CHECK ("rating" >= 1 AND "rating" <= 5),
    "feedback" text,
    "feedbackType" text DEFAULT 'satisfaction', -- satisfaction, suggestion, complaint
    "tags" text[] DEFAULT '{}',
    "isPublic" boolean DEFAULT false, -- Can be used in testimonials
    "followUpRequired" boolean DEFAULT false,
    "createdAt" timestamp DEFAULT now()
);

-- Sessions table for express-session
CREATE TABLE IF NOT EXISTS "sessions" (
    "sid" text PRIMARY KEY,
    "sess" json NOT NULL,
    "expire" timestamp(6) NOT NULL
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Core ticket indexes
CREATE INDEX IF NOT EXISTS "idx_tickets_studio" ON "tickets"("studioId");
CREATE INDEX IF NOT EXISTS "idx_tickets_category" ON "tickets"("categoryId");
CREATE INDEX IF NOT EXISTS "idx_tickets_subcategory" ON "tickets"("subcategoryId");
CREATE INDEX IF NOT EXISTS "idx_tickets_status" ON "tickets"("status");
CREATE INDEX IF NOT EXISTS "idx_tickets_priority" ON "tickets"("priority");
CREATE INDEX IF NOT EXISTS "idx_tickets_assigned_user" ON "tickets"("assignedToUserId");
CREATE INDEX IF NOT EXISTS "idx_tickets_assigned_team" ON "tickets"("assignedTeamId");
CREATE INDEX IF NOT EXISTS "idx_tickets_created" ON "tickets"("createdAt");
CREATE INDEX IF NOT EXISTS "idx_tickets_updated" ON "tickets"("updatedAt");
CREATE INDEX IF NOT EXISTS "idx_tickets_sla_due" ON "tickets"("slaDueAt") WHERE "slaDueAt" IS NOT NULL;
CREATE INDEX IF NOT EXISTS "idx_tickets_last_activity" ON "tickets"("lastActivityAt");

-- Text search indexes
CREATE INDEX IF NOT EXISTS "idx_tickets_title_search" ON "tickets" USING gin("title" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "idx_tickets_description_search" ON "tickets" USING gin("description" gin_trgm_ops);

-- Comments and history
CREATE INDEX IF NOT EXISTS "idx_ticket_comments_ticket" ON "ticketComments"("ticketId");
CREATE INDEX IF NOT EXISTS "idx_ticket_comments_created" ON "ticketComments"("createdAt");
CREATE INDEX IF NOT EXISTS "idx_ticket_history_ticket" ON "ticketHistory"("ticketId");

-- Notifications
CREATE INDEX IF NOT EXISTS "idx_notifications_user" ON "notifications"("userId");
CREATE INDEX IF NOT EXISTS "idx_notifications_unread" ON "notifications"("userId", "isRead") WHERE "isRead" = false;
CREATE INDEX IF NOT EXISTS "idx_notifications_created" ON "notifications"("createdAt");

-- Dynamic fields
CREATE INDEX IF NOT EXISTS "idx_dynamic_fields_category" ON "dynamicFields"("categoryId");
CREATE INDEX IF NOT EXISTS "idx_dynamic_fields_subcategory" ON "dynamicFields"("subcategoryId");

-- User access
CREATE INDEX IF NOT EXISTS "idx_user_studio_access" ON "userStudioAccess"("userId", "studioId");

-- ============================================================================
-- TRIGGERS FOR AUTOMATION
-- ============================================================================

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = now();
    RETURN NEW;
END;
$$ language plpgsql;

-- Apply to relevant tables
CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON "departments"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON "teams"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_studios_updated_at BEFORE UPDATE ON "studios"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON "categories"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subcategories_updated_at BEFORE UPDATE ON "subcategories"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON "users"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tickets_updated_at BEFORE UPDATE ON "tickets"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_dynamic_fields_updated_at BEFORE UPDATE ON "dynamicFields"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Ticket activity tracking
CREATE OR REPLACE FUNCTION update_ticket_activity()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE "tickets" SET "lastActivityAt" = now() WHERE "id" = NEW."ticketId";
    RETURN NEW;
END;
$$ language plpgsql;

CREATE TRIGGER update_ticket_activity_on_comment AFTER INSERT ON "ticketComments"
    FOR EACH ROW EXECUTE FUNCTION update_ticket_activity();

-- ============================================================================
-- SAMPLE DATA INSERTION
-- ============================================================================

-- Departments
INSERT INTO "departments" ("name", "description", "code") VALUES
    ('Operations', 'Day-to-day studio operations and management', 'OPS'),
    ('Facilities', 'Facility maintenance, equipment, and infrastructure', 'FAC'),
    ('Training', 'Instructor training, class quality, and fitness programs', 'TRG'),
    ('Client Success', 'Customer support, satisfaction, and relationship management', 'CS'),
    ('Sales & Marketing', 'Sales, marketing campaigns, and business development', 'SM'),
    ('Technology', 'IT support, app development, and technical infrastructure', 'TECH'),
    ('Finance', 'Billing, payments, and financial operations', 'FIN'),
    ('Management', 'Executive oversight and strategic decisions', 'MGT')
ON CONFLICT (code) DO NOTHING;

-- Studios
INSERT INTO "studios" ("name", "code", "address", "phone", "email") VALUES
    ('Kwality House Kemps Corner', 'KH-KC', '{"street": "Kemps Corner", "city": "Mumbai", "state": "Maharashtra", "pincode": "400026"}', '+91-9876543210', 'kemps@physique57.com'),
    ('Kenkre House', 'KENKRE', '{"street": "Kenkre House", "city": "Mumbai", "state": "Maharashtra", "pincode": "400001"}', '+91-9876543211', 'kenkre@physique57.com'),
    ('South United Football Club', 'SUFC', '{"street": "SUFC Complex", "city": "Mumbai", "state": "Maharashtra", "pincode": "400050"}', '+91-9876543212', 'sufc@physique57.com'),
    ('Supreme HQ Bandra', 'SHQ-BDR', '{"street": "Bandra West", "city": "Mumbai", "state": "Maharashtra", "pincode": "400050"}', '+91-9876543213', 'bandra@physique57.com'),
    ('WeWork Prestige Central', 'WW-PC', '{"street": "Prestige Central", "city": "Bangalore", "state": "Karnataka", "pincode": "560001"}', '+91-9876543214', 'bangalore@physique57.com'),
    ('WeWork Galaxy', 'WW-GAL', '{"street": "Galaxy Complex", "city": "Delhi", "state": "Delhi", "pincode": "110001"}', '+91-9876543215', 'delhi@physique57.com'),
    ('The Studio by Copper + Cloves', 'CC-STU', '{"street": "Cooper + Cloves", "city": "Gurgaon", "state": "Haryana", "pincode": "122001"}', '+91-9876543216', 'gurgaon@physique57.com')
ON CONFLICT (code) DO NOTHING;

-- Teams (with department relationships)
INSERT INTO "teams" ("name", "description", "departmentId") VALUES
    ('Front Desk Operations', 'Customer-facing operations team', (SELECT id FROM "departments" WHERE code = 'OPS')),
    ('Maintenance & Facilities', 'Equipment and facility maintenance', (SELECT id FROM "departments" WHERE code = 'FAC')),
    ('Instructor Team', 'Certified fitness instructors and trainers', (SELECT id FROM "departments" WHERE code = 'TRG')),
    ('Customer Support', 'Customer service and issue resolution', (SELECT id FROM "departments" WHERE code = 'CS')),
    ('Digital Marketing', 'Online marketing and social media', (SELECT id FROM "departments" WHERE code = 'SM')),
    ('Sales Team', 'Membership sales and client acquisition', (SELECT id FROM "departments" WHERE code = 'SM')),
    ('App Development', 'Mobile and web application development', (SELECT id FROM "departments" WHERE code = 'TECH')),
    ('IT Support', 'Technical support and infrastructure', (SELECT id FROM "departments" WHERE code = 'TECH'))
ON CONFLICT DO NOTHING;

-- Field Types
INSERT INTO "fieldTypes" ("name", "description", "inputComponent", "validationRules") VALUES
    ('Text', 'Single line text input', 'Input', '{"maxLength": 255}'),
    ('Long Text', 'Multi-line text area', 'Textarea', '{"maxLength": 2000}'),
    ('Email', 'Email address input', 'Input', '{"type": "email", "pattern": "^[^@]+@[^@]+\\.[^@]+$"}'),
    ('Phone', 'Phone number input', 'Input', '{"pattern": "^[+]?[0-9\\s\\-\\(\\)]+$"}'),
    ('Number', 'Numeric input', 'Input', '{"type": "number"}'),
    ('Date', 'Date picker', 'DatePicker', '{}'),
    ('DateTime', 'Date and time picker', 'DateTimePicker', '{}'),
    ('Dropdown', 'Single select dropdown', 'Select', '{}'),
    ('Multi-select', 'Multiple selection', 'MultiSelect', '{}'),
    ('Checkbox', 'Boolean checkbox', 'Checkbox', '{}'),
    ('Radio Button', 'Single choice from options', 'RadioGroup', '{}'),
    ('File Upload', 'File upload field', 'FileUpload', '{"maxSize": "10MB", "allowedTypes": ["image/*", ".pdf"]}'),
    ('Auto-generated', 'System generated field', 'ReadOnly', '{}')
ON CONFLICT (name) DO NOTHING;

-- Main Categories
INSERT INTO "categories" ("name", "description", "code", "defaultPriority", "color", "icon", "slaHours") VALUES
    ('Global', 'Global fields applicable to all tickets', 'GLB', 'medium', '#6B7280', 'Globe', 48),
    ('Booking & Technology', 'Issues with booking system, app, and website', 'BT', 'medium', '#3B82F6', 'Smartphone', 24),
    ('Customer Service', 'Service quality and customer interaction issues', 'CS', 'high', '#F59E0B', 'Users', 12),
    ('Sales & Marketing', 'Sales processes and marketing related issues', 'SM', 'medium', '#10B981', 'TrendingUp', 48),
    ('Health & Safety', 'Safety protocols, hygiene, and health-related issues', 'HS', 'high', '#EF4444', 'Shield', 8),
    ('Class Experience', 'Issues during classes and instructor-related', 'CX', 'medium', '#8B5CF6', 'PlayCircle', 24),
    ('Community & Culture', 'Studio culture, behavior, and community issues', 'CC', 'medium', '#EC4899', 'Heart', 48),
    ('Special Programs', 'Workshops, events, and special programming', 'SP', 'medium', '#06B6D4', 'Calendar', 72),
    ('Retail & Merchandise', 'Product sales, quality, and retail operations', 'RM', 'low', '#84CC16', 'ShoppingBag', 72),
    ('Miscellaneous', 'Other issues not covered by specific categories', 'MISC', 'medium', '#64748B', 'MoreHorizontal', 48)
ON CONFLICT (code) DO NOTHING;

-- Subcategories
INSERT INTO "subcategories" ("categoryId", "name", "description", "code", "defaultPriority", "slaHours") VALUES
    -- Booking & Technology Subcategories
    ((SELECT id FROM "categories" WHERE code = 'BT'), 'App Issues', 'Mobile app problems and bugs', 'BT-APP', 'high', 12),
    ((SELECT id FROM "categories" WHERE code = 'BT'), 'Website Problems', 'Website functionality issues', 'BT-WEB', 'high', 12),
    ((SELECT id FROM "categories" WHERE code = 'BT'), 'Class Booking', 'Issues with booking classes', 'BT-BOOK', 'high', 8),
    ((SELECT id FROM "categories" WHERE code = 'BT'), 'Payment Processing', 'Payment and billing system issues', 'BT-PAY', 'critical', 4),
    ((SELECT id FROM "categories" WHERE code = 'BT'), 'Account Access', 'Login and account access problems', 'BT-ACC', 'high', 8),
    ((SELECT id FROM "categories" WHERE code = 'BT'), 'Waitlist Issues', 'Problems with class waitlists', 'BT-WAIT', 'medium', 24),
    ((SELECT id FROM "categories" WHERE code = 'BT'), 'Cancellation Problems', 'Issues cancelling classes or memberships', 'BT-CANC', 'medium', 24),
    ((SELECT id FROM "categories" WHERE code = 'BT'), 'Class Check-in', 'QR codes and check-in system issues', 'BT-CHKIN', 'medium', 12),
    ((SELECT id FROM "categories" WHERE code = 'BT'), 'Notifications', 'Push notifications and email issues', 'BT-NOTIF', 'low', 48),
    ((SELECT id FROM "categories" WHERE code = 'BT'), 'Profile Management', 'User profile and settings issues', 'BT-PROF', 'medium', 24),
    ((SELECT id FROM "categories" WHERE code = 'BT'), 'Class Visibility', 'Schedule and class display issues', 'BT-VIS', 'medium', 24),
    ((SELECT id FROM "categories" WHERE code = 'BT'), 'Technical Support', 'General technical support issues', 'BT-TECH', 'medium', 24),

    -- Customer Service Subcategories
    ((SELECT id FROM "categories" WHERE code = 'CS'), 'Response Time', 'Delayed or missing responses', 'CS-RESP', 'high', 8),
    ((SELECT id FROM "categories" WHERE code = 'CS'), 'Issue Resolution', 'Problems with resolving customer issues', 'CS-RESOL', 'high', 12),
    ((SELECT id FROM "categories" WHERE code = 'CS'), 'Communication Quality', 'Poor communication or misunderstandings', 'CS-COMM', 'medium', 24),
    ((SELECT id FROM "categories" WHERE code = 'CS'), 'Staff Knowledge', 'Staff lacking product/policy knowledge', 'CS-KNOW', 'medium', 24),
    ((SELECT id FROM "categories" WHERE code = 'CS'), 'Staff Availability', 'Staff unavailable when needed', 'CS-AVAIL', 'high', 12),
    ((SELECT id FROM "categories" WHERE code = 'CS'), 'Complaint Handling', 'Poor handling of complaints', 'CS-COMPL', 'high', 8),
    ((SELECT id FROM "categories" WHERE code = 'CS'), 'Phone Support', 'Issues with phone support', 'CS-PHONE', 'medium', 24),
    ((SELECT id FROM "categories" WHERE code = 'CS'), 'Email/Chat Support', 'Issues with digital support channels', 'CS-EMAIL', 'medium', 24),
    ((SELECT id FROM "categories" WHERE code = 'CS'), 'Staff Professionalism', 'Unprofessional staff behavior', 'CS-PROF', 'high', 8),
    ((SELECT id FROM "categories" WHERE code = 'CS'), 'Newcomer Experience', 'Poor onboarding for new clients', 'CS-NEW', 'medium', 24),

    -- Sales & Marketing Subcategories
    ((SELECT id FROM "categories" WHERE code = 'SM'), 'Misleading Information', 'False or misleading sales information', 'SM-MISL', 'high', 12),
    ((SELECT id FROM "categories" WHERE code = 'SM'), 'Aggressive Selling', 'Pushy or inappropriate sales tactics', 'SM-AGG', 'medium', 24),
    ((SELECT id FROM "categories" WHERE code = 'SM'), 'Trial Class Experience', 'Issues during trial classes', 'SM-TRIAL', 'medium', 24),

    -- Health & Safety Subcategories
    ((SELECT id FROM "categories" WHERE code = 'HS'), 'Equipment Safety', 'Unsafe or faulty equipment', 'HS-EQUIP', 'critical', 2),
    ((SELECT id FROM "categories" WHERE code = 'HS'), 'Injury During Class', 'Injuries that occurred during class', 'HS-INJURY', 'critical', 1),
    ((SELECT id FROM "categories" WHERE code = 'HS'), 'Hygiene Protocols', 'Cleanliness and hygiene issues', 'HS-HYGIENE', 'high', 8),

    -- Retail & Merchandise Subcategories
    ((SELECT id FROM "categories" WHERE code = 'RM'), 'Product Quality', 'Defective or poor quality products', 'RM-QUALITY', 'medium', 48),
    ((SELECT id FROM "categories" WHERE code = 'RM'), 'Product Availability', 'Out of stock or unavailable items', 'RM-AVAIL', 'low', 72),
    ((SELECT id FROM "categories" WHERE code = 'RM'), 'Pricing', 'Pricing errors or confusion', 'RM-PRICE', 'medium', 24),
    ((SELECT id FROM "categories" WHERE code = 'RM'), 'Return/Exchange', 'Return and exchange issues', 'RM-RETURN', 'medium', 48),
    ((SELECT id FROM "categories" WHERE code = 'RM'), 'Staff Knowledge (Retail)', 'Retail staff lacking product knowledge', 'RM-KNOW', 'medium', 24),

    -- Miscellaneous Subcategories
    ((SELECT id FROM "categories" WHERE code = 'MISC'), 'Lost & Found', 'Lost and found item issues', 'MISC-LOST', 'low', 72),
    ((SELECT id FROM "categories" WHERE code = 'MISC'), 'Guest Experience', 'Issues with guest/visitor experience', 'MISC-GUEST', 'medium', 24),
    ((SELECT id FROM "categories" WHERE code = 'MISC'), 'Nutrition/Wellness Advice', 'Inappropriate health/nutrition advice', 'MISC-NUTRITION', 'high', 12),
    ((SELECT id FROM "categories" WHERE code = 'MISC'), 'Multi-location Issues', 'Problems affecting multiple studios', 'MISC-MULTI', 'medium', 48),
    ((SELECT id FROM "categories" WHERE code = 'MISC'), 'Feedback System', 'Issues with providing feedback', 'MISC-FEEDBACK', 'medium', 48)
ON CONFLICT (code) DO NOTHING;

-- Sample Business Hours (Monday-Sunday for all studios)
INSERT INTO "businessHours" ("studioId", "dayOfWeek", "openTime", "closeTime", "isWorkingDay") 
SELECT 
    s.id,
    d.day_num,
    CASE WHEN d.day_num IN (0, 6) THEN '08:00'::time ELSE '06:00'::time END, -- Weekend vs Weekday
    CASE WHEN d.day_num IN (0, 6) THEN '20:00'::time ELSE '22:00'::time END,
    true
FROM "studios" s
CROSS JOIN (SELECT generate_series(0, 6) as day_num) d
ON CONFLICT DO NOTHING;

-- Success message
SELECT 
    'Comprehensive database schema created successfully!' as message,
    (SELECT COUNT(*) FROM "departments") as departments_created,
    (SELECT COUNT(*) FROM "studios") as studios_created,
    (SELECT COUNT(*) FROM "categories") as categories_created,
    (SELECT COUNT(*) FROM "fieldTypes") as field_types_created;