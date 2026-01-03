# Priority Assignment Function

## Overview

This module provides a deterministic priority assignment function that maps issue types to priority levels based on a fixed mapping table. No NLP, keywords, or severity detection is used - just a simple, transparent mapping.

## Function Signature

```typescript
assignPriority(issueType: string): PriorityLevel
```

## Issue Type → Priority Mapping

| Issue Type | Priority |
|------------|----------|
| Public Safety | Urgent |
| Utilities | High Priority |
| Sanitation | High Priority |
| Environmental | High Priority |
| Road & Infrastructure | Medium Priority |
| Noise Complaint | Medium Priority |
| Parks & Recreation | Low Priority |
| Other | Low Priority |

## Logic

1. **Input Normalization**: Trims whitespace from the input string
2. **Exact Match**: Checks if the issue type exists in the mapping table (case-sensitive)
3. **Priority Return**: Returns the corresponding priority if found
4. **Default Handling**: Returns "Low Priority" for invalid or unknown issue types

## Usage

### Basic Usage

```typescript
import { assignPriority } from "@/lib/priorityAssigner";

const priority = assignPriority("Public Safety");
// Returns: "Urgent"
```

### Batch Assignment

```typescript
import { assignPriorities } from "@/lib/priorityAssigner";

const priorities = assignPriorities([
  "Public Safety",
  "Utilities",
  "Parks & Recreation"
]);
// Returns: ["Urgent", "High Priority", "Low Priority"]
```

### Validation

```typescript
import { isValidIssueType } from "@/lib/priorityAssigner";

if (isValidIssueType("Public Safety")) {
  // Issue type is valid
}
```

## Example Input-Output

### Valid Issue Types

```typescript
assignPriority("Public Safety")        // → "Urgent"
assignPriority("Utilities")             // → "High Priority"
assignPriority("Sanitation")            // → "High Priority"
assignPriority("Environmental")         // → "High Priority"
assignPriority("Road & Infrastructure") // → "Medium Priority"
assignPriority("Noise Complaint")      // → "Medium Priority"
assignPriority("Parks & Recreation")    // → "Low Priority"
assignPriority("Other")                 // → "Low Priority"
```

### Invalid/Unknown Issue Types

```typescript
assignPriority("Invalid Type")  // → "Low Priority" (default)
assignPriority("")              // → "Low Priority" (default)
assignPriority("  ")           // → "Low Priority" (default)
assignPriority("Custom Type")  // → "Low Priority" (default)
```

### Whitespace Handling

```typescript
assignPriority("  Public Safety  ") // → "Urgent" (whitespace trimmed)
```

## Characteristics

- **Deterministic**: Same input always produces same output
- **Transparent**: Mapping is explicit and visible in code
- **Simple**: No complex logic, just a lookup table
- **Safe**: Invalid inputs default to "Low Priority" instead of throwing errors
- **Case-Sensitive**: Issue type matching is case-sensitive (exact match required)

## Integration

### With Database

```typescript
// When inserting an issue
const issueData = {
  title: "Broken Traffic Light",
  description: "Traffic light is not working",
  issue_type: "Road & Infrastructure",
  priority: assignPriority("Road & Infrastructure"), // "Medium Priority"
};
```

### With Existing Code

```typescript
// Replace hardcoded priority logic
const priority = assignPriority(issue.issue_type);
```

## Testing

Run test cases to verify behavior:

```typescript
import { runTests } from "@/lib/priorityAssigner.test";

runTests(); // Displays all test results
```

## API Reference

### Functions

- `assignPriority(issueType: string): PriorityLevel` - Assign priority for a single issue type
- `assignPriorities(issueTypes: string[]): PriorityLevel[]` - Batch assign priorities
- `isValidIssueType(issueType: string): boolean` - Check if issue type is valid
- `getValidIssueTypes(): IssueType[]` - Get all valid issue types
- `getPriorityMapping(): Record<string, PriorityLevel>` - Get the complete mapping

### Types

- `IssueType` - Union type of all valid issue types
- `PriorityLevel` - Union type of all priority levels ("Urgent" | "High Priority" | "Medium Priority" | "Low Priority")

## Notes

- This is a pure function with no side effects
- The mapping is fixed and does not change based on context
- All edge cases (invalid types, empty strings, whitespace) are handled gracefully
- The function is backend-ready and can be used in any context (API, database triggers, etc.)

