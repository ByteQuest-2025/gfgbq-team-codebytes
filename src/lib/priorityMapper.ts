/**
 * Priority Mapper - Source of Truth for Issue Type to Priority Mapping
 * 
 * CORE IDEA: Priority is assigned ONCE at report time and stored with the issue
 * so all official portals automatically see it.
 * 
 * No recalculation needed - priority is stored in DB at creation time.
 */

export type IssueType =
  | "Public Safety"
  | "Utilities"
  | "Sanitation"
  | "Environmental"
  | "Road & Infrastructure"
  | "Noise Complaint"
  | "Parks & Recreation"
  | "Other";

export type PriorityLevel =
  | "Urgent"
  | "High Priority"
  | "Medium Priority"
  | "Low Priority";

/**
 * Issue Type to Priority Mapping (SOURCE OF TRUTH)
 * 
 * This mapping is used at report time to assign priority.
 * Once assigned and stored in DB, priority never needs recalculation.
 */
export const issueTypeToPriority: Record<IssueType, PriorityLevel> = {
  "Public Safety": "Urgent",
  "Utilities": "High Priority",
  "Sanitation": "High Priority",
  "Environmental": "High Priority",
  "Road & Infrastructure": "Medium Priority",
  "Noise Complaint": "Medium Priority",
  "Parks & Recreation": "Low Priority",
  "Other": "Low Priority",
};

/**
 * Assigns priority level based on issue type
 * 
 * @param issueType - The type of issue
 * @returns The corresponding priority level
 * 
 * Usage: Called at report time to assign priority before saving to DB
 * 
 * @example
 * assignPriority("Public Safety") // Returns "Urgent"
 * assignPriority("Utilities") // Returns "High Priority"
 * assignPriority("Invalid Type") // Returns "Low Priority" (fallback)
 */
export function assignPriority(issueType: IssueType | string): PriorityLevel {
  // Normalize input: trim whitespace
  const normalizedType = issueType.trim() as IssueType;
  
  // Check if issue type exists in mapping
  if (normalizedType in issueTypeToPriority) {
    return issueTypeToPriority[normalizedType];
  }
  
  // Default to "Low Priority" for invalid/unknown issue types
  return "Low Priority";
}

/**
 * Get marker color based on priority (for map visualization)
 * 
 * @param priority - The priority level
 * @returns Color string for map markers
 */
export function getMarkerColor(priority: string): string {
  switch (priority) {
    case "Urgent":
      return "red";
    case "High Priority":
      return "orange";
    case "Medium Priority":
      return "yellow";
    case "Low Priority":
      return "green";
    default:
      return "gray";
  }
}



