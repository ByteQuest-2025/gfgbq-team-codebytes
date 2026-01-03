/**
 * NLP Classifier Examples and Test Cases
 * 
 * This file demonstrates the input-output behavior of the NLP classification system
 * with real-world examples of citizen complaints.
 */

import { classifyComplaint, ClassificationResult } from "./nlpClassifier";

/**
 * Example 1: Road Infrastructure Issue (Medium Priority)
 */
export const example1 = {
  input: {
    title: "Pothole on Main Street",
    description: "There is a large pothole on Main Street near the intersection with Oak Avenue. It's been getting bigger and could damage vehicles."
  },
  expectedOutput: {
    issueType: "Road & Infrastructure",
    priority: "Medium Priority",
    confidence: "High (keywords: pothole, street, intersection)"
  }
};

/**
 * Example 2: Public Safety Issue (Urgent - escalated by severity keywords)
 */
export const example2 = {
  input: {
    title: "Broken Traffic Light - Dangerous Intersection",
    description: "The traffic light at the intersection of 5th and Elm is completely broken. This is a dangerous situation and needs immediate attention. There was almost an accident this morning."
  },
  expectedOutput: {
    issueType: "Road & Infrastructure",
    priority: "Urgent", // Escalated from default "Medium Priority" due to "dangerous", "immediate", "accident"
    confidence: "High (keywords: traffic light, intersection, broken, dangerous)"
  }
};

/**
 * Example 3: Utilities Issue (High Priority)
 */
export const example3 = {
  input: {
    title: "Water Leak on Sidewalk",
    description: "There's a water leak coming from underground near the sidewalk on Park Road. Water is flowing onto the street and creating a hazard."
  },
  expectedOutput: {
    issueType: "Utilities",
    priority: "High Priority", // Default for Utilities, escalated by "hazard"
    confidence: "High (keywords: water leak, water, sidewalk)"
  }
};

/**
 * Example 4: Sanitation Issue (Medium Priority)
 */
export const example4 = {
  input: {
    title: "Garbage Bin Overflowing",
    description: "The garbage bin near the community center is overflowing with trash. It's been like this for a few days and starting to smell."
  },
  expectedOutput: {
    issueType: "Sanitation",
    priority: "Medium Priority",
    confidence: "High (keywords: garbage bin, overflowing, trash)"
  }
};

/**
 * Example 5: Noise Complaint (Medium Priority)
 */
export const example5 = {
  input: {
    title: "Excessive Construction Noise",
    description: "There's construction work happening at 3 AM with loud drilling and hammering. This is disturbing the entire neighborhood's sleep."
  },
  expectedOutput: {
    issueType: "Noise Complaint",
    priority: "Medium Priority",
    confidence: "High (keywords: construction noise, loud, drilling, hammering, disturbing)"
  }
};

/**
 * Example 6: Public Safety - Crime (Urgent)
 */
export const example6 = {
  input: {
    title: "Vandalism and Graffiti",
    description: "Someone has vandalized the public park with graffiti and broken several benches. This is a crime and needs urgent attention."
  },
  expectedOutput: {
    issueType: "Public Safety", // Could also match Parks & Recreation, but Public Safety has higher weight
    priority: "Urgent", // Default for Public Safety
    confidence: "High (keywords: vandalized, graffiti, crime, broken)"
  }
};

/**
 * Example 7: Environmental Issue (High Priority)
 */
export const example7 = {
  input: {
    title: "Illegal Dumping of Hazardous Waste",
    description: "Someone has been dumping toxic chemicals and hazardous waste in the vacant lot behind the school. This is a serious environmental and health risk."
  },
  expectedOutput: {
    issueType: "Environmental",
    priority: "High Priority", // Escalated by "hazardous", "toxic", "serious", "health risk"
    confidence: "High (keywords: dumping, hazardous waste, toxic, environmental, health risk)"
  }
};

/**
 * Example 8: Parks & Recreation (Low Priority)
 */
export const example8 = {
  input: {
    title: "Broken Swing in Playground",
    description: "One of the swings in the children's playground has a broken chain. It's not urgent but should be fixed when possible."
  },
  expectedOutput: {
    issueType: "Parks & Recreation",
    priority: "Low Priority", // Default for Parks & Recreation, confirmed by "not urgent", "when possible"
    confidence: "High (keywords: swing, playground, broken)"
  }
};

/**
 * Example 9: Utilities - Emergency (Urgent)
 */
export const example9 = {
  input: {
    title: "Gas Leak Emergency",
    description: "There's a strong smell of gas coming from the manhole on Elm Street. This is an emergency situation and needs immediate attention. Please send someone right away."
  },
  expectedOutput: {
    issueType: "Utilities",
    priority: "Urgent", // Escalated from default "High Priority" due to "emergency", "immediate", "gas leak"
    confidence: "High (keywords: gas leak, gas, emergency, immediate)"
  }
};

/**
 * Example 10: Ambiguous/Other Category
 */
export const example10 = {
  input: {
    title: "General Complaint",
    description: "I have a concern about the neighborhood that I'd like to discuss with city officials."
  },
  expectedOutput: {
    issueType: "Other",
    priority: "Medium Priority",
    confidence: "Low (no specific keywords matched)"
  }
};

/**
 * Run all examples and display results
 */
export function runExamples(): void {
  const examples = [
    { name: "Road Infrastructure", ...example1 },
    { name: "Public Safety - Traffic", ...example2 },
    { name: "Utilities - Water Leak", ...example3 },
    { name: "Sanitation", ...example4 },
    { name: "Noise Complaint", ...example5 },
    { name: "Public Safety - Crime", ...example6 },
    { name: "Environmental", ...example7 },
    { name: "Parks & Recreation", ...example8 },
    { name: "Utilities - Emergency", ...example9 },
    { name: "Ambiguous/Other", ...example10 }
  ];

  console.log("=== NLP Classification Examples ===\n");

  examples.forEach((example, index) => {
    const result: ClassificationResult = classifyComplaint(
      example.input.title,
      example.input.description
    );

    console.log(`Example ${index + 1}: ${example.name}`);
    console.log(`Input Title: "${example.input.title}"`);
    console.log(`Input Description: "${example.input.description.substring(0, 80)}..."`);
    console.log(`\nClassification Result:`);
    console.log(`  Issue Type: ${result.issueType}`);
    console.log(`  Priority: ${result.priority}`);
    console.log(`  Confidence: ${(result.confidence * 100).toFixed(1)}%`);
    console.log(`  Matched Keywords: ${result.matchedKeywords.slice(0, 5).join(", ")}`);
    console.log(`  Severity Indicators: ${result.severityIndicators.slice(0, 3).join(", ") || "None"}`);
    console.log(`  Explanation: ${result.explanation}`);
    console.log(`\n${"=".repeat(60)}\n`);
  });
}

/**
 * Priority Decision Rules Summary
 */
export const PRIORITY_DECISION_RULES = `
PRIORITY DECISION RULES
======================

1. DEFAULT PRIORITIES BY ISSUE TYPE:
   - Public Safety: Urgent
   - Utilities: High Priority
   - Environmental: High Priority
   - Road & Infrastructure: Medium Priority
   - Sanitation: Medium Priority
   - Noise Complaint: Medium Priority
   - Parks & Recreation: Low Priority
   - Other: Medium Priority

2. ESCALATION RULES (Severity Keywords):
   - URGENT: emergency, urgent, critical, immediate, danger, dangerous, 
     hazard, unsafe, accident, injured, fire, smoke, flood, collapsed, 
     explosion, gas leak, water leak, burst pipe, power outage, crime, 
     theft, robbery, assault, violence, threat, break-in, burglary
   
   - HIGH PRIORITY: severe, serious, major, significant, extensive, 
     widespread, multiple, blocked, blocking, obstruction, inaccessible, 
     unusable, broken, damaged, overflow, overflowing, leaking, leak, 
     faulty, malfunction, not working, health, health risk, disease, 
     infection, contamination, toxic, poisonous

3. DOWNGRADE RULES (Only for non-critical issue types):
   - LOW PRIORITY keywords can downgrade Medium Priority to Low Priority
   - Cannot downgrade Public Safety or Utilities below their defaults
   - Keywords: slight, slightly, minor, small, cosmetic, aesthetic, 
     inconvenience, when possible, when convenient, non-urgent, low priority

4. DETERMINISTIC LOGIC:
   - Classification is based on keyword matching with weighted scoring
   - Primary keywords (issue type specific) have 3x weight
   - Secondary keywords have 1x weight
   - Highest scoring issue type wins
   - Priority starts at default, then escalates based on severity keywords
   - All decisions are explainable via matched keywords and indicators
`;



