/**
 * Test Cases for Priority Assignment Function
 * 
 * This file demonstrates the input-output behavior with example test cases
 */

import {
  assignPriority,
  assignPriorities,
  isValidIssueType,
  getPriorityMapping,
  getValidIssueTypes,
} from "./priorityAssigner";

/**
 * Test Case 1: Public Safety → Urgent
 */
export const testCase1 = {
  input: "Public Safety",
  expectedOutput: "Urgent",
  description: "Public Safety issues should be assigned Urgent priority"
};

/**
 * Test Case 2: Utilities → High Priority
 */
export const testCase2 = {
  input: "Utilities",
  expectedOutput: "High Priority",
  description: "Utilities issues should be assigned High Priority"
};

/**
 * Test Case 3: Sanitation → High Priority
 */
export const testCase3 = {
  input: "Sanitation",
  expectedOutput: "High Priority",
  description: "Sanitation issues should be assigned High Priority"
};

/**
 * Test Case 4: Environmental → High Priority
 */
export const testCase4 = {
  input: "Environmental",
  expectedOutput: "High Priority",
  description: "Environmental issues should be assigned High Priority"
};

/**
 * Test Case 5: Road & Infrastructure → Urgent
 */
export const testCase5 = {
  input: "Road & Infrastructure",
  expectedOutput: "Urgent",
  description: "Road & Infrastructure issues should be assigned Urgent priority"
};

/**
 * Test Case 6: Noise Complaint → Medium Priority
 */
export const testCase6 = {
  input: "Noise Complaint",
  expectedOutput: "Medium Priority",
  description: "Noise Complaint issues should be assigned Medium Priority"
};

/**
 * Test Case 7: Parks & Recreation → Low Priority
 */
export const testCase7 = {
  input: "Parks & Recreation",
  expectedOutput: "Low Priority",
  description: "Parks & Recreation issues should be assigned Low Priority"
};

/**
 * Test Case 8: Other → Low Priority
 */
export const testCase8 = {
  input: "Other",
  expectedOutput: "Low Priority",
  description: "Other issues should be assigned Low Priority"
};

/**
 * Test Case 9: Invalid Type → Low Priority (Default)
 */
export const testCase9 = {
  input: "Invalid Type",
  expectedOutput: "Low Priority",
  description: "Invalid or unknown issue types should default to Low Priority"
};

/**
 * Test Case 10: Empty String → Low Priority (Default)
 */
export const testCase10 = {
  input: "",
  expectedOutput: "Low Priority",
  description: "Empty strings should default to Low Priority"
};

/**
 * Test Case 11: Whitespace Handling
 */
export const testCase11 = {
  input: "  Public Safety  ",
  expectedOutput: "Urgent",
  description: "Whitespace should be trimmed before matching"
};

/**
 * Run all test cases and display results
 */
export function runTests(): void {
  const testCases = [
    testCase1,
    testCase2,
    testCase3,
    testCase4,
    testCase5,
    testCase6,
    testCase7,
    testCase8,
    testCase9,
    testCase10,
    testCase11,
  ];

  console.log("=== Priority Assignment Test Cases ===\n");

  let passed = 0;
  let failed = 0;

  testCases.forEach((testCase, index) => {
    const result = assignPriority(testCase.input);
    const success = result === testCase.expectedOutput;

    if (success) {
      passed++;
    } else {
      failed++;
    }

    console.log(`Test ${index + 1}: ${success ? "✓ PASS" : "✗ FAIL"}`);
    console.log(`  Input: "${testCase.input}"`);
    console.log(`  Expected: "${testCase.expectedOutput}"`);
    console.log(`  Got: "${result}"`);
    console.log(`  Description: ${testCase.description}`);
    console.log("");
  });

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  console.log(`\n=== Priority Mapping Summary ===`);
  console.log(JSON.stringify(getPriorityMapping(), null, 2));
}

/**
 * Example Input-Output Mappings
 */
export const EXAMPLE_MAPPINGS = {
  "Public Safety": "Urgent",
  "Utilities": "High Priority",
  "Sanitation": "High Priority",
  "Environmental": "High Priority",
  "Road & Infrastructure": "Medium Priority",
  "Noise Complaint": "Medium Priority",
  "Parks & Recreation": "Low Priority",
  "Other": "Low Priority",
  "Invalid Type": "Low Priority", // Default for unknown types
  "": "Low Priority", // Default for empty strings
};

/**
 * Batch Assignment Example
 */
export function batchAssignmentExample(): void {
  console.log("=== Batch Priority Assignment Example ===\n");

  const issueTypes = [
    "Public Safety",
    "Utilities",
    "Road & Infrastructure",
    "Parks & Recreation",
    "Invalid Type",
  ];

  const priorities = assignPriorities(issueTypes);

  console.log("Input Issue Types:", issueTypes);
  console.log("Assigned Priorities:", priorities);
  console.log("\nDetailed Mapping:");
  issueTypes.forEach((type, index) => {
    console.log(`  ${type} → ${priorities[index]}`);
  });
}

