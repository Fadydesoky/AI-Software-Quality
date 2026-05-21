/**
 * Actionable Recommendations Engine
 * Generates specific, evidence-based recommendations mentioning exact metrics and file names
 */

import type { PredictionInput, PredictionResult } from "./prediction"
import type { FileAnalysisResult } from "./github-file-analyzer"

export interface Recommendation {
  id: string
  title: string
  description: string
  priority: "critical" | "high" | "medium" | "low"
  evidence: string // Why this recommendation applies
  action: string // What to do
  metrics?: {
    current: number | string
    target: number | string
    unit: string
  }
}

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
    recommendations.push({
      id: "bugs-high-density",
      title: "Address High Bug Density",
      description: `Your project has ${input.bugs} bugs across ${input.commits} commits (${result.metrics.bugDensity.toFixed(2)} bugs/commit). This is above healthy thresholds.`,
      priority: "critical",
      evidence: `Bug density of ${result.metrics.bugDensity.toFixed(2)} indicates potential quality issues in testing or code review processes.`,
      action: "Implement automated testing, increase test coverage, and establish code review guidelines. Focus on ${fileAnalysis?.hotspots[0]?.path || 'complex modules'} first.",
      metrics: {
        current: result.metrics.bugDensity.toFixed(2),
        target: "0.1-0.2",
        unit: "bugs/commit",
      },
    })
  }

  // Low Test Coverage
  if (input.coverage < 50) {
    recommendations.push({
      id: "coverage-low",
      title: "Increase Test Coverage",
      description: `Current test coverage is ${input.coverage}%, which is below industry best practices (70-80% target).`,
      priority: "high",
      evidence: `Low coverage (${input.coverage}%) correlates with higher bug escape rates and maintenance costs.`,
      action: `Write unit tests for: ${fileAnalysis?.hotspots?.slice(0, 2).map(h => h.path).join(", ") || "core modules"}. Prioritize high-complexity files first.`,
      metrics: {
        current: `${input.coverage}%`,
        target: "70-80%",
        unit: "coverage",
      },
    })
  }

  // High Complexity
  if (input.complexity >= 7) {
    recommendations.push({
      id: "complexity-high",
      title: "Reduce Code Complexity",
      description: `Complexity score of ${input.complexity}/10 indicates overly complex codebase that's hard to maintain and debug.`,
      priority: "high",
      evidence: `High complexity (${input.complexity}/10) suggests cyclomatic complexity issues in functions/modules, making it harder to test and maintain.`,
      action: `Refactor large functions into smaller units. ${fileAnalysis?.hotspots && fileAnalysis.hotspots.length > 0 ? `Start with ${fileAnalysis.hotspots[0].path} (complexity: ${fileAnalysis.hotspots[0].complexity})` : "Break down complex functions"}.`,
      metrics: {
        current: input.complexity,
        target: "4-6",
        unit: "score",
      },
    })
  }

  // Low Productivity
  if (result.metrics.productivity < 5) {
    recommendations.push({
      id: "productivity-low",
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
