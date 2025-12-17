-- Supabase Database Schema Setup
-- Run this SQL in your Supabase SQL Editor to create all required tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS "users" (
    "id" text PRIMARY KEY,
    "email" text,
    "firstName" text,
    "lastName" text,
    "profileImageUrl" text,
    "role" text DEFAULT 'staff',
    "isActive" boolean DEFAULT true,
    "createdAt" timestamp DEFAULT now(),
    "updatedAt" timestamp DEFAULT now()
);

-- Teams table
CREATE TABLE IF NOT EXISTS "teams" (
    "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    "name" text NOT NULL UNIQUE,
    "description" text,
    "isActive" boolean DEFAULT true,
    "createdAt" timestamp DEFAULT now(),
    "updatedAt" timestamp DEFAULT now()
);

-- Studios table
CREATE TABLE IF NOT EXISTS "studios" (
    "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    "name" text NOT NULL UNIQUE,
    "code" text NOT NULL UNIQUE,
    "address" jsonb,
    "phone" text,
    "email" text,
    "isActive" boolean DEFAULT true,
    "createdAt" timestamp DEFAULT now(),
    "updatedAt" timestamp DEFAULT now()
);

-- Categories table
CREATE TABLE IF NOT EXISTS "categories" (
    "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    "name" text NOT NULL UNIQUE,
    "description" text,
    "code" text NOT NULL UNIQUE,
    "defaultPriority" text DEFAULT 'medium',
    "defaultDepartmentId" uuid,
    "defaultTeamId" uuid,
    "color" text DEFAULT '#3B82F6',
    "icon" text DEFAULT 'Ticket',
    "sortOrder" integer DEFAULT 0,
    "slaHours" integer DEFAULT 48,
    "isActive" boolean DEFAULT true,
    "createdAt" timestamp DEFAULT now(),
    "updatedAt" timestamp DEFAULT now()
);

-- Subcategories table
CREATE TABLE IF NOT EXISTS "subcategories" (
    "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    "categoryId" uuid NOT NULL REFERENCES "categories"("id") ON DELETE CASCADE,
    "name" text NOT NULL,
    "description" text,
    "code" text NOT NULL,
    "defaultPriority" text DEFAULT 'medium',
    "slaHours" integer,
    "sortOrder" integer DEFAULT 0,
    "isActive" boolean DEFAULT true,
    "createdAt" timestamp DEFAULT now(),
    "updatedAt" timestamp DEFAULT now(),
    UNIQUE("categoryId", "name"),
    UNIQUE("code")
);

-- Field Types table
CREATE TABLE IF NOT EXISTS "fieldTypes" (
    "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    "name" text NOT NULL UNIQUE,
    "description" text,
    "createdAt" timestamp DEFAULT now()
);

-- Dynamic Fields table - Properly linked to categories and subcategories
CREATE TABLE IF NOT EXISTS "dynamicFields" (
    "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    "label" text NOT NULL,
    "uniqueId" text NOT NULL UNIQUE,
    "description" text,
    "fieldTypeId" uuid NOT NULL REFERENCES "fieldTypes"("id"),
    "categoryId" uuid REFERENCES "categories"("id") ON DELETE CASCADE,
    "subcategoryId" uuid REFERENCES "subcategories"("id") ON DELETE CASCADE,
    "options" text[] NULL,
    "validationRules" jsonb NULL,
    "defaultValue" text,
    "isRequired" boolean DEFAULT false,
    "isHidden" boolean DEFAULT false,
    "sortOrder" integer DEFAULT 0,
    "isActive" boolean DEFAULT true,
    "createdAt" timestamp DEFAULT now(),
    "updatedAt" timestamp DEFAULT now()
);

-- Create indexes for dynamic fields performance
CREATE INDEX IF NOT EXISTS "idx_dynamicFields_categoryId" ON "dynamicFields"("categoryId");
CREATE INDEX IF NOT EXISTS "idx_dynamicFields_subcategoryId" ON "dynamicFields"("subcategoryId");
CREATE INDEX IF NOT EXISTS "idx_dynamicFields_active" ON "dynamicFields"("isActive");
CREATE INDEX IF NOT EXISTS "idx_subcategories_categoryId" ON "subcategories"("categoryId");

-- Tickets table
CREATE TABLE IF NOT EXISTS "tickets" (
    "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    "ticket_number" text NOT NULL UNIQUE,
    "studio_id" uuid NOT NULL REFERENCES "studios"("id"),
    "category" text NOT NULL,
    "subcategory" text,
    "priority" text DEFAULT 'medium',
    "status" text DEFAULT 'new',
    "title" text NOT NULL,
    "description" text NOT NULL,
    "customer_name" text,
    "customer_email" text,
    "customer_phone" text,
    "customer_membership_id" text,
    "customer_status" text,
    "client_mood" text,
    "assigned_to_user_id" text REFERENCES "users"("id"),
    "assigned_team_id" uuid REFERENCES "teams"("id"),
    "reported_by_user_id" text REFERENCES "users"("id"),
    "sla_breached" boolean DEFAULT false,
    "incident_date_time" timestamp,
    "dynamic_fields" jsonb,
    "created_at" timestamp DEFAULT now(),
    "updated_at" timestamp DEFAULT now(),
    "resolved_at" timestamp,
    "closed_at" timestamp
);

-- Ticket Comments table
CREATE TABLE IF NOT EXISTS "ticketComments" (
    "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    "ticketId" uuid NOT NULL REFERENCES "tickets"("id") ON DELETE CASCADE,
    "userId" text NOT NULL REFERENCES "users"("id"),
    "content" text NOT NULL,
    "isInternal" boolean DEFAULT false,
    "createdAt" timestamp DEFAULT now(),
    "updatedAt" timestamp DEFAULT now()
);

-- Ticket Attachments table
CREATE TABLE IF NOT EXISTS "ticketAttachments" (
    "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    "ticketId" uuid NOT NULL REFERENCES "tickets"("id") ON DELETE CASCADE,
    "fileName" text NOT NULL,
    "filePath" text NOT NULL,
    "fileSize" integer,
    "mimeType" text,
    "uploadedByUserId" text NOT NULL REFERENCES "users"("id"),
    "createdAt" timestamp DEFAULT now()
);

-- Ticket History table
CREATE TABLE IF NOT EXISTS "ticketHistory" (
    "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    "ticketId" uuid NOT NULL REFERENCES "tickets"("id") ON DELETE CASCADE,
    "changedByUserId" text REFERENCES "users"("id"),
    "fieldChanged" text,
    "oldValue" text,
    "newValue" text,
    "createdAt" timestamp DEFAULT now()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS "notifications" (
    "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    "userId" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "title" text NOT NULL,
    "message" text NOT NULL,
    "type" text DEFAULT 'info',
    "relatedTicketId" uuid REFERENCES "tickets"("id"),
    "isRead" boolean DEFAULT false,
    "createdAt" timestamp DEFAULT now(),
    "updatedAt" timestamp DEFAULT now()
);

-- Sessions table (for express-session)
CREATE TABLE IF NOT EXISTS "sessions" (
    "sid" text PRIMARY KEY,
    "sess" json NOT NULL,
    "expire" timestamp(6) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "idx_tickets_studio" ON "tickets"("studioId");
CREATE INDEX IF NOT EXISTS "idx_tickets_status" ON "tickets"("status");
CREATE INDEX IF NOT EXISTS "idx_tickets_priority" ON "tickets"("priority");
CREATE INDEX IF NOT EXISTS "idx_tickets_assigned" ON "tickets"("assignedToUserId");
CREATE INDEX IF NOT EXISTS "idx_tickets_created" ON "tickets"("createdAt");
CREATE INDEX IF NOT EXISTS "idx_notifications_user" ON "notifications"("userId");
CREATE INDEX IF NOT EXISTS "idx_notifications_read" ON "notifications"("isRead");

-- Insert some sample data
INSERT INTO "studios" ("name", "code", "address", "phone", "email") VALUES
    ('Kwality House Kemps Corner', 'kwality-kemps', '{"line1":"Kwality House","area":"Kemps Corner","city":"Mumbai"}'::jsonb, '+91-9876543210', 'kemps@physique57.com'),
    ('Kenkre House', 'kenkre-house', '{"line1":"Kenkre House","area":"Kenkre","city":"Mumbai"}'::jsonb, '+91-9876543211', 'kenkre@physique57.com'),
    ('South United Football Club', 'sufc-club', '{"line1":"South United Football Club","area":"SUFC","city":"Mumbai"}'::jsonb, '+91-9876543212', 'sufc@physique57.com'),
    ('Supreme HQ Bandra', 'supreme-bandra', '{"line1":"Supreme HQ","area":"Bandra","city":"Mumbai"}'::jsonb, '+91-9876543213', 'bandra@physique57.com')
ON CONFLICT ("name") DO NOTHING;

INSERT INTO "teams" ("name", "description") VALUES
    ('Operations', 'Day-to-day operations team'),
    ('Facilities', 'Facilities and maintenance team'),
    ('Training', 'Training and instructors team'),
    ('Client Success', 'Customer success and support team')
ON CONFLICT ("name") DO NOTHING;

INSERT INTO "categories" ("name", "code", "description", "defaultPriority", "color", "slaHours") VALUES
    ('Booking & Technology', 'booking-tech', 'Issues related to app, website, and booking system', 'medium', '#3B82F6', 48),
    ('Customer Service', 'customer-service', 'Service quality and staff interaction issues', 'high', '#EF4444', 24),
    ('Sales & Marketing', 'sales-marketing', 'Sales process and marketing related issues', 'medium', '#8B5CF6', 48),
    ('Health & Safety', 'health-safety', 'Safety, hygiene, and health protocol issues', 'high', '#F97316', 12),
    ('Class Experience', 'class-experience', 'Issues during classes and instructor related', 'medium', '#06B6D4', 36),
    ('Facilities', 'facilities', 'Facility maintenance and infrastructure issues', 'medium', '#10B981', 48)
ON CONFLICT ("name") DO NOTHING;

-- Success message
SELECT 'Database schema setup completed successfully!' as message;