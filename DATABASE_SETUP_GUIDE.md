# Database Setup Guide - Dynamic Fields Architecture

## Overview

Your Supabase database now uses a **relational architecture** for dynamic fields instead of CSV files. This ensures proper data integrity and allows for real-time management of form fields.

## Database Schema Relationships

```
categories (1)
    ↓ (1:N)
    ├── subcategories
    │      ↓ (1:N)
    │      └── dynamicFields (subcategory-specific)
    │
    └── dynamicFields (category-global)

fieldTypes (1)
    ↓ (1:N)
    └── dynamicFields
```

### Key Tables

#### `categories`
Stores ticket categories like "Booking & Technology", "Customer Service", etc.

```sql
id UUID PRIMARY KEY
name TEXT UNIQUE NOT NULL
description TEXT
code TEXT UNIQUE NOT NULL
defaultPriority TEXT DEFAULT 'medium'
defaultTeamId UUID FOREIGN KEY
slaHours INTEGER DEFAULT 48
isActive BOOLEAN DEFAULT true
sortOrder INTEGER DEFAULT 0
createdAt TIMESTAMP
updatedAt TIMESTAMP
```

#### `subcategories`
Stores subcategories within each category. Cascade deletes with category.

```sql
id UUID PRIMARY KEY
categoryId UUID FOREIGN KEY → categories(id) ON DELETE CASCADE
name TEXT NOT NULL
description TEXT
code TEXT UNIQUE NOT NULL
defaultPriority TEXT DEFAULT 'medium'
slaHours INTEGER
sortOrder INTEGER DEFAULT 0
isActive BOOLEAN DEFAULT true
createdAt TIMESTAMP
updatedAt TIMESTAMP

UNIQUE(categoryId, name)
UNIQUE(code)
```

#### `fieldTypes`
Stores available field types.

```sql
id UUID PRIMARY KEY
name TEXT UNIQUE NOT NULL (e.g., 'Dropdown', 'Text', 'Textarea', 'DateTime', 'Date', 'Email', 'Phone', 'Checkbox', 'File Upload')
description TEXT
createdAt TIMESTAMP
```

#### `dynamicFields`
Stores form fields linked to categories and/or subcategories.

```sql
id UUID PRIMARY KEY
label TEXT NOT NULL (field display name)
uniqueId TEXT UNIQUE NOT NULL (identifier for saving)
description TEXT
fieldTypeId UUID FOREIGN KEY → fieldTypes(id)
categoryId UUID FOREIGN KEY → categories(id) ON DELETE CASCADE (NULL = global)
subcategoryId UUID FOREIGN KEY → subcategories(id) ON DELETE CASCADE (NULL = category-global)
options TEXT[] (for dropdowns, array of options)
validationRules JSONB (custom validation rules)
defaultValue TEXT
isRequired BOOLEAN DEFAULT false
isHidden BOOLEAN DEFAULT false
sortOrder INTEGER DEFAULT 0
isActive BOOLEAN DEFAULT true
createdAt TIMESTAMP
updatedAt TIMESTAMP

UNIQUE(uniqueId)
INDEX(categoryId)
INDEX(subcategoryId)
```

## Setup Steps

### 1. Run Database Schema
Execute the updated SQL in your Supabase SQL Editor:

```bash
# Copy the entire supabase-schema.sql file and run in Supabase SQL Editor
# This creates all tables with proper relationships and indexes
```

The schema includes:
- ✅ Proper foreign key relationships
- ✅ CASCADE delete for data consistency
- ✅ Indexes on frequently queried columns
- ✅ Unique constraints to prevent duplicates
- ✅ Audit timestamps (createdAt, updatedAt)

### 2. Initialize Field Types
Before migrating data, ensure field types exist:

```sql
INSERT INTO "fieldTypes" (name, description) VALUES
  ('Dropdown', 'Select from predefined options'),
  ('Text', 'Single line text input'),
  ('Textarea', 'Multi-line text input'),
  ('DateTime', 'Date and time picker'),
  ('Date', 'Date picker'),
  ('Email', 'Email input'),
  ('Phone', 'Phone number input'),
  ('Checkbox', 'Boolean checkbox'),
  ('File Upload', 'File attachment upload')
ON CONFLICT (name) DO NOTHING;
```

### 3. Seed Initial Categories & Subcategories
Add your categories and subcategories:

```sql
-- Categories
INSERT INTO "categories" (name, code, description, defaultPriority, sortOrder) VALUES
  ('Booking & Technology', 'booking-tech', 'Issues with app, website, booking system', 'medium', 1),
  ('Customer Service', 'customer-service', 'Service quality and staff issues', 'high', 2),
  ('Sales & Marketing', 'sales-marketing', 'Sales and marketing related', 'medium', 3),
  ('Health & Safety', 'health-safety', 'Safety, hygiene, health protocols', 'high', 4),
  ('Class Experience', 'class-experience', 'Class and instructor issues', 'medium', 5),
  ('Facilities', 'facilities', 'Maintenance and infrastructure', 'medium', 6)
ON CONFLICT (code) DO NOTHING;

-- Subcategories for Booking & Technology
INSERT INTO "subcategories" (categoryId, name, code, defaultPriority, sortOrder) VALUES
  ((SELECT id FROM categories WHERE code='booking-tech'), 'App/Website Issues', 'app-issues', 'high', 1),
  ((SELECT id FROM categories WHERE code='booking-tech'), 'Booking Problems', 'booking-problems', 'high', 2),
  ((SELECT id FROM categories WHERE code='booking-tech'), 'Payment Issues', 'payment-issues', 'high', 3)
ON CONFLICT (code) DO NOTHING;
```

### 4. Migrate CSV Data to Database

#### Option A: Automatic Migration (Recommended)
```bash
# Start your dev server
npm run dev

# In another terminal, run the migration:
curl -X POST http://localhost:5000/api/admin/migrate-fields

# Response:
# {
#   "message": "Successfully migrated 962 fields to database",
#   "count": 962
# }
```

The migration endpoint:
- Parses the CSV file (fields_1765795119065.csv)
- Creates categories and subcategories automatically
- Maps CSV fields to dynamicFields table
- Handles duplicates with upsert (won't create duplicates on re-run)

#### Option B: Manual Migration
If needed, manually insert fields:

```sql
INSERT INTO "dynamicFields" 
  (label, uniqueId, description, fieldTypeId, categoryId, subcategoryId, options, isRequired, isActive)
VALUES
  (
    'Issue Type',
    'booking_issue_type',
    'Type of booking issue',
    (SELECT id FROM fieldTypes WHERE name = 'Dropdown'),
    (SELECT id FROM categories WHERE code = 'booking-tech'),
    (SELECT id FROM subcategories WHERE code = 'app-issues'),
    ARRAY['Bug', 'Feature Request', 'Performance Issue'],
    true,
    true
  )
ON CONFLICT (uniqueId) DO UPDATE SET
  label = EXCLUDED.label,
  description = EXCLUDED.description;
```

## How It Works

### Client-Side: Dynamic Field Fetching

**Flow:**
1. User selects a **Category** (e.g., "Booking & Technology")
2. Form queries `/api/categories/:categoryId/subcategories`
3. Subcategories dropdown populates
4. User selects a **Subcategory** (e.g., "App/Website Issues")
5. Form queries `/api/categories/:categoryId/fields?subcategoryId=...`
6. Dynamic fields render in form

**Code Location:** [client/src/pages/ticket-new.tsx](client/src/pages/ticket-new.tsx#L135-L180)

```typescript
// Fetch fields with relationship to subcategory
const { data: dynamicFieldsData = [] } = useQuery({
  queryKey: ['/api/categories', categoryId, 'fields', selectedSubcategory],
  queryFn: async () => {
    if (!categoryId) return [];
    
    const url = new URL(`/api/categories/${categoryId}/fields`, window.location.origin);
    if (selectedSubcategory && selectedSubcategory !== 'All') {
      url.searchParams.set('subcategoryId', selectedSubcategory);
    }
    
    const response = await fetch(url);
    return response.json();
  }
});
```

### Server-Side: API Endpoints

#### `GET /api/categories`
Returns all active categories with sort order.

**Response:**
```json
[
  {
    "id": "uuid-123",
    "name": "Booking & Technology",
    "code": "booking-tech",
    "description": "Issues with app, website, booking system",
    "defaultPriority": "medium",
    "sortOrder": 1,
    "isActive": true
  }
]
```

#### `GET /api/categories/:categoryId/subcategories`
Returns subcategories for a category.

**Response:**
```json
[
  {
    "id": "uuid-456",
    "name": "App/Website Issues",
    "code": "app-issues",
    "description": null,
    "defaultPriority": "high",
    "sortOrder": 1,
    "isActive": true
  }
]
```

#### `GET /api/categories/:categoryId/fields?subcategoryId=optional`
Returns dynamic fields with intelligent filtering.

**Without subcategoryId:**
```json
[
  {
    "id": "uuid-789",
    "label": "Priority Level",
    "uniqueId": "global_priority",
    "description": "Applies to all categories",
    "fieldType": { "id": "uuid-ft1", "name": "Dropdown" },
    "options": ["Low", "Medium", "High", "Urgent"],
    "isRequired": false,
    "sortOrder": 0
  }
]
```

**With subcategoryId:**
Returns Global fields + Category fields + Subcategory-specific fields
```json
[
  {
    "label": "Priority Level",
    "categoryId": null,  // Global
    "subcategoryId": null
  },
  {
    "label": "Booking Category Priority",
    "categoryId": "uuid-cat",  // Category-specific
    "subcategoryId": null
  },
  {
    "label": "Issue Type",
    "categoryId": "uuid-cat",  // Subcategory-specific
    "subcategoryId": "uuid-sub"
  }
]
```

#### `POST /api/admin/migrate-fields`
One-time endpoint to migrate CSV data to database.

**Response:**
```json
{
  "message": "Successfully migrated 962 fields to database",
  "count": 962
}
```

## Field Querying Logic

### Rule 1: Global Fields
Fields with `categoryId = NULL` and `subcategoryId = NULL` appear in ALL categories.

### Rule 2: Category-Global Fields
Fields with `categoryId = specific` and `subcategoryId = NULL` appear when that category is selected (regardless of subcategory).

### Rule 3: Subcategory-Specific Fields
Fields with both `categoryId` and `subcategoryId` set appear ONLY when that specific subcategory is selected.

### Query Example
```sql
-- Get fields for category "booking-tech" with subcategory "app-issues"
SELECT * FROM "dynamicFields"
WHERE (
  -- Global fields
  (categoryId IS NULL AND subcategoryId IS NULL)
  OR
  -- Category fields
  (categoryId = 'uuid-booking-tech' AND subcategoryId IS NULL)
  OR
  -- Subcategory fields
  (subcategoryId = 'uuid-app-issues')
)
AND isActive = true
AND isHidden = false
ORDER BY sortOrder ASC;
```

## Data Storage: Tickets with Dynamic Fields

When a ticket is created, dynamic field values are stored in the `tickets` table:

```sql
CREATE TABLE tickets (
  ...
  dynamicFields JSONB,  -- Stores all dynamic field values
  ...
)
```

**Example dynamicFields JSONB:**
```json
{
  "booking_issue_type": "Bug",
  "platform": "iOS",
  "device_type": "iPhone 14",
  "priority_level": "High",
  "affected_bookings": 3,
  "incident_date": "2024-12-15"
}
```

**Saving:**
```typescript
// In ticket creation
const dynamicFieldValues = {};
dynamicFields.forEach(field => {
  dynamicFieldValues[field.uniqueId] = formData[field.uniqueId];
});

await supabase.from('tickets').insert({
  category: selectedCategory,
  subcategory: selectedSubcategory,
  dynamicFields: dynamicFieldValues,  // JSONB column
  ...otherFields
});
```

**Retrieving:**
```sql
-- Get a ticket with its dynamic fields
SELECT * FROM tickets WHERE id = 'ticket-uuid';

-- Query tickets by dynamic field value
SELECT * FROM tickets
WHERE dynamicFields->>'booking_issue_type' = 'Bug';

-- Count by dynamic field
SELECT dynamicFields->>'platform', COUNT(*)
FROM tickets
GROUP BY dynamicFields->>'platform';
```

## Performance Optimization

### Indexes Created
```sql
-- Fast lookups by category/subcategory
CREATE INDEX idx_dynamicFields_categoryId ON "dynamicFields"("categoryId");
CREATE INDEX idx_dynamicFields_subcategoryId ON "dynamicFields"("subcategoryId");

-- Fast filtering
CREATE INDEX idx_dynamicFields_active ON "dynamicFields"("isActive");
CREATE INDEX idx_subcategories_categoryId ON "subcategories"("categoryId");
```

### Caching Strategy
React Query caches fields with keys:
- `['/api/categories']` - All categories (rarely changes)
- `['/api/categories', categoryId, 'fields', subcategoryId]` - Fields for selection

Cache invalidation on:
- Category change
- Subcategory change

## Troubleshooting

### Issue: Fields not appearing for subcategory

**Check:**
1. Subcategory exists: `SELECT * FROM subcategories WHERE id = '...'`
2. Fields have correct subcategoryId: `SELECT * FROM "dynamicFields" WHERE subcategoryId = '...'`
3. Fields are active: `isActive = true AND isHidden = false`
4. Browser console shows query response

### Issue: Duplicate fields appearing

**Check:**
1. No duplicate `uniqueId` values: `SELECT uniqueId, COUNT(*) FROM "dynamicFields" GROUP BY uniqueId HAVING COUNT(*) > 1`
2. Same field not mapped to multiple subcategories unintentionally
3. No overlapping global + subcategory fields with same ID

### Issue: Migration not working

**Check:**
1. CSV file exists: `attached_assets/fields_1765795119065.csv`
2. Server logs for parsing errors: `npm run dev`
3. Field types created: `SELECT * FROM "fieldTypes"`
4. Categories/subcategories exist before migration

## Next Steps

1. ✅ Run `supabase-schema.sql` in your Supabase SQL Editor
2. ✅ Run the migration: `curl -X POST http://localhost:5000/api/admin/migrate-fields`
3. ✅ Test form: Select category → see subcategories → see dynamic fields
4. ✅ Create ticket and verify dynamicFields saved to database
5. ✅ Monitor performance with indexed queries

## API Reference

| Endpoint | Method | Purpose | Status |
|----------|--------|---------|--------|
| `/api/categories` | GET | Fetch all categories | Active |
| `/api/categories/:categoryId/subcategories` | GET | Fetch subcategories for category | Active |
| `/api/categories/:categoryId/fields` | GET | Fetch dynamic fields (with optional subcategoryId param) | Active |
| `/api/field-mapping` | GET | Legacy endpoint for backward compatibility | Active |
| `/api/admin/migrate-fields` | POST | One-time CSV migration | Active |

---

**Last Updated:** December 16, 2024
**Schema Version:** 2.0 (Relational with proper foreign keys)
