# Design Guidelines: Physique 57 India - Ticket Management System

## Design Approach: Enterprise Design System

**Selected Approach:** Design System-Based (inspired by Linear, Notion, Asana)

**Justification:** This is a utility-focused, information-dense enterprise application where efficiency, learnability, and data clarity are paramount. The system requires consistent patterns for complex forms, data tables, dashboards, and multi-level navigation. Reference systems: Linear (for ticket/issue management patterns), Notion (for dynamic form interfaces), and enterprise design principles for data-heavy applications.

---

## Core Design Principles

1. **Information Density Over Decoration** - Maximize useful content per viewport
2. **Scannable Hierarchy** - Clear visual distinction between primary, secondary, and tertiary information
3. **Consistent Patterns** - Reusable components across all views
4. **Speed and Efficiency** - Minimal friction for repetitive tasks

---

## Typography System

**Font Stack:** Inter (Google Fonts) for UI, JetBrains Mono for ticket IDs/codes

**Hierarchy:**
- **Page Titles:** text-2xl (24px), font-semibold
- **Section Headers:** text-xl (20px), font-semibold  
- **Card/Panel Titles:** text-lg (18px), font-medium
- **Body Text:** text-sm (14px), font-normal
- **Labels:** text-xs (12px), font-medium, uppercase tracking-wide
- **Captions/Meta:** text-xs (12px), font-normal

---

## Layout & Spacing System

**Tailwind Spacing Primitives:** Standardize on 2, 4, 6, 8, 12, 16 units

**Application:**
- Component padding: p-4, p-6
- Section spacing: space-y-6, space-y-8
- Card gaps: gap-4, gap-6
- Page margins: px-6, py-8

**Grid System:**
- Dashboard cards: grid-cols-1 md:grid-cols-2 lg:grid-cols-4
- Form layouts: grid-cols-1 md:grid-cols-2 gap-4
- Ticket lists: Single column stack with dividers
- Tables: Full-width with horizontal scroll on mobile

**Container Widths:**
- Dashboard: max-w-7xl mx-auto
- Form pages: max-w-4xl mx-auto
- Ticket detail: max-w-5xl mx-auto

---

## Component Library

### Navigation
**Top Navigation Bar:**
- Fixed header with shadow-sm
- Logo left, navigation items center, user menu/notifications right
- Height: h-16
- Search bar integrated (expandable on mobile)

**Sidebar (Optional for multi-section navigation):**
- w-64 fixed on desktop, slide-out drawer on mobile
- Nested navigation for categories/teams
- Active state with subtle background treatment

### Dashboard Components
**Stats Cards:**
- Grid of 4 cards (responsive to 2 cols tablet, 1 col mobile)
- Large number display (text-3xl font-bold)
- Label below (text-sm)
- Icon top-right corner
- Compact: p-6

**Ticket List Cards:**
- Border-l-4 for priority indicator (width varies by priority)
- Ticket number prominent (font-mono text-sm)
- Title (text-base font-medium)
- Metadata row: studio, category, time (text-xs, flex gap-2)
- Status badge (rounded-full px-3 py-1 text-xs)
- Hover state with subtle background shift

### Forms
**Dynamic Ticket Creation:**
- Two-column layout on desktop (grid-cols-2)
- Category selector triggers subcategory + dynamic fields
- Required fields marked with asterisk
- Field groups with subtle borders and headings
- File upload zone with drag-drop visual
- Action buttons bottom-right (Cancel secondary, Submit primary)

**Input Fields:**
- Label above input (text-sm font-medium mb-1)
- Input height: h-10
- Focus ring treatment
- Error states with text-xs message below
- Dropdown menus with search for long lists (studios, trainers)

### Tables
**Ticket Management Table:**
- Sticky header row
- Alternating row background for readability
- Compact row height (px-4 py-3)
- Sortable columns (icon indicator)
- Checkbox column for bulk actions
- Action menu (3-dot) right column
- Responsive: horizontal scroll on mobile with pinned first column

**Column Priorities:**
- Desktop: Ticket #, Title, Category, Priority, Status, Assigned, Due Date, Actions
- Tablet: Ticket #, Title, Priority, Status, Actions
- Mobile: Ticket # + Title only, expand to view details

### Ticket Detail View
**Layout Structure:**
- Header section: Ticket number, title, status badge, priority indicator
- Metadata grid: 2-3 columns showing studio, category, client info, dates
- Main content area: Description, attachments
- Right sidebar (desktop): Assignment, SLA timer, quick actions
- Bottom section: Comments/activity timeline
- All sections use cards with border and p-6

**Activity Timeline:**
- Vertical line connector
- Chronological order (newest top)
- User avatar, action, timestamp
- Internal notes visually distinct from customer-facing comments

### Filters & Search
**Filter Panel:**
- Collapsible sidebar or top bar
- Multi-select dropdowns for: Status, Priority, Category, Studio, Team
- Date range picker
- "Active Filters" chips display with X to remove
- Clear all button

**Search:**
- Prominent search bar (h-10, min-w-64)
- Search by: ticket number, client name, keyword
- Live results dropdown

### Badges & Indicators
**Status Badges:** rounded-full, px-3, py-1, text-xs, font-medium
**Priority Indicators:** Border-left accent (4px width), or small dot indicator
**SLA Warning:** Visual timer/countdown, warning state when <4hrs remain

### Modals & Overlays
**Quick Actions Modal:**
- Center screen, max-w-md
- Title, content, action buttons bottom
- Backdrop blur-sm
- Close on backdrop click or X button

---

## Animations

**Minimal Use Only:**
- Smooth transitions for dropdowns (transition-all duration-200)
- Hover states with subtle scale (hover:scale-[1.02])
- Loading spinners for data fetch
- Toast notifications slide-in from top-right
- **No decorative animations** - focus on performance

---

## Accessibility

- All interactive elements keyboard navigable
- Focus indicators visible and consistent
- Form labels properly associated
- ARIA labels for icon-only buttons
- Table headers with scope attributes
- Toast notifications with role="alert"

---

## Images

**No hero images** - this is an internal tool, not marketing.

**Profile/User Avatars:** Circular (w-8 h-8 for lists, w-10 h-10 for detail views)

**Empty States:** Simple illustrations or icons for empty ticket lists, no results states

**Attachment Previews:** Thumbnail grid for images (w-20 h-20), file icons for documents