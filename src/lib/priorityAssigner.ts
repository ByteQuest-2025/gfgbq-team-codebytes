/**
 * Priority Assignment Service for Civic Grievance Redressal System
 * 
 * This module provides deterministic priority assignment based solely on issue type.
 * No NLP, keywords, or severity detection - just a fixed mapping.
 */

// Issue Types
export type IssueType =
  | "Road & Infrastructure"
  | "Utilities"
  | "Sanitation"
  | "Public Safety"
  | "Parks & Recreation"
  | "Noise Complaint"
  | "Environmental"
  | "Other";

// Priority Levels
export type PriorityLevel = "Urgent" | "High Priority" | "Medium Priority" | "Low Priority";

/**
 * Issue Type to Priority Mapping
 * Fixed, deterministic mapping as per requirements
 */
const ISSUE_TYPE_PRIORITY_MAP: Record<IssueType, PriorityLevel> = {
  "Public Safety": "Urgent",
  "Road & Infrastructure": "Urgent",
  "Utilities": "High Priority",
  "Sanitation": "High Priority",
  "Environmental": "High Priority",
  "Noise Complaint": "Medium Priority",
  "Parks & Recreation": "Low Priority",
  "Other": "Low Priority",
};

/**
 * Assigns priority level based on issue type
 * 
 * @param issueType - The type of issue (string or enum)
 * @returns The corresponding priority level
 * 
 * Logic:
 * - Maps issue type to priority using fixed mapping table
 * - Invalid or unknown issue types default to "Low Priority"
 * - Case-sensitive matching (exact string match required)
 * 
 * @example
 * assignPriority("Public Safety") // Returns "Urgent"
 * assignPriority("Utilities") // Returns "High Priority"
 * assignPriority("Invalid Type") // Returns "Low Priority"
 */
export function assignPriority(issueType: string): PriorityLevel {
  // Normalize input: trim whitespace
  const normalizedType = issueType.trim();
  
  // Check if issue type exists in mapping
  if (normalizedType in ISSUE_TYPE_PRIORITY_MAP) {
    return ISSUE_TYPE_PRIORITY_MAP[normalizedType as IssueType];
  }
  
  // Default to "Low Priority" for invalid/unknown issue types
  return "Low Priority";
}

/**
 * Batch priority assignment for multiple issues
 * 
 * @param issueTypes - Array of issue types
 * @returns Array of corresponding priority levels
 * 
 * @example
 * assignPriorities(["Public Safety", "Utilities", "Parks & Recreation"])
 * // Returns ["Urgent", "High Priority", "Low Priority"]
 */
export function assignPriorities(issueTypes: string[]): PriorityLevel[] {
  return issueTypes.map(assignPriority);
}

/**
 * Get all valid issue types
 * 
 * @returns Array of all valid issue type strings
 */
export function getValidIssueTypes(): IssueType[] {
  return Object.keys(ISSUE_TYPE_PRIORITY_MAP) as IssueType[];
}

/**
 * Check if an issue type is valid
 * 
 * @param issueType - The issue type to validate
 * @returns True if the issue type is valid, false otherwise
 */
export function isValidIssueType(issueType: string): boolean {
  return issueType.trim() in ISSUE_TYPE_PRIORITY_MAP;
}

/**
 * Get priority mapping summary
 * Useful for documentation or debugging
 * 
 * @returns Object mapping all issue types to their priorities
 */
export function getPriorityMapping(): Record<string, PriorityLevel> {
  return { ...ISSUE_TYPE_PRIORITY_MAP };
}

