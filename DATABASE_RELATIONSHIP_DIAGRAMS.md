# Database Relationship Diagrams

## Schema Relationships

### Complete ER Diagram

```
┌─────────────────────┐
│    fieldTypes       │
├─────────────────────┤
│ id (PK)             │
│ name (UNIQUE)       │◄─────────┐
│ description         │          │
│ createdAt           │          │
└─────────────────────┘          │
                                  │ 1:N
                                  │
                     ┌────────────────────────────────┐
                     │    dynamicFields (1,2)         │
                     ├────────────────────────────────┤
                     │ id (PK)                        │
                     │ label                          │
                     │ uniqueId (UNIQUE)              │
                     │ fieldTypeId (FK) ──────────────┘
                     │ categoryId (FK) ─┐
                     │ subcategoryId (FK) ────────┐
                     │ options (TEXT[])           │
                     │ validationRules (JSONB)    │
                     │ isRequired                  │
                     │ isHidden                    │
                     │ sortOrder                   │
                     │ isActive                    │
                     │ createdAt                   │
                     │ updatedAt                   │
                     └────────────────────────────────┘
                           ▲                  ▲
                           │ 1:N              │ 1:N
                           │                  │
                  ┌─────────────────┐  ┌──────────────────────┐
                  │   categories    │  │ subcategories (3)    │
                  ├─────────────────┤  ├──────────────────────┤
                  │ id (PK)         │  │ id (PK)              │
                  │ name (UNIQUE)   │  │ categoryId (FK) ◄────┤
                  │ code (UNIQUE)   │  │ name                 │
                  │ description     │  │ code (UNIQUE)        │
                  │ defaultPriority │  │ description          │
                  │ defaultTeamId   │  │ defaultPriority      │
                  │ slaHours        │  │ slaHours             │
                  │ sortOrder       │  │ sortOrder            │
                  │ isActive        │  │ isActive             │
                  │ createdAt       │  │ createdAt            │
                  │ updatedAt       │  │ updatedAt            │
                  └─────────────────┘  └──────────────────────┘
                           ▲                        ▲
                           │ 1:N                    │ ON DELETE CASCADE
                           │ (tickets)              │ (deletes dynamic fields)
                           │                        │
                  ┌─────────────────┐                │
                  │    tickets      │                │
                  ├─────────────────┤                │
                  │ id (PK)         │                │
                  │ category (FK) ──┴────────────────┘
                  │ subcategory     │
                  │ dynamicFields   │ ◄── JSONB with all field values
                  │ ...             │
                  └─────────────────┘

Legend:
(1,2,3) - Relationship numbers for reference
PK - Primary Key
FK - Foreign Key
N:M - One-to-Many relationship
UNIQUE - Unique constraint
ON DELETE CASCADE - Deletes related records when parent deleted
```

## Data Flow Diagrams

### 1. Form Field Loading (Category Selection)

```
User selects Category
        ↓
┌─────────────────────────────────────────┐
│ Client: handleCategoryChange()           │
│ - Updates form.watch("category")         │
│ - Extracts categoryId from CATEGORIES[]  │
└────────┬────────────────────────────────┘
         ↓
    useQuery(key: ['/api/categories', categoryId, 'fields'])
         ↓
┌────────────────────────────────────────────────────┐
│ Server: GET /api/categories/:categoryId/fields     │
│                                                     │
│ SELECT * FROM dynamicFields                        │
│ WHERE categoryId = :categoryId                      │
│   AND subcategoryId IS NULL          ← Only category-global
│   AND isActive = true                              │
│   AND isHidden = false                             │
│ ORDER BY sortOrder ASC                             │
└────────┬───────────────────────────────────────────┘
         ↓
┌──────────────────────────────────┐
│ dynamicFields[] returned          │
│ (Category-level fields only)      │
└────────┬─────────────────────────┘
         ↓
   dynamicFields.map(field =>
     <FormInput key={field.uniqueId} />
   )
         ↓
    Fields appear in form
```

### 2. Form Field Loading (Subcategory Selection)

```
User selects Subcategory
         ↓
┌─────────────────────────────────────────────┐
│ Client: handleSubcategoryChange()            │
│ - Updates form.watch("subcategory")          │
│ - Gets subcategoryId from selection          │
└────────┬────────────────────────────────────┘
         ↓
useQuery(key: ['/api/categories', categoryId, 'fields', subcategoryId])
         ↓
┌──────────────────────────────────────────────────────┐
│ Server: GET /api/categories/:categoryId/fields       │
│         ?subcategoryId=:subcategoryId                │
│                                                       │
│ SELECT * FROM dynamicFields                          │
│ WHERE categoryId = :categoryId                        │
│   AND (subcategoryId = :subcategoryId                │
│        OR subcategoryId IS NULL) ← All + specific    │
│   AND isActive = true                                │
│   AND isHidden = false                               │
│ ORDER BY sortOrder ASC                               │
└────────┬───────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────┐
│ dynamicFields[] returned (merged)                    │
│                                                      │
│ Combined:                                           │
│ 1. Category-global (subcategoryId = NULL)          │
│ 2. Subcategory-specific (subcategoryId = target)   │
│ 3. Deduped by uniqueId                             │
└────────┬────────────────────────────────────────────┘
         ↓
   dynamicFields.map(field => 
     <FormInput key={field.uniqueId} />
   )
         ↓
   All fields appear: global + category + subcategory
```

### 3. Ticket Submission

```
User fills form and clicks "Create Ticket"
         ↓
┌──────────────────────────────────┐
│ Client: form.onSubmit()           │
│                                   │
│ Collect all dynamic field values: │
│ dynamicFieldValues = {            │
│   field1_id: value1,              │
│   field2_id: value2,              │
│   ...                             │
│ }                                 │
└────────┬─────────────────────────┘
         ↓
┌──────────────────────────────────┐
│ Client: POST /api/tickets         │
│ body: {                           │
│   category: string,               │
│   subcategory: string,            │
│   dynamicFields: {...},  ◄── JSONB
│   title: string,                  │
│   ...                             │
│ }                                 │
└────────┬─────────────────────────┘
         ↓
┌────────────────────────────────────────┐
│ Server: POST /api/tickets              │
│                                         │
│ INSERT INTO tickets (                  │
│   category, subcategory,               │
│   dynamicFields, ...  ◄── JSONB column
│ ) VALUES (...)                         │
└────────┬───────────────────────────────┘
         ↓
┌──────────────────────────────────────┐
│ Database: tickets table               │
│ {                                     │
│   id: uuid,                           │
│   category: "Booking & Tech",         │
│   subcategory: "App/Website",         │
│   dynamicFields: {                    │
│     "issue_type": "Bug",              │
│     "platform": "iOS",                │
│     "device": "iPhone"                │
│   },                                  │
│   ...                                 │
│ }                                     │
└────────┬──────────────────────────────┘
         ↓
    Ticket created successfully
```

### 4. CSV Migration Flow

```
Startup or Manual Trigger:
POST /api/admin/migrate-fields
         ↓
┌─────────────────────────────────────────┐
│ Server: Ensure fieldTypes exist         │
│ INSERT INTO fieldTypes                  │
│   (Dropdown, Text, Textarea, ...)       │
│   ON CONFLICT DO NOTHING                │
└────────┬────────────────────────────────┘
         ↓
┌──────────────────────────────────────────┐
│ Server: Read CSV file                    │
│ fields_1765795119065.csv                 │
│ Parse 962 rows                           │
└────────┬─────────────────────────────────┘
         ↓
  For each CSV row:
         ↓
┌──────────────────────────────────────┐
│ Extract:                              │
│ - Category name                       │
│ - SubCategory name                    │
│ - Label, fieldType, options, etc.     │
└────────┬──────────────────────────────┘
         ↓
┌──────────────────────────────────────────────────┐
│ Look up or create:                               │
│ - category (by name)                             │
│ - subcategory (by categoryId + name)            │
│ - fieldType (by name)                            │
└────────┬──────────────────────────────────────────┘
         ↓
┌──────────────────────────────────────┐
│ UPSERT into dynamicFields             │
│ ON CONFLICT (uniqueId) DO UPDATE      │
│ (prevents duplicates on re-run)       │
└────────┬──────────────────────────────┘
         ↓
  962 fields migrated to database
```

## Query Patterns

### Pattern 1: Get All Fields for Category (No Subcategory Selected)

```sql
SELECT 
  df.id,
  df.label,
  df.uniqueId,
  df.fieldType,
  df.options,
  df.isRequired
FROM "dynamicFields" df
WHERE df.categoryId = $1        -- category ID
  AND df.subcategoryId IS NULL  -- Only global fields
  AND df.isActive = true
  AND df.isHidden = false
ORDER BY df.sortOrder ASC;

-- Result: All category-level fields, no subcategory-specific ones
```

### Pattern 2: Get All Fields for Subcategory (Maximum Fields)

```sql
SELECT 
  df.id,
  df.label,
  df.uniqueId,
  df.fieldType,
  df.options,
  df.isRequired
FROM "dynamicFields" df
WHERE df.categoryId = $1              -- category ID
  AND (df.subcategoryId = $2          -- subcategory ID
       OR df.subcategoryId IS NULL)  -- OR category-global fields
  AND df.isActive = true
  AND df.isHidden = false
ORDER BY df.sortOrder ASC, df.subcategoryId DESC;
  -- subcategoryId DESC ensures specific fields come after global

-- Result: Global + Category + Subcategory-specific fields (merged)
```

### Pattern 3: Query Tickets by Dynamic Field

```sql
-- Find all tickets with issue_type = 'Bug'
SELECT t.id, t.title, t.dynamicFields
FROM tickets t
WHERE t.dynamicFields->>'issue_type' = 'Bug'
  AND t.category = 'Booking & Technology';

-- Find tickets by platform
SELECT t.dynamicFields->>'platform' as platform, COUNT(*) as count
FROM tickets t
GROUP BY t.dynamicFields->>'platform'
ORDER BY count DESC;

-- Find tickets with complex dynamic field criteria
SELECT *
FROM tickets
WHERE (t.dynamicFields->>'priority_level')::integer > 5
  AND t.dynamicFields->>'affected_bookings' != '';
```

## Cascade Delete Behavior

### Scenario: Delete a Category

```sql
DELETE FROM categories WHERE id = 'category-uuid';

-- Cascades:
-- 1. Deletes all subcategories for this category
--    DELETE FROM subcategories WHERE categoryId = 'category-uuid'
--
-- 2. Deletes all dynamic fields for category and its subcategories
--    DELETE FROM dynamicFields WHERE categoryId = 'category-uuid'
--    DELETE FROM dynamicFields WHERE subcategoryId IN (...)
--
-- 3. Existing tickets keep their stored dynamicFields (JSON doesn't have FK)
--    But new tickets can't reference the deleted category
```

### Scenario: Delete a Subcategory

```sql
DELETE FROM subcategories WHERE id = 'subcategory-uuid';

-- Cascades:
-- 1. Deletes all dynamic fields for this subcategory
--    DELETE FROM dynamicFields WHERE subcategoryId = 'subcategory-uuid'
--
-- 2. Existing tickets keep their stored dynamicFields
--    But new tickets can't reference the deleted subcategory
```

## Performance Analysis

### Index Coverage

| Query | Index | Benefit |
|-------|-------|---------|
| Get fields by categoryId | `idx_dynamicFields_categoryId` | Fast lookup of ~10-50 fields |
| Get fields by subcategoryId | `idx_dynamicFields_subcategoryId` | Fast lookup of specific fields |
| Filter by isActive | `idx_dynamicFields_active` | Excludes inactive quickly |
| Get subcategories by categoryId | `idx_subcategories_categoryId` | Fast cascade on category select |

### Query Performance Estimates

| Query | Cost | Time |
|-------|------|------|
| Get all categories | ~10 rows | <1ms |
| Get subcategories for 1 category | ~5-10 rows | <1ms |
| Get fields for category + subcategory | ~20-50 rows | <1ms |
| Insert new field | — | <5ms |
| UPSERT 962 fields (migration) | — | ~5-10 seconds |

### Cache Strategy

```
React Query Caching:
├── ['/api/categories']
│   ├── staleTime: 5 minutes
│   ├── cacheTime: 30 minutes
│   └── Invalidate: Manual or on category update
│
├── ['/api/categories', categoryId, 'subcategories']
│   ├── staleTime: 5 minutes
│   ├── cacheTime: 30 minutes
│   └── Invalidate: When categoryId changes
│
└── ['/api/categories', categoryId, 'fields', subcategoryId]
    ├── staleTime: 5 minutes
    ├── cacheTime: 30 minutes
    └── Invalidate: When categoryId or subcategoryId changes
```

---

**Schema Version:** 2.0
**Last Updated:** December 16, 2024
