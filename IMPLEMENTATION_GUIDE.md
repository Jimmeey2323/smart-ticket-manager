# Enterprise Grade - Enhanced Ticket System Implementation Guide

## Overview
This document outlines all the enhancements made to the ticket creation system to support:
1. **Rich Member Data Extraction** from Momence API
2. **Multi-Client Support** - Add multiple clients to a single ticket
3. **Advanced Class Selection** - Browse and select multiple classes from specific studios
4. **AI-Powered Sentiment Analysis** - Automatic tag generation and sentiment detection
5. **Enhanced Location Filtering** - Studio-specific class browsing

## Detailed Changes

### 1. Enhanced Momence API Service (`client/src/lib/momenceAPI.ts`)

#### New Features:
- **Location-Aware Session Fetching**: `getSessions()` now accepts optional `locationId` parameter
- **Location ID Mapping**: Helper method `getLocationId()` maps location names to IDs:
  - "Kwality House" → 9030
  - "Supreme HQ, Bandra" → 29821
  - "Pop Up", "Kenkere House" → no locationId (fetch all)
- **Enhanced Member Data**: `formatCustomerData()` includes:
  - memberID
  - First & Last Name
  - Email & Phone
  - Active Memberships (with start/end dates)
  - Past Memberships count
  - Recent Session Details
  - Session history
  - Membership status and details
  - Visit statistics

#### New Methods:
```typescript
getSessionsByLocation(locationName?: string): Promise<any>
getAllSessionsWithDetails(maxPages?: number, startsBefore?: string, locationId?: string): Promise<any[]>
getLocationId(locationName?: string): string | undefined
```

### 2. Enhanced Client Search Component (`client/src/components/client-search.tsx`)

#### Improvements:
- Displays comprehensive member information:
  - Member ID
  - Recent sessions count with last session date
  - Active memberships count
  - Past memberships count
  - Email and phone in formatted display
  - Avatar with initials fallback

### 3. New Session Search Component (`client/src/components/session-search.tsx`)

#### Features:
- **Studio Selection**: Dropdown with predefined locations
- **Location-Based Filtering**: Automatically fetches classes for selected location
- **Multi-Class Selection**: Add/remove multiple classes from a ticket
- **Rich Session Details** in dropdown:
  - Class name
  - Date and time
  - Duration
  - Teacher name
  - Availability (spots left)
  - Utilization rate
  - Description
- **Search Within Location**: Real-time search by class name or teacher
- **Visual Feedback**: Selected classes highlighted in green with removal button

#### Location Mapping:
- Kwality House, Kemps Corner → Momence ID: 9030
- Supreme HQ, Bandra → Momence ID: 29821
- Pop Up → No locationId (fetch all)
- Kenkere House → No locationId (fetch all)

### 4. Enhanced Ticket Form (`client/src/pages/ticket-new.tsx`)

#### Multi-Client Support:
- State: `selectedClients: any[]` instead of single `selectedClient`
- UI shows badge with client count
- Display selected clients with quick removal buttons
- Auto-populates first client's data into form fields

#### Multi-Session Support:
- State: `selectedSessions: SelectedSession[]`
- SessionSearch component with full integration
- UI shows badge with class count
- Selected classes displayed with removal capability

#### AI Sentiment Analysis:
- New state: `isAnalyzingSentiment: boolean`
- Pre-submission analysis of title + description
- Automatic tag generation
- Sentiment detection (positive/negative/neutral)
- Visual feedback with Sparkles icon during analysis

#### Enhanced Submit Flow:
```typescript
1. User fills form and clicks "Create Ticket"
2. Form validates
3. Sentiment analyzer processes title & description
4. Tags and sentiment automatically added to ticket data
5. Client and session IDs included in submission
6. Button shows "Analyzing..." during sentiment processing
```

### 5. Server-Side Enhancements

#### New API Endpoints:

**GET `/api/momence/sessions`**
- Query params:
  - `page` (default: 0)
  - `pageSize` (default: 200)
  - `locationId` (optional) - Filter by location
- Returns: Paginated list of sessions with details

**GET `/api/momence/sessions/:id`**
- Returns: Full details of a specific session
- Includes teacher info, URL streams, tags, etc.

**POST `/api/analyze-sentiment`**
- Body:
  ```json
  {
    "title": "string",
    "description": "string",
    "clientMood": "string (optional)"
  }
  ```
- Returns:
  ```json
  {
    "sentiment": "positive|negative|neutral",
    "confidence": 0-1,
    "tags": ["string"],
    "summary": "string"
  }
  ```

#### New Sentiment Analyzer Service (`server/sentimentAnalyzer.ts`)

Features:
- Uses OpenAI GPT-3.5-turbo for analysis
- Returns structured JSON with:
  - Sentiment classification
  - Confidence score (0-1)
  - 2-5 automatic tags for filtering
  - One-sentence summary
- Graceful fallback if OpenAI API unavailable
- Requires `OPENAI_API_KEY` environment variable

### 6. Environment Configuration

Required Environment Variables:

**Client-side (.env):**
```
VITE_MOMENCE_USERNAME=physique57mumbai1@gmail.com
VITE_MOMENCE_PASSWORD=Jimmeey@123
VITE_MOMENCE_API_BASE_URL=https://api.momence.com/api/v2
VITE_MOMENCE_AUTH_TOKEN=YXBpLTEzNzUyLUtYRTBPRFVQR3BTdkVrR1E6dlpPWkRGSHk0dEtOeWYzOHpvZ0JtQnRZSElSaTJldVo=
```

**Server-side (.env):**
```
MOMENCE_USERNAME=physique57mumbai1@gmail.com
MOMENCE_PASSWORD=Jimmeey@123
MOMENCE_API_BASE_URL=https://api.momence.com/api/v2
MOMENCE_AUTH_TOKEN=YXBpLTEzNzUyLUtYRTBPRFVQR3BTdkVrR1E6dlpPWkRGSHk0dEtOeWYzOHpvZ0JtQnRZSElSaTJldVo=
OPENAI_API_KEY=your-openai-api-key-here
```

## Data Flow

### Member Search & Selection:
1. User clicks "Search & Add Client Info" button
2. Opens ClientSearch modal
3. Types member name/email/phone
4. Momence API searches with 300ms debounce
5. User selects a member
6. Component fetches full member details (sessions, memberships)
7. Displays formatted data with member ID, memberships, recent sessions
8. User can add multiple members (each tracked separately)
9. Selected members show in blue cards with remove option

### Class Selection Workflow:
1. User clicks "Add Classes" button
2. Selects studio/location from dropdown
3. SessionSearch fetches classes for that location via `getSessions(locationId)`
4. User can search within location results
5. Selects one or more classes
6. Selected classes display in green cards
7. Each class shows: name, date, time, teacher, availability
8. User can remove individual classes or add more

### Ticket Submission with AI Analysis:
1. User fills form (title, description, category, etc.)
2. Clicks "Create Ticket"
3. Form validates
4. Triggers sentiment analysis API call
5. OpenAI analyzes title + description
6. Returns sentiment, confidence, tags, summary
7. Tags auto-populated (for quick filtering)
8. Sentiment stored with ticket
9. Ticket data includes:
   - clientIds: Array of selected member IDs
   - sessionIds: Array of selected class IDs
   - sessionNames: Array of class names
   - sentiment: Detected sentiment
   - tags: Auto-generated tags

## UI Components Updated

### ClientSearch
- **Location**: `client/src/components/client-search.tsx`
- **Props**: `onClientSelect`, `selectedClientId`, `className`
- **Usage**: Import and use in forms requiring member selection

### SessionSearch (NEW)
- **Location**: `client/src/components/session-search.tsx`
- **Props**: `onSessionsSelect`, `selectedSessions`, `location`
- **Returns**: Array of `SelectedSession` objects with formatted date/time
- **Usage**: Import and use in forms requiring class/session selection

### Ticket Form Updates
- **Location**: `client/src/pages/ticket-new.tsx`
- **State Changes**: 
  - `selectedClients` array (was single client)
  - `selectedSessions` array (new)
  - `selectedLocation` string (new)
  - `isAnalyzingSentiment` boolean (new)

## Testing Checklist

- [ ] **Momence Integration**
  - [ ] Search for clients by name/email/phone
  - [ ] Verify member ID, emails, phone numbers display correctly
  - [ ] Check active/past memberships display
  - [ ] Verify recent sessions show with dates
  
- [ ] **Multi-Client Support**
  - [ ] Add multiple clients to single ticket
  - [ ] Remove clients individually
  - [ ] Verify first client auto-populates form fields
  - [ ] Check client count badge updates
  
- [ ] **Class Selection**
  - [ ] Select each location type (Kwality House, Supreme HQ, Pop Up, Kenkere)
  - [ ] Verify classes load for each location
  - [ ] Search within location results
  - [ ] Add/remove multiple classes
  - [ ] Verify selected classes show correctly
  
- [ ] **Sentiment Analysis**
  - [ ] Submit ticket with title and description
  - [ ] Verify "Analyzing..." state during processing
  - [ ] Check tags are generated automatically
  - [ ] Verify sentiment detection works
  - [ ] Test with different tone titles/descriptions
  
- [ ] **Form Submission**
  - [ ] All client data sent with ticket
  - [ ] All session data sent with ticket
  - [ ] Sentiment and tags included
  - [ ] File attachments still work
  - [ ] Validation messages appear correctly

## Known Limitations & Future Enhancements

### Current Limitations:
1. Sentiment analysis requires OpenAI API key (optional feature)
2. Location ID mapping is hardcoded (could be dynamic from API)
3. Session fetching limited to 200 per page
4. No pagination UI for large result sets

### Future Enhancements:
1. Implement other AI sentiment services (local model, Azure, etc.)
2. Add past class/session history viewing
3. Multiple teacher/instructor assignment
4. Bulk operations on selected items
5. Advanced filtering by class type, time, teacher
6. Client membership renewal tracking
7. Class capacity warnings
8. Integration with user activity timeline

## Support & Debugging

### Common Issues:

**401/400 Errors on Member Search:**
- Verify MOMENCE_AUTH_TOKEN format (should be Base64)
- Check environment variables loaded correctly
- Verify Momence credentials in .env

**No Classes Showing:**
- Ensure location is selected
- Check MOMENCE_API_BASE_URL is correct
- Verify authentication tokens are valid

**Sentiment Analysis Not Working:**
- Confirm OPENAI_API_KEY is set
- Check OpenAI API quota and billing
- Review browser console for specific errors

### Debug Commands:
```bash
# Check environment variables
grep MOMENCE .env | head -5

# Verify API connectivity
curl -H "Authorization: Bearer YOUR_TOKEN" https://api.momence.com/api/v2/host/sessions

# Check OpenAI integration
curl -X POST https://api.openai.com/v1/chat/completions \
  -H "Authorization: Bearer YOUR_KEY" \
  -d '{"model":"gpt-3.5-turbo","messages":[{"role":"user","content":"test"}]}'
```

## File Summary

| File | Changes | Impact |
|------|---------|--------|
| `client/src/lib/momenceAPI.ts` | Added location params, new methods | Session fetching by location |
| `client/src/components/client-search.tsx` | Enhanced member data display | Richer client information |
| `client/src/components/session-search.tsx` | NEW COMPONENT | Class selection functionality |
| `client/src/pages/ticket-new.tsx` | Multi-client/session support, AI analysis | Core form enhancements |
| `server/routes.ts` | Added session endpoints, sentiment API | Backend support |
| `server/sentimentAnalyzer.ts` | NEW SERVICE | AI-powered analysis |

---

**Last Updated**: December 16, 2025
**Version**: 1.0.0
**Status**: Ready for Testing
