-- Update ALL existing issues with correct priority based on issue_type
-- This ensures all issues reflect the updated priority mapping

-- Update the get_default_priority function to match current mapping
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

-- CRITICAL: Update ALL existing issues with correct priority
-- This will fix all issues that have wrong or missing priority
UPDATE public.issues
SET priority = public.get_default_priority(issue_type)
WHERE priority IS NULL 
   OR priority != public.get_default_priority(issue_type);

-- Verify the update
DO $$
DECLARE
  total_issues INTEGER;
  updated_count INTEGER;
  road_infrastructure_urgent INTEGER;
  public_safety_urgent INTEGER;
  utilities_high INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_issues FROM public.issues;
  
  SELECT COUNT(*) INTO updated_count
  FROM public.issues
  WHERE priority = public.get_default_priority(issue_type);
  
  SELECT COUNT(*) INTO road_infrastructure_urgent
  FROM public.issues
  WHERE issue_type = 'Road & Infrastructure' AND priority = 'Urgent';
  
  SELECT COUNT(*) INTO public_safety_urgent
  FROM public.issues
  WHERE issue_type = 'Public Safety' AND priority = 'Urgent';
  
  SELECT COUNT(*) INTO utilities_high
  FROM public.issues
  WHERE issue_type = 'Utilities' AND priority = 'High Priority';
  
  RAISE NOTICE 'Total issues: %', total_issues;
  RAISE NOTICE 'Issues with correct priority: %', updated_count;
  RAISE NOTICE 'Road & Infrastructure → Urgent: %', road_infrastructure_urgent;
  RAISE NOTICE 'Public Safety → Urgent: %', public_safety_urgent;
  RAISE NOTICE 'Utilities → High Priority: %', utilities_high;
END $$;

-- Ensure trigger function is updated
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

