/**
 * Duplicate Detection Service for Civic Grievance Redressal System
 * 
 * Detects duplicate issues based on:
 * - Same issue type
 * - Same location (within 30 meters radius)
 */

import { supabase } from "@/integrations/supabase/client";

// Duplicate detection radius in meters
const DUPLICATE_DETECTION_RADIUS_METERS = 30;

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in meters
 * 
 * @param lat1 - Latitude of first point
 * @param lon1 - Longitude of first point
 * @param lat2 - Latitude of second point
 * @param lon2 - Longitude of second point
 * @returns Distance in meters
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Earth's radius in meters
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Duplicate Detection Result
 */
export interface DuplicateDetectionResult {
  isDuplicate: boolean;
  duplicateIssues: Array<{
    id: string;
    title: string;
    issue_type: string;
    status: string;
    created_at: string;
    distance: number; // Distance in meters
  }>;
  message?: string;
}

/**
 * Check for duplicate issues
 * 
 * @param issueType - The type of issue being reported
 * @param latitude - Latitude of the issue location
 * @param longitude - Longitude of the issue location
 * @param excludeIssueId - Optional issue ID to exclude from duplicate check (for updates)
 * @returns DuplicateDetectionResult with duplicate information
 */
export async function checkForDuplicates(
  issueType: string,
  latitude: number | null,
  longitude: number | null,
  excludeIssueId?: string
): Promise<DuplicateDetectionResult> {
  // If no location provided, cannot check for duplicates
  if (!latitude || !longitude) {
    return {
      isDuplicate: false,
      duplicateIssues: [],
      message: "Location required for duplicate detection",
    };
  }

  try {
    // Fetch all issues with the same issue type
    let query = supabase
      .from("issues")
      .select("id, title, issue_type, status, created_at, latitude, longitude")
      .eq("issue_type", issueType)
      .not("latitude", "is", null)
      .not("longitude", "is", null);

    // Exclude current issue if updating
    if (excludeIssueId) {
      query = query.neq("id", excludeIssueId);
    }

    const { data: issues, error } = await query;

    if (error) {
      console.error("Error fetching issues for duplicate check:", error);
      return {
        isDuplicate: false,
        duplicateIssues: [],
        message: "Error checking for duplicates",
      };
    }

    if (!issues || issues.length === 0) {
      return {
        isDuplicate: false,
        duplicateIssues: [],
      };
    }

    // Check distance for each issue
    const duplicates: Array<{
      id: string;
      title: string;
      issue_type: string;
      status: string;
      created_at: string;
      distance: number;
    }> = [];

    for (const issue of issues) {
      if (issue.latitude && issue.longitude) {
        const distance = calculateDistance(
          latitude,
          longitude,
          issue.latitude,
          issue.longitude
        );

        // If within 30 meters, it's a duplicate
        if (distance <= DUPLICATE_DETECTION_RADIUS_METERS) {
          duplicates.push({
            id: issue.id,
            title: issue.title,
            issue_type: issue.issue_type,
            status: issue.status,
            created_at: issue.created_at,
            distance: Math.round(distance * 10) / 10, // Round to 1 decimal place
          });
        }
      }
    }

    if (duplicates.length > 0) {
      // Sort by distance (closest first)
      duplicates.sort((a, b) => a.distance - b.distance);

      const closestDuplicate = duplicates[0];
      const message = `Duplicate detected: A similar "${issueType}" issue was reported ${closestDuplicate.distance}m away (${closestDuplicate.distance < 1 ? "less than 1m" : `${closestDuplicate.distance}m`}). Status: ${closestDuplicate.status}.`;

      return {
        isDuplicate: true,
        duplicateIssues: duplicates,
        message,
      };
    }

    return {
      isDuplicate: false,
      duplicateIssues: [],
    };
  } catch (error) {
    console.error("Error in duplicate detection:", error);
    return {
      isDuplicate: false,
      duplicateIssues: [],
      message: "Error checking for duplicates",
    };
  }
}

/**
 * Check if two issues are duplicates
 * 
 * @param issueType1 - Issue type of first issue
 * @param lat1 - Latitude of first issue
 * @param lon1 - Longitude of first issue
 * @param issueType2 - Issue type of second issue
 * @param lat2 - Latitude of second issue
 * @param lon2 - Longitude of second issue
 * @returns True if duplicates, false otherwise
 */
export function areIssuesDuplicates(
  issueType1: string,
  lat1: number | null,
  lon1: number | null,
  issueType2: string,
  lat2: number | null,
  lon2: number | null
): boolean {
  // Different issue types are never duplicates
  if (issueType1 !== issueType2) {
    return false;
  }

  // Need both locations to check
  if (!lat1 || !lon1 || !lat2 || !lon2) {
    return false;
  }

  const distance = calculateDistance(lat1, lon1, lat2, lon2);
  return distance <= DUPLICATE_DETECTION_RADIUS_METERS;
}

/**
 * Get duplicate detection radius (for display purposes)
 */
export function getDuplicateDetectionRadius(): number {
  return DUPLICATE_DETECTION_RADIUS_METERS;
}



