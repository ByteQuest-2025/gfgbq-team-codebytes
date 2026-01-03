/**
 * Test Cases for Duplicate Detection Service
 */

import { areIssuesDuplicates, getDuplicateDetectionRadius } from "./duplicateDetector";

/**
 * Test Case 1: Same issue type, same location (should be duplicate)
 */
export const testCase1 = {
  description: "Same issue type, same location - should detect duplicate",
  issueType1: "Road & Infrastructure",
  lat1: 13.135552,
  lon1: 80.255726,
  issueType2: "Road & Infrastructure",
  lat2: 13.135552,
  lon2: 80.255726,
  expected: true,
};

/**
 * Test Case 2: Same issue type, within 30 meters (should be duplicate)
 */
export const testCase2 = {
  description: "Same issue type, within 30 meters - should detect duplicate",
  issueType1: "Utilities",
  lat1: 13.135552,
  lon1: 80.255726,
  issueType2: "Utilities",
  lat2: 13.135552,
  lon2: 80.255726,
  expected: true,
};

/**
 * Test Case 3: Same issue type, more than 30 meters away (should NOT be duplicate)
 */
export const testCase3 = {
  description: "Same issue type, more than 30 meters away - should NOT detect duplicate",
  issueType1: "Sanitation",
  lat1: 13.135552,
  lon1: 80.255726,
  issueType2: "Sanitation",
  lat2: 13.135800, // Approximately 30+ meters away
  lon2: 80.256000,
  expected: false,
};

/**
 * Test Case 4: Different issue type, same location (should NOT be duplicate)
 */
export const testCase4 = {
  description: "Different issue type, same location - should NOT detect duplicate",
  issueType1: "Road & Infrastructure",
  lat1: 13.135552,
  lon1: 80.255726,
  issueType2: "Utilities",
  lat2: 13.135552,
  lon2: 80.255726,
  expected: false,
};

/**
 * Test Case 5: Different issue type, within 30 meters (should NOT be duplicate)
 */
export const testCase5 = {
  description: "Different issue type, within 30 meters - should NOT detect duplicate",
  issueType1: "Public Safety",
  lat1: 13.135552,
  lon1: 80.255726,
  issueType2: "Parks & Recreation",
  lat2: 13.135553, // Very close
  lon2: 80.255727,
  expected: false,
};

/**
 * Test Case 6: Missing location (should NOT be duplicate)
 */
export const testCase6 = {
  description: "Missing location - should NOT detect duplicate",
  issueType1: "Road & Infrastructure",
  lat1: null,
  lon1: null,
  issueType2: "Road & Infrastructure",
  lat2: 13.135552,
  lon2: 80.255726,
  expected: false,
};

/**
 * Run all test cases
 */
export function runDuplicateTests(): void {
  const testCases = [
    testCase1,
    testCase2,
    testCase3,
    testCase4,
    testCase5,
    testCase6,
  ];

  console.log("=== Duplicate Detection Test Cases ===\n");
  console.log(`Detection Radius: ${getDuplicateDetectionRadius()} meters\n`);

  let passed = 0;
  let failed = 0;

  testCases.forEach((testCase, index) => {
    const result = areIssuesDuplicates(
      testCase.issueType1,
      testCase.lat1,
      testCase.lon1,
      testCase.issueType2,
      testCase.lat2,
      testCase.lon2
    );

    const success = result === testCase.expected;

    if (success) {
      passed++;
    } else {
      failed++;
    }

    console.log(`Test ${index + 1}: ${success ? "✓ PASS" : "✗ FAIL"}`);
    console.log(`  Description: ${testCase.description}`);
    console.log(`  Issue Type 1: "${testCase.issueType1}"`);
    console.log(`  Location 1: (${testCase.lat1}, ${testCase.lon1})`);
    console.log(`  Issue Type 2: "${testCase.issueType2}"`);
    console.log(`  Location 2: (${testCase.lat2}, ${testCase.lon2})`);
    console.log(`  Expected: ${testCase.expected}`);
    console.log(`  Got: ${result}`);
    console.log("");
  });

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
}

/**
 * Example: Calculate distance between two points
 */
export function calculateExampleDistance(): void {
  // Chennai coordinates
  const point1 = { lat: 13.135552, lon: 80.255726 };
  const point2 = { lat: 13.135553, lon: 80.255727 }; // Very close
  
  // Using Haversine formula approximation
  const R = 6371000; // Earth radius in meters
  const dLat = (point2.lat - point1.lat) * (Math.PI / 180);
  const dLon = (point2.lon - point1.lon) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(point1.lat * (Math.PI / 180)) *
      Math.cos(point2.lat * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  console.log(`Distance between points: ${distance.toFixed(2)} meters`);
  console.log(`Within 30m radius: ${distance <= 30}`);
}



