/**
 * Actionable Recommendations Engine
 * Generates specific, evidence-based recommendations mentioning exact metrics and file names
 */

import type { PredictionInput, PredictionResult, Recommendation } from "./prediction"
import type { FileAnalysisResult } from "./github-file-analyzer"

/**
 * Generate recommendations based on prediction results and file analysis
 */
export function generateRecommendations(
  input: PredictionInput,
  result: PredictionResult,
  fileAnalysis?: FileAnalysisResult
): Recommendation[] {
  const recommendations: Recommendation[] = []

  // Bug Density Recommendations
  if (result.metrics.bugDensity > 0.5) {
    const hotspotPath = fileAnalysis?.hotspots?.[0]?.path || "src/index.ts"
    const targetBugs = Math.max(2, Math.floor(input.bugs / 2))
    recommendations.push({
      id: "bugs-high-density",
      metric: "Bug Density",
      impact: `Reduce bugs by ${input.bugs - targetBugs} to improve code reliability`,
      targetValue: `${targetBugs} bugs`,
      title: `Critical: ${input.bugs} Bugs Detected - Reduce to ${targetBugs}`,
      description: `Your project has ${input.bugs} bugs across ${input.commits} commits (${result.metrics.bugDensity.toFixed(2)} bugs/commit). This is above healthy thresholds and impacts reliability.`,
      priority: "critical",
      evidence: `Bug density of ${result.metrics.bugDensity.toFixed(2)} bugs/commit indicates potential issues in:
- Missing error handling in critical paths
- Insufficient input validation
- Race conditions in async code
- Edge cases not covered by tests`,
      action: `IMMEDIATE ACTIONS:
1. Review ${hotspotPath} (identified as highest-risk file)
2. Add error handling to all API calls and async operations
3. Implement input validation for user-facing functions
4. Write tests for edge cases (empty inputs, null values, timeouts)
5. Use type-safe patterns to catch bugs at compile time`,
      filePath: hotspotPath,
      fixExample: {
        language: "typescript",
        before: `// Missing error handling - BUG RISK
async function fetchData(url: string) {
  const response = await fetch(url)
  return response.json()
}`,
        after: `// Proper error handling - SAFE
async function fetchData(url: string) {
  try {
    const response = await fetch(url)
    if (!response.ok) throw new Error(\`HTTP \${response.status}\`)
    return await response.json()
  } catch (error) {
    console.error('Fetch failed:', error)
    throw new Error('Failed to fetch data')
  }
}`,
        explanation: "Add try-catch blocks around async operations and validate HTTP status codes to catch failures early."
      },
      metrics: {
        current: `${input.bugs} bugs`,
        target: `${targetBugs} bugs`,
        unit: "total bugs",
      },
    })
  }

  // Low Test Coverage
  if (input.coverage < 50) {
    const uncoveredFiles = fileAnalysis?.hotspots?.slice(0, 3).map(h => `${h.path} (${h.complexity}/10 complexity)`).join("\n") || "critical modules"
    recommendations.push({
      id: "coverage-low",
      metric: "Test Coverage",
      impact: `Improve test coverage by ${70 - input.coverage}% to reduce bug escape rates`,
      targetValue: "70%",
      title: `Low Test Coverage (${input.coverage}%) - Increase to 70%`,
      description: `Current test coverage is ${input.coverage}%, which is below industry best practices (70-80% target). This means ${100 - input.coverage}% of your code is untested.`,
      priority: "high",
      evidence: `${100 - input.coverage}% untested code leads to:
- Higher bug escape rates (uncaught bugs in production)
- Increased maintenance costs and refactoring risks
- Difficulty safely adding new features
- Poor regression detection`,
      action: `COVERAGE IMPROVEMENT PLAN:
1. Start with these untested high-priority files:
   ${uncoveredFiles}
2. For each file, write unit tests covering:
   - Happy path (normal operation)
   - Error cases (invalid inputs, exceptions)
   - Edge cases (empty, null, boundary values)
3. Target lines to test first: functions without any test cases
4. Use code coverage reports to identify untested branches
5. Set up coverage CI/CD checks (fail if coverage drops below 70%)`,
      fixExample: {
        language: "typescript",
        before: `// Untested function
export function parseUserInput(input: string) {
  const parts = input.split(',')
  return {
    name: parts[0],
    email: parts[1]
  }
}`,
        after: `// Tested function with proper error handling
export function parseUserInput(input: string) {
  if (!input || input.trim() === '') {
    throw new Error('Input cannot be empty')
  }
  
  const parts = input.split(',')
  if (parts.length < 2) {
    throw new Error('Invalid format: expected "name,email"')
  }
  
  return {
    name: parts[0].trim(),
    email: parts[1].trim()
  }
}

// Test cases
describe('parseUserInput', () => {
  it('parses valid input', () => {
    expect(parseUserInput('John,john@example.com')).toEqual({
      name: 'John',
      email: 'john@example.com'
    })
  })
  
  it('throws on empty input', () => {
    expect(() => parseUserInput('')).toThrow('Input cannot be empty')
  })
  
  it('throws on malformed input', () => {
    expect(() => parseUserInput('OnlyName')).toThrow('Invalid format')
  })
})`,
        explanation: "Add input validation, proper error messages, and comprehensive test cases covering all code paths."
      },
      metrics: {
        current: `${input.coverage}%`,
        target: "70%",
        unit: "test coverage",
      },
    })
  }

  // High Complexity
  if (input.complexity >= 7) {
    const complexFiles = fileAnalysis?.hotspots?.slice(0, 3).map(h => `${h.path} (${h.complexity}/10)`).join("\n") || "main functions"
    recommendations.push({
      id: "complexity-high",
      metric: "Code Complexity",
      impact: `Reduce complexity from ${input.complexity}/10 to 5/10 for better maintainability`,
      targetValue: "5/10",
      title: `High Code Complexity (${input.complexity}/10) - Reduce to 5`,
      description: `Complexity score of ${input.complexity}/10 indicates overly complex codebase that's hard to maintain, test, and debug.`,
      priority: "high",
      evidence: `High complexity (${input.complexity}/10) means:
- Functions are doing too many things (violates Single Responsibility)
- Nested logic is 4+ levels deep (hard to understand)
- High cyclomatic complexity (too many branches/conditions)
- Difficult to write tests for all code paths
- Increased maintenance burden and bug risk`,
      action: `COMPLEXITY REDUCTION STRATEGY:
1. Identify most complex files:
   ${complexFiles}
2. For each complex file, apply these patterns:
   - Extract conditionals into named helper functions
   - Break large functions into smaller (max 20 lines) functions
   - Use early returns to reduce nesting
   - Replace complex conditionals with switch/map lookups
3. Aim for max complexity per function: 3 branches
4. Use type system to eliminate runtime checks
5. Measure with tools like ESLint complexity rule or SonarQube`,
      fixExample: {
        language: "typescript",
        before: `// COMPLEX: Hard to understand, hard to test
function processOrder(order: any) {
  if (order && order.items && order.items.length > 0) {
    let total = 0
    for (let item of order.items) {
      if (item.price && item.quantity) {
        total += item.price * item.quantity
        if (total > 100) {
          if (order.customer && order.customer.type === 'premium') {
            total *= 0.9 // 10% discount
          }
        }
      }
    }
    return total
  }
  return 0
}`,
        after: `// SIMPLE: Clear, testable, maintainable
const PREMIUM_DISCOUNT = 0.9
const BULK_DISCOUNT_THRESHOLD = 100

function calculateDiscount(subtotal: number, isPremium: boolean): number {
  if (subtotal > BULK_DISCOUNT_THRESHOLD && isPremium) {
    return subtotal * PREMIUM_DISCOUNT
  }
  return subtotal
}

function sumOrderItems(items: OrderItem[]): number {
  return items.reduce((sum, item) => {
    return sum + (item.price * item.quantity)
  }, 0)
}

function processOrder(order: Order): number {
  if (!order?.items?.length) return 0
  
  const subtotal = sumOrderItems(order.items)
  const isPremium = order.customer?.type === 'premium'
  return calculateDiscount(subtotal, isPremium)
}

// Test each function separately
describe('processOrder', () => {
  it('returns 0 for empty orders', () => {
    expect(processOrder({ items: [] })).toBe(0)
  })
  
  it('calculates premium discount correctly', () => {
    const order = {
      items: [{ price: 60, quantity: 2 }],
      customer: { type: 'premium' }
    }
    expect(processOrder(order)).toBe(108) // (60*2)*0.9
  })
})`,
        explanation: "Extract helper functions, use meaningful names, add type safety, and eliminate nested logic to make code testable and maintainable."
      },
      metrics: {
        current: input.complexity,
        target: "5",
        unit: "complexity score",
      },
    })
  }

  // Low Productivity
  if (result.metrics.productivity < 5) {
    recommendations.push({
      id: "productivity-low",
      metric: "Team Productivity",
      impact: "Improve development velocity and delivery speed",
      targetValue: ">5 commits/dev",
      title: "Improve Team Productivity",
      description: `Team productivity is ${result.metrics.productivity.toFixed(1)} commits/developer, indicating potential bottlenecks.`,
      priority: "medium",
      evidence: `Low productivity (${result.metrics.productivity.toFixed(1)} commits/dev) may indicate process inefficiencies or coordination issues.`,
      action: "Review code review processes, reduce approval delays, and improve development tooling. Consider pair programming for knowledge sharing.",
    })
  }

  // High File Count Hotspots
  if (fileAnalysis && fileAnalysis.hotspots.length > 5) {
    recommendations.push({
      id: "hotspots-too-many",
      metric: "Code Hotspots",
      impact: `Reduce complexity hotspots from ${fileAnalysis.hotspots.length} to <3`,
      targetValue: "<3 hotspots",
      title: "Address Multiple Hotspots",
      description: `Detected ${fileAnalysis.hotspots.length} complexity hotspots across the codebase. This distributed risk requires systematic refactoring.`,
      priority: "high",
      evidence: `Multiple hotspots (${fileAnalysis.hotspots.length} files) with high risk scores suggests systemic architectural issues.`,
      action: `Prioritize by risk score. Start with: ${fileAnalysis.hotspots.slice(0, 3).map(h => h.path).join(", ")}. Create a 3-month refactoring roadmap.`,
    })
  }

  // Risk Assessment Recommendations
  if (result.risk === "High") {
    recommendations.push({
      id: "risk-high-overall",
      metric: "Overall Risk",
      impact: "Improve overall quality score from current level",
      targetValue: ">75 score",
      title: "High Risk - Immediate Action Required",
      description: "Overall quality score is low, indicating multiple risk factors across the project.",
      priority: "critical",
      evidence: `Score of ${result.score} and risk rating '${result.risk}' indicates serious quality concerns.`,
      action: "1) Audit high-risk files, 2) Implement automated testing, 3) Increase code review coverage, 4) Plan technical debt reduction sprint.",
    })
  }

  // Best Practice: Good Metrics
  if (
    result.metrics.bugDensity <= 0.2 &&
    input.coverage >= 70 &&
    input.complexity <= 6 &&
    result.risk === "Low"
  ) {
    recommendations.push({
      id: "best-practices-maintained",
      metric: "Quality Standards",
      impact: "Maintain excellent code quality standards",
      targetValue: ">75 score",
      title: "Strong Quality Practices",
      description: "Your project maintains excellent quality standards across all metrics.",
      priority: "low",
      evidence: `All metrics are in healthy ranges: bugs (${result.metrics.bugDensity.toFixed(2)}/commit), coverage (${input.coverage}%), complexity (${input.complexity}/10).`,
      action: "Maintain current practices. Document your process as team standard. Continue regular quality audits.",
    })
  }

  return recommendations.sort((a, b) => {
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
    return priorityOrder[a.priority] - priorityOrder[b.priority]
  })
}

/**
 * Get color scheme for recommendation priority
 */
export function getPriorityColor(priority: string): string {
  switch (priority) {
    case "critical":
      return "bg-red-500/10 text-red-600 dark:text-red-400 border-red-200/50 dark:border-red-800/50"
    case "high":
      return "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-200/50 dark:border-orange-800/50"
    case "medium":
      return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200/50 dark:border-amber-800/50"
    default:
      return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200/50 dark:border-blue-800/50"
  }
}
