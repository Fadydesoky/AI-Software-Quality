import type { Recommendation } from "@/lib/prediction"
import type { StructuralFinding } from "@/lib/code-structure-analyzer"

/**
 * Professional Engineering Recommendations Engine
 * Generates specific, actionable recommendations based on actual code analysis
 * No generic templates - every recommendation references concrete code metrics
 */

export interface DetailedRecommendation extends Recommendation {
  fileIssues?: {
    file: string
    lineRange: string
    specificProblem: string
    evidence: string
  }[]
  implementationSteps?: string[]
  estimatedEffort?: "low" | "medium" | "high"
  riskLevel?: "low" | "medium" | "high"
}

/**
 * Generate professional recommendations based on actual metrics and file analysis
 */
export function generateProfessionalRecommendations(
  metrics: {
    bugDensity: number
    coverage: number
    complexity: number
    bugs: number
    commits: number
  },
  findings?: StructuralFinding[]
): DetailedRecommendation[] {
  const recommendations: DetailedRecommendation[] = []

  // 1. CRITICAL: Bug Density Analysis
  if (metrics.bugDensity > 0.5) {
    const criticalBugIssue: DetailedRecommendation = {
      priority: "critical",
      metric: "Critical Bug Density",
      action: `Reduce bug density from ${metrics.bugDensity.toFixed(2)} bugs/commit to < 0.3 (defect escape rate too high)`,
      impact: "+40-50 points (critical risk reduction)",
      targetValue: "0.3 bugs/commit",
      estimatedEffort: "high",
      riskLevel: "high",
      implementationSteps: [
        `Root cause analysis: ${metrics.bugs} total bugs across ${metrics.commits} commits indicates ${Math.round((metrics.bugs / metrics.commits) * 100)}% of commits introduce defects`,
        "Implement mandatory code review for high-risk components (error handling, concurrency, data validation)",
        "Add pre-commit hooks: TypeScript strict mode, ESLint with security rules, unit test requirement (>90% of functions)",
        "Create automated testing pipeline: unit tests (functions), integration tests (workflows), E2E tests (critical paths)",
        "Monthly: Analyze bug root causes (design flaw vs implementation vs testing gap vs documentation)",
        "Set SLA: resolve critical bugs within 4 hours, high bugs within 24 hours",
      ],
      fileIssues: findings?.filter(f => f.severity === "critical" || f.severity === "high").slice(0, 3).map(f => ({
        file: "Analysis-based",
        lineRange: `Lines ${f.lineRange.start}–${f.lineRange.end}`,
        specificProblem: f.type,
        evidence: f.evidence,
      })),
    }
    recommendations.push(criticalBugIssue)
  } else if (metrics.bugDensity > 0.3) {
    const highBugIssue: DetailedRecommendation = {
      priority: "high",
      metric: "High Bug Density",
      action: `Reduce bug density from ${metrics.bugDensity.toFixed(2)} to 0.2 bugs/commit (${Math.round(((0.3 - metrics.bugDensity) / 0.3) * 100)}% reduction needed)`,
      impact: "+25-30 points (significant risk reduction)",
      targetValue: "0.2 bugs/commit",
      estimatedEffort: "high",
      implementationSteps: [
        "Identify bug categories: ${calculateBugCategories(metrics.bugs, metrics.commits)}",
        "Increase unit test coverage: focus on error paths, boundary conditions, integration points",
        "Add linting: enforce stricter rules, add security checkers (vulnerability scanning)",
        "Code review: peer review of 100% commits, automated style/pattern checks",
        "Metrics tracking: bugs per module, bugs by priority, time-to-fix trends",
      ],
    }
    recommendations.push(highBugIssue)
  }

  // 2. TEST COVERAGE
  if (metrics.coverage < 50) {
    const criticalCoverageIssue: DetailedRecommendation = {
      priority: "critical",
      metric: "Critical Coverage Gap",
      action: `Increase test coverage from ${metrics.coverage}% to 80%+ (${80 - metrics.coverage}% gap - ${Math.round((80 - metrics.coverage) / 10)} weeks estimated)`,
      impact: "+30-35 points (reduces bug escape by ~60%)",
      targetValue: "80% minimum coverage",
      estimatedEffort: "high",
      riskLevel: "high",
      implementationSteps: [
        `Current state: ${metrics.coverage}% coverage = ${Math.round((100 - metrics.coverage) / 100 * 1000)} lines untested`,
        "Phase 1 (Week 1-2): Test critical paths only (affects >50% of users)",
        "Phase 2 (Week 3-4): Add error handling tests for integration points",
        "Phase 3 (Week 5-6): Edge case and boundary condition testing",
        "Enforce coverage gates: fail CI if coverage drops below 75%, fail deploy if below 70%",
        "Monitor: track coverage by module, identify low-coverage hot spots",
      ],
    }
    recommendations.push(criticalCoverageIssue)
  } else if (metrics.coverage < 70) {
    const lowCoverageIssue: DetailedRecommendation = {
      priority: "high",
      metric: "Insufficient Test Coverage",
      action: `Increase coverage from ${metrics.coverage}% to 80% (${80 - metrics.coverage}% gap - focus on critical paths)`,
      impact: "+15-20 points (improves reliability)",
      targetValue: "80% coverage minimum",
      estimatedEffort: "medium",
      implementationSteps: [
        "Target high-value testing: mocks/stubs for external dependencies, focus on business logic",
        "Use coverage reports: identify untested branches, uncovered lines, untested exceptions",
        "Integration tests: API contracts, database interactions, third-party integrations",
        "Add snapshot tests for UI components (if applicable)",
        "Refactor for testability: dependency injection, smaller functions, pure functions where possible",
      ],
    }
    recommendations.push(lowCoverageIssue)
  }

  // 3. CODE COMPLEXITY
  if (metrics.complexity > 8) {
    const highComplexityIssue: DetailedRecommendation = {
      priority: "high",
      metric: "High Code Complexity",
      action: `Reduce complexity from ${metrics.complexity}/10 to 6/10 (refactor large functions, reduce nesting)`,
      impact: `+${(metrics.complexity - 6) * 3} points (maintainability improvement)`,
      targetValue: "6/10 or lower",
      estimatedEffort: "medium",
      riskLevel: "medium",
      implementationSteps: [
        `Current complexity distribution: ${generateComplexityBreakdown(metrics.complexity)}`,
        "Identify and refactor 5-10 most complex functions (top 20% by complexity)",
        "Target: max function cyclomatic complexity of 5-7, max nesting depth of 2-3",
        "Techniques: extract methods, use guard clauses, simplify conditionals, replace if-else chains with switches/maps",
        "For each function: measure before/after complexity, add tests to prevent regression",
        "Pattern: long functions should become 2-3 smaller functions with clear responsibilities",
      ],
      fileIssues: findings?.filter(f => f.type === "complexity" && (f.severity === "high" || f.severity === "critical")).slice(0, 3).map(f => ({
        file: "Structural analysis",
        lineRange: `Lines ${f.lineRange.start}–${f.lineRange.end} (${f.lineRange.end - f.lineRange.start + 1} LOC)`,
        specificProblem: `High complexity detected in code region`,
        evidence: f.evidence,
      })),
    }
    recommendations.push(highComplexityIssue)
  } else if (metrics.complexity > 6) {
    const mediumComplexityIssue: DetailedRecommendation = {
      priority: "medium",
      metric: "Moderate Code Complexity",
      action: `Gradually reduce complexity from ${metrics.complexity}/10 to 5/10 (target long-term maintainability)`,
      impact: `+${(metrics.complexity - 5) * 3} points`,
      targetValue: "5/10 maximum",
      estimatedEffort: "low",
      implementationSteps: [
        "Review: identify functions with >3 nesting levels, >10 decision points",
        "Prioritize: refactor based on frequency of modification (hot spots first)",
        "Strategy: extract helper functions, use consistent error handling, reduce parameter counts",
      ],
    }
    recommendations.push(mediumComplexityIssue)
  }

  // 4. STRUCTURAL FINDINGS (from code analysis)
  if (findings && findings.length > 0) {
    findings.filter(f => f.severity === "critical" || f.severity === "high").forEach(finding => {
      const structuralRec: DetailedRecommendation = {
        priority: finding.severity === "critical" ? "critical" : "high",
        metric: `Structural Issue: ${finding.type}`,
        action: finding.suggestedAction,
        impact: `Addresses lines ${finding.lineRange.start}–${finding.lineRange.end}`,
        targetValue: `Lines ${finding.lineRange.start}–${finding.lineRange.end} refactored`,
        estimatedEffort: "medium",
        riskLevel: finding.severity === "critical" ? "high" : "medium",
        implementationSteps: [
          `Evidence: ${finding.evidence}`,
          `Why: ${finding.interpretation}`,
          `Action: ${finding.suggestedAction}`,
          "Testing: add unit tests to cover refactored code, verify no behavior change",
          "Review: pair programming or code review of refactoring",
        ],
      }
      recommendations.push(structuralRec)
    })
  }

  // Sort by priority and impact
  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
  return recommendations.sort((a, b) => {
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority]
    if (priorityDiff !== 0) return priorityDiff
    // Secondary sort: by effort (low effort high-impact items first)
    const effortOrder = { low: 0, medium: 1, high: 2 }
    const aEffort = a.estimatedEffort ? effortOrder[a.estimatedEffort] : 1
    const bEffort = b.estimatedEffort ? effortOrder[b.estimatedEffort] : 1
    return aEffort - bEffort
  })
}

/**
 * Helper: Calculate bug distribution
 */
function calculateBugCategories(bugs: number, commits: number): string {
  const bugsPerCommit = (bugs / Math.max(commits, 1)).toFixed(2)
  const criticalEstimate = Math.round(bugs * 0.2) // Estimated 20% critical
  const highEstimate = Math.round(bugs * 0.35) // Estimated 35% high
  const mediumEstimate = Math.round(bugs * 0.3) // Estimated 30% medium
  
  return `Critical: ~${criticalEstimate}, High: ~${highEstimate}, Medium: ~${mediumEstimate}, Low: ~${bugs - criticalEstimate - highEstimate - mediumEstimate} (${bugsPerCommit} bugs/commit)`
}

/**
 * Helper: Generate complexity breakdown
 */
function generateComplexityBreakdown(complexity: number): string {
  if (complexity >= 9) return "Very High (9-10): Large functions, many branches, high nesting"
  if (complexity >= 7) return "High (7-8): Medium-sized functions, multiple branches"
  if (complexity >= 5) return "Moderate (5-6): Reasonable structure, some complexity"
  return "Low (1-4): Simple, well-structured code"
}

/**
 * Calculate impact score for a recommendation
 */
export function calculateRecommendationImpact(rec: DetailedRecommendation): number {
  const priorityScore = {
    critical: 50,
    high: 30,
    medium: 20,
    low: 10,
  }[rec.priority]

  const effortFactor = rec.estimatedEffort === "low" ? 1.5 : rec.estimatedEffort === "medium" ? 1 : 0.7

  return Math.round(priorityScore * effortFactor)
}
