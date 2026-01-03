# Map Marker Click Implementation - Official Portal

## Overview
This document describes the implementation of marker click functionality for the official/admin portal's interactive map view.

## Implementation Details

### 1. Marker Click Detection
**Location:** `src/components/admin/IssueMap.tsx`

The marker click handler is implemented using Leaflet's event system:

```typescript
marker.on("click", (e) => {
  if (e.originalEvent && mapRef.current) {
    e.originalEvent.stopPropagation();
    e.originalEvent.preventDefault();
    
    // Close popup if open
    marker.closePopup();
    
    // Get marker's screen position
    const markerPoint = mapRef.current.latLngToContainerPoint([issue.latitude!, issue.longitude!]);
    
    // Calculate card position (above the marker, centered)
    const cardWidth = 400;
    const cardHeight = 300;
    const x = markerPoint.x - cardWidth / 2;
    const y = markerPoint.y - cardHeight - 50;
    
    // Ensure card stays within map bounds
    const mapBounds = mapContainerRef.current?.getBoundingClientRect();
    if (mapBounds) {
      const adjustedX = Math.max(10, Math.min(x, mapBounds.width - cardWidth - 10));
      const adjustedY = Math.max(10, Math.min(y, mapBounds.height - cardHeight - 10));
      
      setCardPosition({ x: adjustedX, y: adjustedY });
      setSelectedIssue(issue);
    }
  }
});
```

### 2. Detail Card Component
**Location:** `src/components/admin/IssueDetailCard.tsx`

The detail card displays all required information:

#### Required Fields Displayed:
- ✅ **Issue Title** - Prominently displayed at the top
- ✅ **Issue Description** - Full description with proper formatting
- ✅ **Issue Type** - Road & Infrastructure, Utilities, Sanitation, etc.
- ✅ **Priority Level** - Urgent, High Priority, Medium Priority, Low Priority (color-coded badges)
- ✅ **Reported Date & Time** - Formatted using date-fns (e.g., "Jan 3, 2025, 8:30 PM")
- ✅ **Current Status** - Open/Pending, In Progress, Resolved, Rejected (with status badges)
- ✅ **Zone / Location Details** - Location address and assigned zone/department

#### Attachment Handling:
- ✅ **Images** - Displayed inline with preview, clickable to view full size
- ✅ **Documents** - Download links with file type indicators (PDF, DOC, etc.)
- ✅ **Safe Handling** - Graceful fallback if attachment is missing or fails to load

### 3. Data Structure

#### Issue Interface:
```typescript
interface Issue {
  id: string;
  title: string;
  description?: string;
  issue_type: string;
  status: string;
  priority: string | null;
  latitude: number | null;
  longitude: number | null;
  location_address?: string | null;
  created_at?: string;
  assigned_department?: string | null;
  assigned_zone?: string | null;
  file_url?: string | null;
}
```

#### Data Flow:
1. Issues are fetched from Supabase in `OfficialDashboard.tsx`
2. Issues array is passed to `HomeTab` component
3. `HomeTab` passes issues to `IssueMap` component
4. `IssueMap` creates markers for each issue with valid coordinates
5. On marker click, the full issue object is stored in state
6. `IssueDetailCard` receives the issue and displays all details

### 4. User Experience Features

#### Card Display:
- ✅ Opens as overlay on map (Google Maps style)
- ✅ Positioned dynamically above the clicked marker
- ✅ Adjusts position to stay within map bounds
- ✅ Updates position when map is panned or zoomed
- ✅ Includes pointer/arrow pointing to marker

#### Dismissal:
- ✅ Close button (X) in top-right corner
- ✅ Clicking on map (outside marker/card) closes the card
- ✅ Card automatically updates when different marker is clicked

#### Dynamic Updates:
- ✅ Clicking a different marker immediately updates the card
- ✅ Card position recalculates on map move/zoom
- ✅ Smooth transitions between different issue views

### 5. Role-Based Access
**Location:** `src/pages/auth/OfficialDashboard.tsx`

The map view is only accessible to:
- Administrators
- Zone Officers
- Field Officers

Access is controlled via:
```typescript
// Filter issues based on role
if (roleData && (roleData.role === "zone_officer" || roleData.role === "field_officer")) {
  if (roleData.zone) {
    query = query.eq("assigned_zone", roleData.zone);
  }
  if (roleData.department) {
    query = query.eq("assigned_department", roleData.department);
  }
}
```

### 6. Attachment Display Logic

#### Image Attachments:
- Detects image file extensions: jpg, jpeg, png, gif, webp, svg
- Displays thumbnail preview (max-height: 256px)
- Clickable to view full image in new tab
- Includes "View Full Image" link
- Graceful error handling if image fails to load

#### Document Attachments:
- Detects document file extensions: pdf, doc, docx, etc.
- Shows appropriate icon (FileText for PDF, Download for others)
- Provides download link with file type label
- Opens in new tab for viewing

### 7. Example Flow

```
User Action: Official clicks on map marker
    ↓
Event Handler: marker.on("click") fires
    ↓
Position Calculation: Calculate card position above marker
    ↓
State Update: setSelectedIssue(issue) + setCardPosition({x, y})
    ↓
Component Render: IssueDetailCard receives issue data
    ↓
Display: Card appears on map with all issue details
    ↓
User Interaction: Official can:
    - View all issue information
    - View/download attachments
    - Click X to close
    - Click another marker to switch issues
    - Click map to close card
```

### 8. Technical Implementation Notes

#### Map Library:
- Uses Leaflet (OpenStreetMap) - already integrated
- No changes to existing map setup
- Leverages Leaflet's event system for click detection

#### State Management:
- Uses React useState for selected issue and card position
- State updates trigger re-renders automatically
- Cleanup on component unmount

#### Performance:
- Markers are created once on component mount
- Card position recalculated only on map move/zoom
- Image loading handled with error boundaries
- No unnecessary re-renders

### 9. Files Modified/Created

#### Created:
- `src/components/admin/IssueMap.tsx` - Map component with marker click handling
- `src/components/admin/IssueDetailCard.tsx` - Detail card component
- `src/components/admin/ErrorBoundary.tsx` - Error handling wrapper

#### Modified:
- `src/components/admin/HomeTab.tsx` - Integrated map component
- `src/pages/auth/OfficialDashboard.tsx` - Passes issues data to map

### 10. Testing Checklist

- ✅ Click marker → Card appears
- ✅ Card shows all required fields
- ✅ Priority level displayed correctly
- ✅ Status displayed correctly
- ✅ Date/time formatted correctly
- ✅ Image attachments display
- ✅ Document attachments show download link
- ✅ Close button works
- ✅ Click map closes card
- ✅ Click different marker updates card
- ✅ Card position updates on map move
- ✅ Card position updates on map zoom
- ✅ Card stays within map bounds
- ✅ Handles missing attachments gracefully
- ✅ Handles missing location data gracefully

## Summary

The implementation fully meets all requirements:
- ✅ Marker click detection
- ✅ Complete issue information display
- ✅ Priority level display
- ✅ Status display
- ✅ Date/time display
- ✅ Location/zone details
- ✅ Image attachment display
- ✅ Document attachment handling
- ✅ Dismissible card
- ✅ Dynamic updates
- ✅ Role-based access (official portal only)
- ✅ No UI redesign (uses existing components)
- ✅ Uses existing Leaflet/OpenStreetMap setup



