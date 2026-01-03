# Duplicate Detection System

## Overview

The duplicate detection system prevents duplicate issue submissions by checking if a similar issue (same type) has already been reported at the same location (within 30 meters).

## How It Works

### Detection Criteria

A duplicate is detected when **ALL** of the following conditions are met:

1. **Same Issue Type**: Both issues must have the exact same issue type
2. **Same Location**: Both issues must be within 30 meters of each other
3. **Valid Coordinates**: Both issues must have valid latitude and longitude

### Detection Rules

- ✅ **Same issue type + Same location (within 30m)** → **DUPLICATE**
- ❌ **Different issue type + Same location** → **NOT duplicate**
- ❌ **Same issue type + Different location (>30m)** → **NOT duplicate**
- ❌ **Missing location** → **NOT duplicate** (cannot check)

## Technical Details

### Distance Calculation

Uses the **Haversine formula** to calculate the great-circle distance between two points on Earth:

```
distance = 2 × R × arcsin(√(sin²(Δlat/2) + cos(lat1) × cos(lat2) × sin²(Δlon/2)))
```

Where:
- R = 6,371,000 meters (Earth's radius)
- Δlat = difference in latitude
- Δlon = difference in longitude

### Detection Radius

- **Default Radius**: 30 meters
- **Configurable**: Can be adjusted in `duplicateDetector.ts`

## Usage

### Basic Duplicate Check

```typescript
import { checkForDuplicates } from "@/lib/duplicateDetector";

const result = await checkForDuplicates(
  "Road & Infrastructure", // Issue type
  13.135552,                // Latitude
  80.255726,                // Longitude
);

if (result.isDuplicate) {
  console.log("Duplicate found:", result.duplicateIssues);
  console.log("Message:", result.message);
}
```

### Check Two Issues

```typescript
import { areIssuesDuplicates } from "@/lib/duplicateDetector";

const isDuplicate = areIssuesDuplicates(
  "Utilities",      // Issue type 1
  13.135552,        // Lat 1
  80.255726,        // Lon 1
  "Utilities",       // Issue type 2
  13.135553,        // Lat 2
  80.255727,        // Lon 2
);
```

## Integration

The duplicate detection is automatically integrated into the issue submission flow:

1. **Before Submission**: System checks for duplicates
2. **If Duplicate Found**: Shows warning message to user
3. **User Choice**: User can proceed or cancel
4. **Still Allowed**: Duplicate detection is a warning, not a blocker

## Example Scenarios

### Scenario 1: Duplicate Detected ✅

**Issue 1:**
- Type: "Road & Infrastructure"
- Location: 13.135552, 80.255726

**Issue 2:**
- Type: "Road & Infrastructure"
- Location: 13.135553, 80.255727 (5 meters away)

**Result**: ✅ Duplicate detected (same type, within 30m)

### Scenario 2: Not a Duplicate ❌

**Issue 1:**
- Type: "Road & Infrastructure"
- Location: 13.135552, 80.255726

**Issue 2:**
- Type: "Utilities"
- Location: 13.135552, 80.255726 (same location)

**Result**: ❌ Not a duplicate (different issue type)

### Scenario 3: Not a Duplicate ❌

**Issue 1:**
- Type: "Road & Infrastructure"
- Location: 13.135552, 80.255726

**Issue 2:**
- Type: "Road & Infrastructure"
- Location: 13.136000, 80.256000 (50 meters away)

**Result**: ❌ Not a duplicate (more than 30m away)

## API Reference

### `checkForDuplicates()`

Checks for duplicate issues in the database.

**Parameters:**
- `issueType: string` - The issue type to check
- `latitude: number | null` - Latitude of the issue location
- `longitude: number | null` - Longitude of the issue location
- `excludeIssueId?: string` - Optional issue ID to exclude (for updates)

**Returns:**
```typescript
{
  isDuplicate: boolean;
  duplicateIssues: Array<{
    id: string;
    title: string;
    issue_type: string;
    status: string;
    created_at: string;
    distance: number; // Distance in meters
  }>;
  message?: string;
}
```

### `areIssuesDuplicates()`

Checks if two issues are duplicates (synchronous).

**Parameters:**
- `issueType1: string` - Issue type of first issue
- `lat1: number | null` - Latitude of first issue
- `lon1: number | null` - Longitude of first issue
- `issueType2: string` - Issue type of second issue
- `lat2: number | null` - Latitude of second issue
- `lon2: number | null` - Longitude of second issue

**Returns:** `boolean`

### `getDuplicateDetectionRadius()`

Returns the duplicate detection radius in meters.

**Returns:** `number` (default: 30)

## Testing

Run test cases to verify behavior:

```typescript
import { runDuplicateTests } from "@/lib/duplicateDetector.test";

runDuplicateTests(); // Displays all test results
```

## Configuration

To change the detection radius, update the constant in `duplicateDetector.ts`:

```typescript
const DUPLICATE_DETECTION_RADIUS_METERS = 30; // Change this value
```

## Notes

- Duplicate detection requires valid GPS coordinates
- The system checks against all existing issues in the database
- Duplicate detection is a warning, not a blocker (users can still submit)
- The check is performed before database insertion
- Distance calculations use the Haversine formula for accuracy



