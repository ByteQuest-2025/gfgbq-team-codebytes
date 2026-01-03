# Fix Priority Display in Administrator Portal

## Problem
Priority levels are still showing as "Medium" in the administrator portal even though the code is correct. This is because existing issues in the database have old priority values.

## Root Cause
- The code correctly fetches and displays priority from the database
- The database still contains old priority values from before the mapping was updated
- New issues get correct priority, but existing issues need to be updated

## Solution

### Step 1: Apply Database Migration

Run this SQL in your Supabase SQL Editor:

```sql
-- Update ALL existing issues with correct priority based on issue_type
UPDATE public.issues
SET priority = CASE issue_type
  WHEN 'Public Safety' THEN 'Urgent'
  WHEN 'Road & Infrastructure' THEN 'Urgent'
  WHEN 'Utilities' THEN 'High Priority'
  WHEN 'Sanitation' THEN 'High Priority'
  WHEN 'Environmental' THEN 'High Priority'
  WHEN 'Noise Complaint' THEN 'Medium Priority'
  WHEN 'Parks & Recreation' THEN 'Low Priority'
  WHEN 'Other' THEN 'Low Priority'
  ELSE 'Low Priority'
END
WHERE priority IS NULL 
   OR priority != CASE issue_type
  WHEN 'Public Safety' THEN 'Urgent'
  WHEN 'Road & Infrastructure' THEN 'Urgent'
  WHEN 'Utilities' THEN 'High Priority'
  WHEN 'Sanitation' THEN 'High Priority'
  WHEN 'Environmental' THEN 'High Priority'
  WHEN 'Noise Complaint' THEN 'Medium Priority'
  WHEN 'Parks & Recreation' THEN 'Low Priority'
  WHEN 'Other' THEN 'Low Priority'
  ELSE 'Low Priority'
END;

-- Update the database function
CREATE OR REPLACE FUNCTION public.get_default_priority(_issue_type TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  RETURN CASE _issue_type
    WHEN 'Public Safety' THEN 'Urgent'
    WHEN 'Road & Infrastructure' THEN 'Urgent'
    WHEN 'Utilities' THEN 'High Priority'
    WHEN 'Sanitation' THEN 'High Priority'
    WHEN 'Environmental' THEN 'High Priority'
    WHEN 'Noise Complaint' THEN 'Medium Priority'
    WHEN 'Parks & Recreation' THEN 'Low Priority'
    WHEN 'Other' THEN 'Low Priority'
    ELSE 'Low Priority'
  END;
END;
$$;
```

### Step 2: Refresh Browser

After running the migration:
1. Refresh the administrator portal page
2. All issues should now show correct priority levels

## Expected Results After Migration

- **Road & Infrastructure** issues → **Urgent** (red badge)
- **Public Safety** issues → **Urgent** (red badge)
- **Utilities** issues → **High Priority** (orange badge)
- **Sanitation** issues → **High Priority** (orange badge)
- **Environmental** issues → **High Priority** (orange badge)
- **Noise Complaint** issues → **Medium Priority** (yellow badge)
- **Parks & Recreation** issues → **Low Priority** (green badge)
- **Other** issues → **Low Priority** (green badge)

## Verification

After applying the migration, check:

1. **Dashboard Tab**: Recent reports should show correct priority badges
2. **Reports Tab**: All issues should show correct priority
3. **Home Tab**: Urgent issues count should be accurate

## Code Status

✅ **Code is correct** - All components properly:
- Fetch priority from database (`select("*")` includes priority)
- Display priority using `getPriorityBadge(issue.priority)`
- Support all priority levels (Urgent, High Priority, Medium Priority, Low Priority)

The only issue is the database needs to be updated with the new priority values.

