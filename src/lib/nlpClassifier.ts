/**
 * NLP Classification Service for Civic Grievance Redressal System
 * 
 * This module provides:
 * - Text preprocessing (normalization, tokenization)
 * - Issue type classification using keyword matching and pattern recognition
 * - Priority assignment based on issue type and severity keywords
 * - Explainable, deterministic logic
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

// Classification Result
export interface ClassificationResult {
  issueType: IssueType;
  priority: PriorityLevel;
  confidence: number;
  explanation: string;
  matchedKeywords: string[];
  severityIndicators: string[];
}

/**
 * Text Preprocessing
 * Normalizes text for better keyword matching
 */
function preprocessText(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, " ") // Remove punctuation, keep spaces
    .replace(/\s+/g, " ") // Normalize whitespace
    .trim();
}

/**
 * Tokenize text into words
 */
function tokenize(text: string): string[] {
  return text.split(/\s+/).filter((word) => word.length > 0);
}

/**
 * Check if any keywords match in the text (handles partial matches)
 */
function hasKeywords(text: string, keywords: string[]): string[] {
  const normalizedText = preprocessText(text);
  const matched: string[] = [];
  
  for (const keyword of keywords) {
    const normalizedKeyword = keyword.toLowerCase();
    // Exact word match or substring match for compound terms
    if (
      normalizedText.includes(normalizedKeyword) ||
      tokenize(normalizedText).some((word) => word.includes(normalizedKeyword))
    ) {
      matched.push(keyword);
    }
  }
  
  return matched;
}

/**
 * Issue Type Classification Keywords
 * Organized by issue type with weighted keywords
 */
const ISSUE_TYPE_KEYWORDS: Record<IssueType, { primary: string[]; secondary: string[] }> = {
  "Road & Infrastructure": {
    primary: [
      "pothole", "potholes", "road", "roads", "street", "streets", "pavement", "sidewalk",
      "bridge", "overpass", "underpass", "traffic light", "traffic signal", "stop sign",
      "road sign", "streetlight", "street light", "lamppost", "curb", "curbside",
      "asphalt", "concrete", "crack", "cracks", "damage", "broken", "collapsed"
    ],
    secondary: [
      "infrastructure", "construction", "repair", "maintenance", "blocked", "obstruction",
      "debris", "gravel", "uneven", "bumpy", "sinkhole"
    ]
  },
  "Utilities": {
    primary: [
      "water", "water supply", "water line", "water pipe", "leak", "leaking", "burst",
      "electricity", "power", "power outage", "blackout", "electrical", "wire", "cable",
      "gas", "gas leak", "gas line", "internet", "broadband", "telephone", "phone line",
      "sewer", "sewage", "drain", "drainage", "plumbing"
    ],
    secondary: [
      "utility", "utilities", "service", "connection", "disconnected", "broken pipe",
      "faulty", "malfunction", "no water", "no power", "no electricity"
    ]
  },
  "Sanitation": {
    primary: [
      "garbage", "trash", "waste", "rubbish", "litter", "dump", "dumping", "garbage bin",
      "trash can", "waste bin", "overflow", "overflowing", "collection", "pickup",
      "sanitation", "cleanup", "cleaning", "dirty", "filthy", "unhygienic"
    ],
    secondary: [
      "stray", "stray animals", "dead animal", "carcass", "vermin", "rats", "rodents",
      "foul smell", "odor", "stink", "contamination"
    ]
  },
  "Public Safety": {
    primary: [
      "crime", "theft", "robbery", "vandalism", "graffiti", "suspicious", "dangerous",
      "hazard", "hazardous", "unsafe", "accident", "emergency", "fire", "smoke",
      "police", "security", "threat", "violence", "assault", "break-in", "burglary"
    ],
    secondary: [
      "broken window", "damaged property", "public safety", "safety concern", "risk",
      "peril", "menace", "endangerment"
    ]
  },
  "Parks & Recreation": {
    primary: [
      "park", "parks", "playground", "playground equipment", "swing", "slide", "bench",
      "bench broken", "recreation", "sports", "basketball court", "tennis court",
      "football field", "cricket ground", "garden", "fountain", "pond", "lake"
    ],
    secondary: [
      "maintenance", "damaged equipment", "broken equipment", "vandalized", "overgrown",
      "weeds", "grass", "trees", "lighting", "parking"
    ]
  },
  "Noise Complaint": {
    primary: [
      "noise", "loud", "disturbance", "disturbing", "construction noise", "music",
      "party", "loudspeaker", "speaker", "honking", "horn", "vehicle noise",
      "industrial noise", "factory noise", "machinery", "drilling", "hammering"
    ],
    secondary: [
      "quiet", "peace", "sleep", "annoying", "nuisance", "complaint", "complaining",
      "excessive noise", "noise pollution"
    ]
  },
  "Environmental": {
    primary: [
      "pollution", "air pollution", "water pollution", "soil pollution", "smog", "smoke",
      "emission", "toxic", "chemical", "hazardous waste", "contamination", "contaminated",
      "deforestation", "tree cutting", "illegal dumping", "environmental", "climate"
    ],
    secondary: [
      "green", "eco", "sustainability", "conservation", "wildlife", "habitat", "ecosystem",
      "carbon", "emission", "waste disposal"
    ]
  },
  "Other": {
    primary: [],
    secondary: []
  }
};

/**
 * Severity Keywords for Priority Escalation
 * These keywords indicate urgent or high-priority situations
 */
const SEVERITY_KEYWORDS = {
  urgent: [
    "emergency", "urgent", "critical", "immediate", "immediately", "asap", "as soon as possible",
    "danger", "dangerous", "hazard", "hazardous", "unsafe", "accident", "injured", "injury",
    "fire", "smoke", "flood", "flooding", "collapsed", "collapse", "explosion", "explosive",
    "gas leak", "water leak", "burst pipe", "power outage", "blackout", "electrical hazard",
    "crime", "theft", "robbery", "assault", "violence", "threat", "break-in", "burglary"
  ],
  high: [
    "severe", "serious", "major", "significant", "extensive", "widespread", "multiple",
    "blocked", "blocking", "obstruction", "inaccessible", "unusable", "broken", "damaged",
    "overflow", "overflowing", "leaking", "leak", "faulty", "malfunction", "not working",
    "health", "health risk", "disease", "infection", "contamination", "toxic", "poisonous"
  ],
  medium: [
    "moderate", "some", "partial", "minor", "small", "beginning", "starting", "developing",
    "concern", "issue", "problem", "needs attention", "should be fixed"
  ],
  low: [
    "slight", "slightly", "minor", "small", "cosmetic", "aesthetic", "inconvenience",
    "when possible", "when convenient", "non-urgent", "low priority"
  ]
};

/**
 * Default Priority by Issue Type
 */
const DEFAULT_PRIORITY: Record<IssueType, PriorityLevel> = {
  "Road & Infrastructure": "Medium Priority",
  "Utilities": "High Priority",
  "Sanitation": "Medium Priority",
  "Public Safety": "Urgent",
  "Parks & Recreation": "Low Priority",
  "Noise Complaint": "Medium Priority",
  "Environmental": "High Priority",
  "Other": "Medium Priority"
};

/**
 * Priority Escalation Rules
 * Maps priority levels to numeric values for comparison
 */
const PRIORITY_LEVELS: Record<PriorityLevel, number> = {
  "Urgent": 4,
  "High Priority": 3,
  "Medium Priority": 2,
  "Low Priority": 1
};

/**
 * Get priority level from numeric value
 */
function getPriorityFromValue(value: number): PriorityLevel {
  if (value >= 4) return "Urgent";
  if (value >= 3) return "High Priority";
  if (value >= 2) return "Medium Priority";
  return "Low Priority";
}

/**
 * Classify Issue Type from Text
 * Uses keyword matching with weighted scoring
 */
function classifyIssueType(title: string, description: string): {
  issueType: IssueType;
  confidence: number;
  matchedKeywords: string[];
} {
  const combinedText = `${title} ${description}`;
  const normalizedText = preprocessText(combinedText);
  
  const scores: Record<IssueType, { score: number; keywords: string[] }> = {
    "Road & Infrastructure": { score: 0, keywords: [] },
    "Utilities": { score: 0, keywords: [] },
    "Sanitation": { score: 0, keywords: [] },
    "Public Safety": { score: 0, keywords: [] },
    "Parks & Recreation": { score: 0, keywords: [] },
    "Noise Complaint": { score: 0, keywords: [] },
    "Environmental": { score: 0, keywords: [] },
    "Other": { score: 0, keywords: [] }
  };
  
  // Score each issue type
  for (const [issueType, keywords] of Object.entries(ISSUE_TYPE_KEYWORDS)) {
    const type = issueType as IssueType;
    
    // Primary keywords have higher weight (3 points)
    const primaryMatches = hasKeywords(normalizedText, keywords.primary);
    scores[type].score += primaryMatches.length * 3;
    scores[type].keywords.push(...primaryMatches);
    
    // Secondary keywords have lower weight (1 point)
    const secondaryMatches = hasKeywords(normalizedText, keywords.secondary);
    scores[type].score += secondaryMatches.length * 1;
    scores[type].keywords.push(...secondaryMatches);
  }
  
  // Find the issue type with highest score
  let maxScore = 0;
  let classifiedType: IssueType = "Other";
  let matchedKeywords: string[] = [];
  
  for (const [issueType, data] of Object.entries(scores)) {
    if (data.score > maxScore) {
      maxScore = data.score;
      classifiedType = issueType as IssueType;
      matchedKeywords = data.keywords;
    }
  }
  
  // Calculate confidence (0-1 scale)
  // Confidence is based on score relative to total possible keywords
  const totalPossibleScore = Object.values(ISSUE_TYPE_KEYWORDS[classifiedType]).flat().length * 3;
  const confidence = Math.min(maxScore / Math.max(totalPossibleScore, 1), 1);
  
  // If no keywords matched, default to "Other" with low confidence
  if (maxScore === 0) {
    return {
      issueType: "Other",
      confidence: 0.1,
      matchedKeywords: []
    };
  }
  
  return {
    issueType: classifiedType,
    confidence: Math.max(confidence, 0.3), // Minimum 30% confidence
    matchedKeywords
  };
}

/**
 * Determine Priority Level
 * Combines default priority with severity keyword escalation
 */
function determinePriority(
  issueType: IssueType,
  title: string,
  description: string
): {
  priority: PriorityLevel;
  severityIndicators: string[];
} {
  const combinedText = `${title} ${description}`;
  const normalizedText = preprocessText(combinedText);
  
  // Start with default priority for the issue type
  let priorityValue = PRIORITY_LEVELS[DEFAULT_PRIORITY[issueType]];
  const severityIndicators: string[] = [];
  
  // Check for urgent keywords (escalate to Urgent)
  const urgentMatches = hasKeywords(normalizedText, SEVERITY_KEYWORDS.urgent);
  if (urgentMatches.length > 0) {
    priorityValue = Math.max(priorityValue, PRIORITY_LEVELS["Urgent"]);
    severityIndicators.push(...urgentMatches);
  }
  
  // Check for high priority keywords
  const highMatches = hasKeywords(normalizedText, SEVERITY_KEYWORDS.high);
  if (highMatches.length > 0 && priorityValue < PRIORITY_LEVELS["Urgent"]) {
    priorityValue = Math.max(priorityValue, PRIORITY_LEVELS["High Priority"]);
    severityIndicators.push(...highMatches);
  }
  
  // Check for medium priority keywords (only if not already escalated)
  const mediumMatches = hasKeywords(normalizedText, SEVERITY_KEYWORDS.medium);
  if (mediumMatches.length > 0 && priorityValue < PRIORITY_LEVELS["High Priority"]) {
    priorityValue = Math.max(priorityValue, PRIORITY_LEVELS["Medium Priority"]);
  }
  
  // Low priority keywords can downgrade (but not below default for critical types)
  const lowMatches = hasKeywords(normalizedText, SEVERITY_KEYWORDS.low);
  if (lowMatches.length > 0 && priorityValue > PRIORITY_LEVELS["Low Priority"]) {
    // Only downgrade if issue type allows it
    if (issueType !== "Public Safety" && issueType !== "Utilities") {
      priorityValue = Math.min(priorityValue, PRIORITY_LEVELS["Medium Priority"]);
    }
  }
  
  return {
    priority: getPriorityFromValue(priorityValue),
    severityIndicators
  };
}

/**
 * Generate Explanation for Classification
 */
function generateExplanation(
  issueType: IssueType,
  priority: PriorityLevel,
  matchedKeywords: string[],
  severityIndicators: string[]
): string {
  const parts: string[] = [];
  
  // Issue type explanation
  if (matchedKeywords.length > 0) {
    parts.push(
      `Classified as "${issueType}" based on keywords: ${matchedKeywords.slice(0, 5).join(", ")}`
    );
  } else {
    parts.push(`Classified as "${issueType}" (default category)`);
  }
  
  // Priority explanation
  if (severityIndicators.length > 0) {
    parts.push(
      `Priority set to "${priority}" due to severity indicators: ${severityIndicators.slice(0, 3).join(", ")}`
    );
  } else {
    parts.push(`Priority set to "${priority}" (default for ${issueType})`);
  }
  
  return parts.join(". ");
}

/**
 * Main Classification Function
 * Processes free-text complaint and returns classification result
 */
export function classifyComplaint(
  title: string,
  description: string
): ClassificationResult {
  // Validate input
  if (!title || !description) {
    throw new Error("Title and description are required");
  }
  
  // Classify issue type
  const { issueType, confidence, matchedKeywords } = classifyIssueType(title, description);
  
  // Determine priority
  const { priority, severityIndicators } = determinePriority(issueType, title, description);
  
  // Generate explanation
  const explanation = generateExplanation(issueType, priority, matchedKeywords, severityIndicators);
  
  return {
    issueType,
    priority,
    confidence,
    explanation,
    matchedKeywords: [...new Set(matchedKeywords)], // Remove duplicates
    severityIndicators: [...new Set(severityIndicators)] // Remove duplicates
  };
}

/**
 * Batch Classification
 * Classify multiple complaints at once
 */
export function classifyComplaints(
  complaints: Array<{ title: string; description: string }>
): ClassificationResult[] {
  return complaints.map((complaint) => classifyComplaint(complaint.title, complaint.description));
}

