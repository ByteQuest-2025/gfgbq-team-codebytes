# NLP Classification System for Civic Grievance Redressal

## Overview

This system provides automated classification and priority assignment for free-text citizen complaints using NLP preprocessing and supervised classification techniques. The system is deterministic, explainable, and backend-ready.

## Architecture

### Core Components

1. **NLP Classifier** (`src/lib/nlpClassifier.ts`)
   - Text preprocessing and normalization
   - Issue type classification using keyword matching
   - Priority assignment with severity-based escalation
   - Explainable decision-making

2. **Database Integration**
   - Priority column in `issues` table
   - Classification metadata (confidence, explanation, auto-classified flag)
   - Database triggers for default priority assignment

3. **Integration Point**
   - Automatic classification on issue submission
   - Classification runs before database insert
   - Results stored with issue record

## Issue Types

The system classifies complaints into 8 predefined categories:

- **Road & Infrastructure**: Potholes, traffic lights, sidewalks, bridges, streetlights
- **Utilities**: Water, electricity, gas, internet, sewer issues
- **Sanitation**: Garbage, waste management, cleanup, stray animals
- **Public Safety**: Crime, vandalism, hazards, emergencies, accidents
- **Parks & Recreation**: Playgrounds, parks, sports facilities, benches
- **Noise Complaint**: Construction noise, loud music, disturbances
- **Environmental**: Pollution, contamination, illegal dumping, deforestation
- **Other**: Unclassified or ambiguous complaints

## Priority Levels

Four priority levels are assigned:

1. **Urgent**: Life-threatening situations, emergencies, critical infrastructure failures
2. **High Priority**: Significant issues affecting public health or safety
3. **Medium Priority**: Standard issues requiring attention
4. **Low Priority**: Minor issues, cosmetic problems, non-urgent matters

## Classification Algorithm

### Step 1: Text Preprocessing
- Convert to lowercase
- Remove punctuation
- Normalize whitespace
- Tokenize into words

### Step 2: Issue Type Classification
- **Keyword Matching**: Each issue type has primary (3x weight) and secondary (1x weight) keywords
- **Scoring**: Calculate weighted score for each issue type
- **Selection**: Issue type with highest score wins
- **Confidence**: Calculated as score / max possible score

### Step 3: Priority Assignment
- **Default Priority**: Start with default priority for the classified issue type
- **Severity Escalation**: Check for severity keywords that escalate priority
  - Urgent keywords → Escalate to Urgent
  - High priority keywords → Escalate to High Priority (if not already Urgent)
- **Downgrade Rules**: Low priority keywords can downgrade (except for Public Safety and Utilities)

## Priority Decision Rules

### Default Priorities by Issue Type

| Issue Type | Default Priority |
|------------|-----------------|
| Public Safety | Urgent |
| Utilities | High Priority |
| Environmental | High Priority |
| Road & Infrastructure | Medium Priority |
| Sanitation | Medium Priority |
| Noise Complaint | Medium Priority |
| Parks & Recreation | Low Priority |
| Other | Medium Priority |

### Severity Keywords

**Urgent Escalation:**
- emergency, urgent, critical, immediate, danger, dangerous, hazard, unsafe, accident, injured, fire, smoke, flood, collapsed, explosion, gas leak, water leak, burst pipe, power outage, crime, theft, robbery, assault, violence, threat, break-in, burglary

**High Priority Escalation:**
- severe, serious, major, significant, extensive, widespread, multiple, blocked, blocking, obstruction, inaccessible, unusable, broken, damaged, overflow, overflowing, leaking, leak, faulty, malfunction, not working, health, health risk, disease, infection, contamination, toxic, poisonous

**Medium Priority Indicators:**
- moderate, some, partial, minor, small, beginning, starting, developing, concern, issue, problem, needs attention, should be fixed

**Low Priority Indicators:**
- slight, slightly, minor, small, cosmetic, aesthetic, inconvenience, when possible, when convenient, non-urgent, low priority

## Usage

### Basic Classification

```typescript
import { classifyComplaint } from "@/lib/nlpClassifier";

const result = classifyComplaint(
  "Pothole on Main Street",
  "There is a large pothole on Main Street near the intersection. It's been getting bigger and could damage vehicles."
);

console.log(result.issueType);    // "Road & Infrastructure"
console.log(result.priority);     // "Medium Priority"
console.log(result.confidence);   // 0.75
console.log(result.explanation);  // "Classified as Road & Infrastructure based on keywords: pothole, street, intersection..."
```

### Integration with Issue Submission

The classifier is automatically called when submitting an issue:

```typescript
// In ReportIssue.tsx handleSubmit
const classification = classifyComplaint(
  formData.title.trim(),
  formData.description.trim()
);

await supabase.from('issues').insert({
  // ... other fields
  priority: classification.priority,
  classification_confidence: classification.confidence,
  classification_explanation: classification.explanation,
  auto_classified: !formData.issueType,
});
```

## Example Input-Output

### Example 1: Road Infrastructure (Medium Priority)
**Input:**
- Title: "Pothole on Main Street"
- Description: "There is a large pothole on Main Street near the intersection with Oak Avenue. It's been getting bigger and could damage vehicles."

**Output:**
```json
{
  "issueType": "Road & Infrastructure",
  "priority": "Medium Priority",
  "confidence": 0.75,
  "matchedKeywords": ["pothole", "street", "intersection"],
  "severityIndicators": [],
  "explanation": "Classified as 'Road & Infrastructure' based on keywords: pothole, street, intersection. Priority set to 'Medium Priority' (default for Road & Infrastructure)."
}
```

### Example 2: Public Safety - Escalated to Urgent
**Input:**
- Title: "Broken Traffic Light - Dangerous Intersection"
- Description: "The traffic light at the intersection of 5th and Elm is completely broken. This is a dangerous situation and needs immediate attention. There was almost an accident this morning."

**Output:**
```json
{
  "issueType": "Road & Infrastructure",
  "priority": "Urgent",
  "confidence": 0.82,
  "matchedKeywords": ["traffic light", "intersection", "broken"],
  "severityIndicators": ["dangerous", "immediate", "accident"],
  "explanation": "Classified as 'Road & Infrastructure' based on keywords: traffic light, intersection, broken. Priority set to 'Urgent' due to severity indicators: dangerous, immediate, accident."
}
```

### Example 3: Utilities - Emergency (Urgent)
**Input:**
- Title: "Gas Leak Emergency"
- Description: "There's a strong smell of gas coming from the manhole on Elm Street. This is an emergency situation and needs immediate attention. Please send someone right away."

**Output:**
```json
{
  "issueType": "Utilities",
  "priority": "Urgent",
  "confidence": 0.88,
  "matchedKeywords": ["gas leak", "gas", "emergency"],
  "severityIndicators": ["emergency", "immediate", "gas leak"],
  "explanation": "Classified as 'Utilities' based on keywords: gas leak, gas, emergency. Priority set to 'Urgent' due to severity indicators: emergency, immediate, gas leak."
}
```

### Example 4: Sanitation (Medium Priority)
**Input:**
- Title: "Garbage Bin Overflowing"
- Description: "The garbage bin near the community center is overflowing with trash. It's been like this for a few days and starting to smell."

**Output:**
```json
{
  "issueType": "Sanitation",
  "priority": "Medium Priority",
  "confidence": 0.80,
  "matchedKeywords": ["garbage bin", "overflowing", "trash"],
  "severityIndicators": [],
  "explanation": "Classified as 'Sanitation' based on keywords: garbage bin, overflowing, trash. Priority set to 'Medium Priority' (default for Sanitation)."
}
```

## Deterministic and Explainable

The system is designed to be:

1. **Deterministic**: Same input always produces same output
2. **Explainable**: Every classification includes:
   - Matched keywords that led to classification
   - Severity indicators that affected priority
   - Human-readable explanation
   - Confidence score

3. **Transparent**: All decision rules are explicit and documented
4. **Auditable**: Classification metadata stored in database

## Database Schema

### New Columns in `issues` Table

- `priority` (TEXT): One of 'Urgent', 'High Priority', 'Medium Priority', 'Low Priority'
- `classification_confidence` (NUMERIC): Confidence score 0.0 to 1.0
- `classification_explanation` (TEXT): Human-readable explanation
- `auto_classified` (BOOLEAN): Whether issue type was auto-classified

### Indexes

- `idx_issues_priority`: Index on priority for filtering
- `idx_issues_type_priority`: Composite index on issue_type and priority

## Testing

Run examples to see the classifier in action:

```typescript
import { runExamples } from "@/lib/nlpClassifier.examples";

runExamples(); // Prints all example classifications
```

## Future Enhancements

Potential improvements (not implemented):

1. Machine learning model for better accuracy
2. Context-aware classification using location data
3. Historical pattern analysis
4. Multi-language support
5. Sentiment analysis for priority escalation
6. Integration with external NLP APIs for complex cases

## Notes

- The system prioritizes explainability and determinism over complex ML models
- Keyword-based approach ensures transparent decision-making
- All rules are configurable and can be tuned based on real-world performance
- Classification runs client-side but can be moved to Supabase Edge Functions for server-side processing



