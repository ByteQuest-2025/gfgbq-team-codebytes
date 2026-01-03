-- QUICK FIX: Update all existing issues with correct priority
-- Copy and paste this entire script into Supabase SQL Editor and run it

-- Update ALL issues with correct priority based on their issue_type
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

-- Verify the update worked
SELECT 
  issue_type,
  priority,
  COUNT(*) as count
FROM public.issues
GROUP BY issue_type, priority
ORDER BY issue_type, priority;

