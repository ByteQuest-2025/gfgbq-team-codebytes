-- Add priority column to issues table
ALTER TABLE public.issues
ADD COLUMN IF NOT EXISTS priority TEXT CHECK (priority IN ('Urgent', 'High Priority', 'Medium Priority', 'Low Priority'));

-- Add classification metadata columns for explainability
ALTER TABLE public.issues
ADD COLUMN IF NOT EXISTS classification_confidence NUMERIC(3, 2),
ADD COLUMN IF NOT EXISTS classification_explanation TEXT,
ADD COLUMN IF NOT EXISTS auto_classified BOOLEAN DEFAULT false;

-- Create index on priority for faster filtering
CREATE INDEX IF NOT EXISTS idx_issues_priority ON public.issues(priority);

-- Create index on issue_type and priority for dashboard queries
CREATE INDEX IF NOT EXISTS idx_issues_type_priority ON public.issues(issue_type, priority);

-- Function to get default priority based on issue type
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

-- Set default priority for existing issues based on their issue_type
UPDATE public.issues
SET priority = public.get_default_priority(issue_type)
WHERE priority IS NULL;

-- Set default priority for new issues (via trigger)
CREATE OR REPLACE FUNCTION public.set_default_priority()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Only set if priority is not already provided
  IF NEW.priority IS NULL THEN
    NEW.priority := public.get_default_priority(NEW.issue_type);
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger to set default priority on insert
DROP TRIGGER IF EXISTS trigger_set_default_priority ON public.issues;
CREATE TRIGGER trigger_set_default_priority
BEFORE INSERT ON public.issues
FOR EACH ROW
EXECUTE FUNCTION public.set_default_priority();

