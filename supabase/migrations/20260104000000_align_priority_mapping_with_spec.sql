-- Align Priority Mapping with Specification
-- Road & Infrastructure should be "Medium Priority" (not "Urgent")
-- This migration updates the database function and existing data

-- Update the get_default_priority function to match specification
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
    WHEN 'Road & Infrastructure' THEN 'Medium Priority'  -- Updated from Urgent
    WHEN 'Noise Complaint' THEN 'Medium Priority'
    WHEN 'Parks & Recreation' THEN 'Low Priority'
    WHEN 'Other' THEN 'Low Priority'
    ELSE 'Low Priority'
  END;
END;
$$;

-- Update existing Road & Infrastructure issues to Medium Priority
UPDATE public.issues
SET priority = 'Medium Priority'
WHERE issue_type = 'Road & Infrastructure' 
  AND priority = 'Urgent';

-- Update any issues with NULL priority based on their issue_type
UPDATE public.issues
SET priority = public.get_default_priority(issue_type)
WHERE priority IS NULL;

-- Update the trigger function to use the corrected mapping
CREATE OR REPLACE FUNCTION public.set_default_priority()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.priority IS NULL THEN
    NEW.priority := public.get_default_priority(NEW.issue_type);
  END IF;
  RETURN NEW;
END;
$$;

-- Verify the update
DO $$
DECLARE
  road_infrastructure_count INTEGER;
  medium_priority_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO road_infrastructure_count
  FROM public.issues
  WHERE issue_type = 'Road & Infrastructure';
  
  SELECT COUNT(*) INTO medium_priority_count
  FROM public.issues
  WHERE issue_type = 'Road & Infrastructure' AND priority = 'Medium Priority';
  
  RAISE NOTICE 'Road & Infrastructure issues: %', road_infrastructure_count;
  RAISE NOTICE 'Road & Infrastructure issues with Medium Priority: %', medium_priority_count;
END $$;



