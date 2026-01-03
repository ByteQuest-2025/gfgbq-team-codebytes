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

-- Update ALL existing issues with correct priority based on their issue_type
-- This will fix any issues that have wrong or missing priority
UPDATE public.issues
SET priority = public.get_default_priority(issue_type)
WHERE priority IS NULL OR priority != public.get_default_priority(issue_type);

-- Ensure the trigger function also uses the updated mapping
CREATE OR REPLACE FUNCTION public.set_default_priority()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Always set priority based on issue_type to ensure consistency
  -- This overrides any manually set priority to match the mapping
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

