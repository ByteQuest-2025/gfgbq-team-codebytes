-- Update Priority Mapping: Road & Infrastructure → Urgent
-- This migration updates the priority function and fixes all existing issues

-- Update the get_default_priority function
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

-- Update ALL existing Road & Infrastructure issues to Urgent priority
UPDATE public.issues
SET priority = 'Urgent'
WHERE issue_type = 'Road & Infrastructure'
  AND (priority IS NULL OR priority != 'Urgent');

-- Update ALL existing issues with correct priority based on their issue_type
-- This ensures all issues have the correct priority according to the new mapping
UPDATE public.issues
SET priority = public.get_default_priority(issue_type)
WHERE priority IS NULL OR priority != public.get_default_priority(issue_type);

-- Ensure the trigger function uses the updated mapping
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

-- Verify the update
DO $$
DECLARE
  road_infrastructure_count INTEGER;
  urgent_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO road_infrastructure_count
  FROM public.issues
  WHERE issue_type = 'Road & Infrastructure';
  
  SELECT COUNT(*) INTO urgent_count
  FROM public.issues
  WHERE issue_type = 'Road & Infrastructure' AND priority = 'Urgent';
  
  RAISE NOTICE 'Road & Infrastructure issues: %', road_infrastructure_count;
  RAISE NOTICE 'Road & Infrastructure issues with Urgent priority: %', urgent_count;
END $$;

