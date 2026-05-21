# Technical Details: Specific Recommendation System

## System Architecture

### Enhanced Recommendation Type

```typescript
export interface Recommendation {
  id: string                          // Unique identifier
  priority: "critical" | "high" | "medium" | "low"
  metric: string                      // Category (e.g., "Code Complexity")
  title: string                       // Specific, actionable title
  description: string                 // Detailed problem description
  action: string                      // Step-by-step action plan
  evidence: string                    // Why this matters (multiline)
  impact: string                      // Business impact
  targetValue: string                 // Current target to achieve
  filePath?: string                   // Exact file location
  lineNumbers?: {
    start: number
    end: number                       // Specific lines to review
  }
  codeSnippet?: string                // Current problematic code
  fixExample?: {
    language: string                  // e.g., "typescript"
    before: string                    // Current problematic code
    after: string                     // Fixed version
    explanation: string               // Why this works
  }
  metrics?: {
    current: number | string          // Current metric value
    target: number | string           // Target value
    unit: string                      // Unit of measurement
  }
}
```

## Recommendation Generation

### Bug Density Recommendation

**File:** `lib/recommendations.ts`

```typescript
if (result.metrics.bugDensity > 0.5) {
  recommendations.push({
    id: "bugs-high-density",
    title: `Critical: ${input.bugs} Bugs Detected - Reduce to ${Math.max(2, Math.floor(input.bugs / 2))}`,
    description: `Your project has ${input.bugs} bugs...`,
    priority: "critical",
    evidence: `
      - Missing error handling in critical paths
      - Insufficient input validation
      - Race conditions in async code
      - Edge cases not covered by tests
    `,
    action: `
      IMMEDIATE ACTIONS:
      1. Review ${hotspotPath}
      2. Add error handling to all API calls
      3. Implement input validation
      ...
    `,
    filePath: hotspotPath,
    fixExample: {
      language: "typescript",
      before: `async function fetchData(url: string) {
        const response = await fetch(url)
        return response.json()
      }`,
      after: `async function fetchData(url: string) {
        try {
          const response = await fetch(url)
          if (!response.ok) throw new Error(...)
          return await response.json()
        } catch (error) {
          console.error('Fetch failed:', error)
          throw new Error('Failed to fetch data')
        }
      }`,
      explanation: "Add try-catch blocks and validate HTTP responses"
    },
    metrics: {
      current: `${input.bugs} bugs`,
      target: `${Math.max(2, Math.floor(input.bugs / 2))} bugs`,
      unit: "total bugs"
    }
  })
}
```

### Coverage Recommendation

Includes:
- Untested files ranked by complexity
- Test case examples (happy path, error cases, edge cases)
- Coverage targets with specific percentages
- Test structure examples

### Complexity Recommendation

Includes:
- List of complex files with scores
- Refactoring patterns
- Complete before/after refactor
- Complexity measurement tools
- Max complexity per function guidance

## Display Layer

### Code Generator Component

**File:** `components/code-generator.tsx`

```typescript
function formatFixExample(recommendation: Recommendation): string {
  const parts = []
  
  // Title with clear problem statement
  parts.push(`# ${recommendation.title}`)
  
  // Detailed evidence/problem analysis
  parts.push(`## Problem\n${recommendation.evidence}`)
  
  // Exact location
  if (recommendation.filePath) {
    parts.push(`### Location\nFile: ${recommendation.filePath}`)
    if (recommendation.lineNumbers) {
      parts.push(`Lines: ${recommendation.lineNumbers.start}-${recommendation.lineNumbers.end}`)
    }
  }
  
  // Before/After Code
  parts.push(`## ❌ BEFORE\n\`\`\`${language}\n${before}\n\`\`\``)
  parts.push(`## ✅ AFTER\n\`\`\`${language}\n${after}\n\`\`\``)
  
  // Explanation
  parts.push(`## Why This Works\n${explanation}`)
  
  // Action items
  parts.push(`## Action Items\n${recommendation.action}`)
  
  // Metrics
  if (recommendation.metrics) {
    parts.push(`## Expected Impact\n- Current: ${current}\n- Target: ${target}`)
  }
  
  return parts.join("\n")
}
```

### Recommendation Modal

**File:** `components/recommendation-modal.tsx`

Displays:
1. **Priority Badge** - Visual importance indicator
2. **File Location** - Blue highlighted box with exact file path
3. **Evidence Section** - Multiline text explaining the problem
4. **Action Plan** - Step-by-step instructions with numbered list
5. **Metrics** - Current vs. Target comparison
6. **Code Generator** - Interactive button to view examples
7. **Source Code Review** - Optional GitHub file viewer

## Data Flow

```
1. User inputs repo details
   ↓
2. Analysis runs (commits, bugs, complexity, coverage)
   ↓
3. generateRecommendations() called with results
   ↓
4. For each metric threshold:
   - Create specific recommendation
   - Add evidence from analysis
   - Add relevant code examples
   - Set target metrics
   ↓
5. Recommendations displayed in modal
   ↓
6. User clicks "Generate AI Suggestions"
   ↓
7. formatFixExample() creates detailed before/after
   ↓
8. User copies code or downloads file
```

## Key Features

### 1. Metric-Specific Examples

Each metric type has tailored examples:
- **Bugs:** Error handling, input validation, race conditions
- **Coverage:** Unit tests, integration tests, edge cases
- **Complexity:** Function extraction, early returns, helper functions

### 2. Multiline Evidence

Supports formatted text with:
- Bullet points for key issues
- Numbered steps in action plans
- Code blocks in examples
- Proper line breaks

### 3. Progress Tracking

Metrics section shows:
- Current state (e.g., "12 bugs")
- Target state (e.g., "6 bugs")
- Unit of measurement
- Percentage improvement

### 4. File-Specific Fixes

When file analysis available:
- Exact file path provided
- Line number ranges
- Most problematic functions identified
- Risk ranking of files

## Extensibility

### Adding New Recommendation Types

1. **Define condition** in `lib/recommendations.ts`:
```typescript
if (someCondition) {
  recommendations.push({
    // Standard fields
    id: "unique-id",
    title: "Specific problem - improve X",
    // Specific fields
    evidence: "Why this matters...",
    action: "Step-by-step plan...",
    fixExample: { before, after, explanation },
    metrics: { current, target, unit }
  })
}
```

2. **Component handles it automatically** - No changes to display layer needed

### Integrating AI Models

Replace template-based suggestions:
```typescript
if (recommendation.fixExample) {
  // Use provided example (current)
} else {
  // Could call AI API here
  const suggestion = await aiModel.generateSuggestion(recommendation)
}
```

## Real-World Metrics

System covers:
- **Bug Density:** Bugs per commit
- **Test Coverage:** Percentage of code covered
- **Code Complexity:** Cyclomatic complexity score
- **Productivity:** Commits per developer
- **Hotspots:** Files with multiple issues

## Integration Points

### GitHub API
- Fetch repository metadata
- Detect default branch
- Load file content
- Link to specific lines

### Analysis Engine
- Calculate metrics
- Identify hotspots
- Rank by severity
- Compare against benchmarks

### UI Components
- Display recommendations
- Show code examples
- Track progress
- Export suggestions

---

This architecture ensures that every recommendation is specific, actionable, and directly applicable to the user's codebase.
