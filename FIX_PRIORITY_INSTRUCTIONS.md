# Fix Priority Assignment - Instructions

## Problem
Existing issues in the database are showing "Medium" priority for all issues, regardless of their issue type. This is because:
1. The priority column may not exist (migration not applied)
2. Existing issues don't have priority set
3. The database trigger may not be working correctly

## Solution

### Step 1: Apply the Migration

Run this SQL in your Supabase SQL Editor:

```sql
-- Fix Priority Assignment for All Issues
-- This migration ensures all issues have the correct priority based on their issue_type

-- Update the get_default_priority function to match TypeScript mapping exactly
CREATE OR REPLACE FUNCTION public.get_default_priority(_issue_type TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  RETURN CASE _issue_type
    WHEN 'Public Safety' THEN 'Urgent'
    WHEN 'Utilities' THEN 'High Priority'
    WHEN 'Sanitation' THEN 'High Priority'
    WHEN 'Environmental' THEN 'High Priority'
    WHEN 'Road & Infrastructure' THEN 'Medium Priority'
    WHEN 'Noise Complaint' THEN 'Medium Priority'
    WHEN 'Parks & Recreation' THEN 'Low Priority'
    WHEN 'Other' THEN 'Low Priority'
    ELSE 'Low Priority'
  END;
END;
$$;

-- Update ALL existing issues with correct priority based on their issue_type
UPDATE public.issues
SET priority = public.get_default_priority(issue_type)
WHERE priority IS NULL OR priority != public.get_default_priority(issue_type);

-- Ensure the trigger function always sets priority correctly
CREATE OR REPLACE FUNCTION public.set_default_priority()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Always set priority based on issue_type to ensure consistency
  IF NEW.issue_type IS NOT NULL THEN
    NEW.priority := public.get_default_priority(NEW.issue_type);
  END IF;
  RETURN NEW;
END;
$$;

-- Recreate the trigger to ensure it's active
DROP TRIGGER IF EXISTS trigger_set_default_priority ON public.issues;
CREATE TRIGGER trigger_set_default_priority
BEFORE INSERT OR UPDATE ON public.issues
FOR EACH ROW
EXECUTE FUNCTION public.set_default_priority();
```

### Step 2: Verify the Fix

After running the migration:

1. **Check existing issues**: All existing issues should now have the correct priority
2. **Test new issue**: Report a new issue and verify it gets the correct priority
3. **Check the UI**: The priority badges should now show the correct values

### Step 3: Expected Results

After applying the migration:

- **Public Safety** issues → **Urgent** (red badge)
- **Utilities** issues → **High Priority** (orange badge)
- **Sanitation** issues → **High Priority** (orange badge)
- **Environmental** issues → **High Priority** (orange badge)
- **Road & Infrastructure** issues → **Medium Priority** (yellow badge)
- **Noise Complaint** issues → **Medium Priority** (yellow badge)
- **Parks & Recreation** issues → **Low Priority** (green badge)
- **Other** issues → **Low Priority** (green badge)

### Troubleshooting

If priorities are still showing incorrectly:

1. **Check if migration was applied**: Run this query to check if the function exists:
   ```sql
   SELECT proname FROM pg_proc WHERE proname = 'get_default_priority';
   ```

2. **Manually update a test issue**: 
   ```sql
   UPDATE public.issues 
   SET priority = public.get_default_priority(issue_type) 
   WHERE id = 'your-issue-id';
   ```

3. **Check the issue_type values**: Make sure issue_type values match exactly:
   ```sql
   SELECT DISTINCT issue_type FROM public.issues;
   ```

4. **Verify trigger is active**:
   ```sql
   SELECT * FROM pg_trigger WHERE tgname = 'trigger_set_default_priority';
   ```

### Quick Fix Query

If you just want to quickly update all existing issues without running the full migration:

```sql
UPDATE public.issues
SET priority = CASE issue_type
  WHEN 'Public Safety' THEN 'Urgent'
  WHEN 'Utilities' THEN 'High Priority'
  WHEN 'Sanitation' THEN 'High Priority'
  WHEN 'Environmental' THEN 'High Priority'
  WHEN 'Road & Infrastructure' THEN 'Medium Priority'
  WHEN 'Noise Complaint' THEN 'Medium Priority'
  WHEN 'Parks & Recreation' THEN 'Low Priority'
  WHEN 'Other' THEN 'Low Priority'
  ELSE 'Low Priority'
END
WHERE priority IS NULL OR priority != CASE issue_type
  WHEN 'Public Safety' THEN 'Urgent'
  WHEN 'Utilities' THEN 'High Priority'
  WHEN 'Sanitation' THEN 'High Priority'
  WHEN 'Environmental' THEN 'High Priority'
  WHEN 'Road & Infrastructure' THEN 'Medium Priority'
  WHEN 'Noise Complaint' THEN 'Medium Priority'
  WHEN 'Parks & Recreation' THEN 'Low Priority'
  WHEN 'Other' THEN 'Low Priority'
  ELSE 'Low Priority'
END;
```



