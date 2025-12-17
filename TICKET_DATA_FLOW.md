# Ticket System Data Flow Documentation

## 1. DYNAMIC FIELDS DATA FLOW

### Where Dynamic Fields Come From

```
CSV File
  ↓
attached_assets/fields_1765795119065.csv
  ↓
Server Endpoint: GET /api/field-mapping (server/routes.ts:438)
  ↓
Parses CSV and converts to nested structure:
{
  "Booking & Technology": {
    "App/Website Issues": [
      { label: "Issue Type", fieldType: "Dropdown", uniqueId: "BT-APP-001", ... },
      { label: "Platform", fieldType: "Dropdown", uniqueId: "BT-APP-002", ... }
    ],
    "Global": [
      { label: "Reported By", fieldType: "Dropdown", uniqueId: "BT-GLB-001", ... }
    ]
  },
  "Global": {
    "Global": [
      { label: "Ticket ID", fieldType: "Auto-generated", ... },
      { label: "Client Name", fieldType: "Text", ... }
    ]
  }
}
  ↓
Client Cache (React Query)
  ↓
Form dynamicFields useMemo (line 140)
  ↓
Displays dynamic fields in Form
```

### CSV Structure

**File Location:** `/Users/jimmeeygondaa/Enterprise-Grade/attached_assets/fields_1765795119065.csv`

**Key Columns:**
- `Category` - Main category (e.g., "Booking & Technology", "Global")
- `Sub Category` - Subcategory (e.g., "App/Website Issues")
- `Label` - Display name shown to user
- `Field Type` - Input type: Text, Dropdown, DateTime, Date, Email, Phone, Long Text, Checkbox, File Upload
- `Unique ID` - Internal identifier (e.g., "BT-APP-001")
- `Description` - Helper text shown below field
- `Options/Other Details` - For dropdowns: pipe-separated values (e.g., "iOS|Android|Web")
- `Is Required` - "Yes" or "No"
- `Is Hidden` - "Yes" or "No"

### Server Endpoint Details

**Endpoint:** `GET /api/field-mapping`
- **Location:** `server/routes.ts` line 438
- **Authentication:** None (public endpoint)
- **Response Format:** Nested structure organized by Category → SubCategory → Fields Array
- **Caching:** React Query caches the result with key `['/api/field-mapping']`

### Client-Side Filtering Logic

**Location:** `client/src/pages/ticket-new.tsx` line 140

The `dynamicFields` useMemo hook:

1. **Collects all fields** from the nested mapping structure
2. **Tracks metadata** for each field (_category, _subcategory)
3. **Filters based on selection:**
   - Always show: Global → Global fields
   - When category selected: Show category + global fields
   - When subcategory selected: Show category global + subcategory-specific + global fields
4. **Removes duplicates** and hidden fields
5. **Returns filtered array** for rendering

**Debug Output:** Console logs show:
```
[DynamicFields Debug] { 
  selectedCategory, 
  selectedSubcategory,
  globalFieldsCount,
  categoryGlobalFieldsCount,
  subcategoryFieldsCount,
  totalBeforeFilter
}
```

---

## 2. TICKET DATA SAVING FLOW

### Complete Ticket Creation Flow

```
User fills form
  ↓
Clicks "Create Ticket" button
  ↓
Form validates with React Hook Form + Zod schema
  ↓
Calls onSubmit() (line 308)
  ↓
Analyzes sentiment via OpenAI (optional)
  ↓
Enriches data with sentiment tags and client/session IDs
  ↓
Calls createTicketMutation.mutate(enrichedData)
  ↓
mutationFn: POST to /api/tickets (line 268)
  ↓
Server: POST /api/tickets (server/routes.ts:197)
  ↓
Validates with insertTicketSchema
  ↓
storage.createTicket() (server/storage.ts:275)
  ↓
Drizzle ORM insert to PostgreSQL
  ↓
Creates ticket history entry
  ↓
Response: 201 Created + ticket JSON
  ↓
Client: Toast notification
  ↓
Redirect to /tickets page
```

### Data Structure Sent to Server

```typescript
POST /api/tickets
Content-Type: application/json

{
  studioId: "studio-id",
  category: "Booking & Technology",
  subcategory: "App/Website Issues",
  priority: "high",
  title: "App crashes on login",
  description: "User reports app crashes...",
  customerName: "John Doe",
  customerEmail: "john@example.com",
  customerPhone: "+91-9999999999",
  customerMembershipId: "member-123",
  customerStatus: "active",
  clientMood: "frustrated",
  incidentDateTime: "2025-12-16T10:30:00",
  
  // AI-generated fields
  sentiment: "negative",
  aiTags: ["app-crash", "urgent", "login"],
  sentimentScore: 0.85,
  
  // Multi-client and multi-session support
  clientIds: ["member-1", "member-2"],
  sessionIds: ["session-1", "session-2"],
  sessionNames: ["Yoga Class", "Pilates Class"],
  
  // Dynamic fields specific to subcategory
  dynamicFields: {
    "BT-APP-001": "App Crash",           // Issue Type
    "BT-APP-002": "iOS App",              // Platform
    "BT-APP-003": "iPhone 14 Pro",        // Device
    "GLB-006": "John Doe",                // Client Name (also top-level)
    "BT-GLB-001": "John Smith"            // Custom field
  },
  
  // Legacy fields (for backward compatibility)
  trainer: "yoga-trainer-1",
  className: "Morning Yoga"
}
```

### Database: Tickets Table Schema

**Location:** `shared/schema.ts` line 100

**Table Name:** `public.tickets`

**Columns:**

| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Auto-generated unique ID |
| ticketNumber | VARCHAR(50) | Human-readable ticket number (e.g., "TKT-251216-1234") |
| studioId | VARCHAR | Reference to studio |
| customerName | VARCHAR(255) | Client name |
| customerEmail | VARCHAR | Client email |
| customerPhone | VARCHAR | Client phone |
| customerMembershipId | VARCHAR | Momence member ID |
| customerStatus | VARCHAR | Active/Inactive/New/Trial/Guest |
| category | VARCHAR(255) | Main category |
| subcategory | VARCHAR(255) | Sub-category |
| priority | VARCHAR(50) | low/medium/high/critical |
| status | VARCHAR(50) | new/open/in-progress/resolved/closed |
| title | VARCHAR(500) | Ticket title |
| description | TEXT | Detailed description |
| reportedByUserId | VARCHAR | User who created ticket |
| assignedToUserId | VARCHAR | Assigned staff member |
| assignedTeamId | VARCHAR | Assigned team |
| dueDate | TIMESTAMP | Due date for resolution |
| resolvedAt | TIMESTAMP | When marked resolved |
| closedAt | TIMESTAMP | When marked closed |
| resolutionNotes | TEXT | Resolution summary |
| **aiTags** | TEXT[] | **Auto-generated tags** (e.g., ["urgent", "app-crash"]) |
| **sentimentScore** | REAL | **AI sentiment score** (0-1) |
| clientMood | VARCHAR | Client mood (Calm/Frustrated/Angry/etc) |
| autoAssigned | BOOLEAN | Auto-assignment flag |
| escalationLevel | INTEGER | 0-5 escalation level |
| slaBreached | BOOLEAN | SLA breach flag |
| followUpRequired | BOOLEAN | Follow-up needed |
| actionTaken | TEXT | Action summary |
| **dynamicFields** | JSONB | **All dynamic fields as JSON** |
| incidentDateTime | TIMESTAMP | When incident occurred |
| createdAt | TIMESTAMP | Ticket creation time |
| updatedAt | TIMESTAMP | Last update time |

### Indexes for Performance

```sql
idx_tickets_status      -- ON status
idx_tickets_priority    -- ON priority
idx_tickets_category    -- ON category
idx_tickets_studio      -- ON studioId
```

### Server Processing: POST /api/tickets

**Location:** `server/routes.ts` line 197

```typescript
1. Authenticate user (isAuthenticated middleware)
2. Parse request body with insertTicketSchema validation
3. Extract userId from JWT token
4. Call storage.createTicket() with:
   - All validated ticket data
   - Add reportedByUserId = userId
5. Create ticket history entry with:
   - ticketId
   - changedByUserId = userId
   - fieldChanged = 'created'
   - newValue = 'Ticket created'
6. Return 201 + ticket JSON
```

### Database Operations: storage.createTicket()

**Location:** `server/storage.ts` line 275

```typescript
async createTicket(ticket: InsertTicket): Promise<Ticket> {
  const ticketNumber = generateTicketNumber();  // e.g., "TKT-251216-0001"
  const [newTicket] = await db
    .insert(tickets)
    .values({ ...ticket, ticketNumber })
    .returning();  // Returns full ticket object
  return newTicket;
}
```

### Data Validation: Zod Schema

**Location:** `shared/schema.ts` line 248

```typescript
insertTicketSchema = createInsertSchema(tickets)
  .omit({
    id: true,              // Auto-generated
    ticketNumber: true,    // Server-generated
    createdAt: true,       // Server-generated
    updatedAt: true        // Server-generated
  })
  // Additional validations...
```

---

## 3. DYNAMIC FIELDS IN TICKETS

### How Dynamic Fields Are Stored

**Storage Method:** JSONB column in PostgreSQL

```sql
dynamicFields JSONB  -- Stores all custom field values
```

**Example Data:**

```json
{
  "BT-APP-001": "App Crash",
  "BT-APP-002": "iOS App",
  "BT-APP-003": "iPhone 14 Pro",
  "BT-GLB-001": "Support Team",
  "GLB-014": "Frustrated"
}
```

### Dynamic Field Extraction in Form

**Location:** `client/src/pages/ticket-new.tsx` line 254

```typescript
dynamicFields: (() => {
  const dyn: Record<string, any> = {};
  (dynamicFields || []).forEach((f: any) => {
    const key = f.uniqueId || f.label;  // Use unique ID as key
    const val = (data as any)[key];
    if (val !== undefined && val !== "") {
      dyn[key] = val;  // Only include filled fields
    }
  });
  // Keep legacy trainer/className mapping
  if ((data as any).trainer) dyn.trainer = (data as any).trainer;
  if ((data as any).className) dyn.className = (data as any).className;
  return dyn;
})()
```

### Retrieving Dynamic Fields from Ticket

**When fetching a ticket:**

```typescript
// Get ticket from database
const ticket = await storage.getTicket(id);

// Access dynamic fields
const dynamicFields = ticket.dynamicFields;  // JSONB object

// Example:
console.log(dynamicFields["BT-APP-001"]);  // "App Crash"
console.log(dynamicFields["BT-APP-002"]);  // "iOS App"
```

### Displaying Dynamic Fields in Ticket Detail

The `dynamicFields` JSONB can be:
- Displayed as key-value pairs
- Filtered by field metadata (labels, descriptions)
- Updated and re-saved
- Searched using JSONB operators

---

## 4. COMPLETE DATA JOURNEY EXAMPLE

### Scenario: Create "App Crash" Ticket

```
1. USER ACTION
   └─ Selects Category: "Booking & Technology"
   
2. CLIENT-SIDE FETCH
   └─ Dynamic fields API called (if not cached)
   └─ CSV parsed and organized by category/subcategory
   └─ Category "Booking & Technology" → "Global" fields loaded
   
3. USER ACTION
   └─ Selects Subcategory: "App/Website Issues"
   
4. CLIENT-SIDE RENDER
   └─ dynamicFields.filter() runs
   └─ Shows:
      ├─ Global fields (Ticket ID, Client Name, etc.)
      ├─ Category global fields
      └─ Subcategory fields (Issue Type, Platform, Device)
      
5. USER FILLS FORM
   ├─ Ticket Title: "App crashes on login"
   ├─ Description: "User reports..."
   ├─ Issue Type (dropdown): "App Crash"
   ├─ Platform (dropdown): "iOS App"
   ├─ Device: "iPhone 14"
   ├─ Client: John Doe (from Momence search)
   └─ Clicks "Create Ticket"
   
6. CLIENT-SIDE PROCESSING
   ├─ Form validation passes
   ├─ Calls sentiment analyzer:
   │  └─ OpenAI analyzes title + description
   │  └─ Returns: sentiment="negative", tags=["crash","urgent"]
   ├─ Enriches data with:
   │  ├─ AI tags
   │  ├─ Client IDs
   │  ├─ Session IDs
   │  └─ Dynamic field values
   └─ Sends POST /api/tickets
   
7. SERVER PROCESSING
   ├─ Validates with Zod schema
   ├─ Generates ticket number: "TKT-251216-0001"
   ├─ Stores in PostgreSQL:
   │  ├─ title: "App crashes on login"
   │  ├─ priority: "high"
   │  ├─ category: "Booking & Technology"
   │  ├─ subcategory: "App/Website Issues"
   │  ├─ status: "new"
   │  ├─ aiTags: ["crash", "urgent"]
   │  ├─ sentimentScore: 0.87
   │  └─ dynamicFields: {
   │       "BT-APP-001": "App Crash",
   │       "BT-APP-002": "iOS App",
   │       "BT-APP-003": "iPhone 14"
   │     }
   ├─ Creates history entry
   └─ Returns 201 + ticket JSON
   
8. CLIENT-SIDE RESPONSE
   ├─ Shows toast: "Ticket created successfully"
   ├─ Invalidates tickets cache
   └─ Redirects to /tickets page
   
9. TICKET NOW IN DATABASE
   ├─ Searchable by ticket number
   ├─ Filterable by category/priority/status
   ├─ Has AI tags for classification
   ├─ Has sentiment score for analysis
   ├─ Dynamic fields stored for reporting
   └─ Ready for assignment and resolution
```

---

## 5. TECHNICAL SUMMARY TABLE

| Layer | Component | Location | Purpose |
|-------|-----------|----------|---------|
| **Data Source** | CSV File | `attached_assets/fields_1765795119065.csv` | Dynamic field definitions |
| **API Fetch** | Field Mapping Endpoint | `server/routes.ts:438` | Parses CSV → JSON |
| **Client Caching** | React Query | `client/src/pages/ticket-new.tsx:137` | Caches field mapping |
| **Form Logic** | dynamicFields useMemo | `client/src/pages/ticket-new.tsx:140` | Filters fields by category/subcategory |
| **Form Rendering** | Dynamic Fields Section | `client/src/pages/ticket-new.tsx:530` | Displays form inputs based on field types |
| **Data Collection** | Form Submit Handler | `client/src/pages/ticket-new.tsx:308` | Gathers all form data including dynamic fields |
| **AI Enhancement** | Sentiment Analyzer | `server/sentimentAnalyzer.ts` | Generates tags and sentiment score |
| **API Submission** | Ticket Creation Endpoint | `server/routes.ts:197` | Receives and validates ticket data |
| **Data Processing** | Storage Layer | `server/storage.ts:275` | Persists ticket to database |
| **Database** | PostgreSQL tickets Table | `shared/schema.ts:100` | Stores complete ticket data |
| **JSON Storage** | JSONB Column | `dynamicFields` column | Flexible storage of dynamic fields |

---

## 6. QUERYING TICKETS WITH DYNAMIC FIELDS

### Example: Find tickets where Issue Type = "App Crash"

```sql
SELECT * FROM tickets
WHERE dynamicFields @> '{"BT-APP-001": "App Crash"}'
AND category = 'Booking & Technology'
AND subcategory = 'App/Website Issues'
ORDER BY createdAt DESC;
```

### Example: Get all tickets by sentiment

```sql
SELECT aiTags, COUNT(*) as count
FROM tickets
WHERE sentimentScore > 0.7
GROUP BY aiTags
ORDER BY count DESC;
```

### Example: Update dynamic field value

```typescript
await storage.updateTicket(ticketId, {
  dynamicFields: {
    ...existingTicket.dynamicFields,
    "BT-APP-001": "Updated Value"
  }
});
```

---

This is the complete data flow for dynamic fields and ticket creation in the system!
