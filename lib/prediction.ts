export interface MetricSource {
  type: "github" | "manual" | "unavailable"
  repoUrl?: string
  timestamp?: number
  confidence?: "high" | "medium" | "low"
}

export interface PredictionInput {
  commits: number
  bugs: number
  complexity: number
  developers: number
  coverage: number
  sources?: {
    commits?: MetricSource
    bugs?: MetricSource
    complexity?: MetricSource
    developers?: MetricSource
    coverage?: MetricSource
  }
}

export interface ScoreBreakdown {
  bugDensity: {
    value: number
    threshold: number
    contribution: number
    maxContribution: number
    status: "good" | "warning" | "bad"
  }
  complexity: {
    value: number
    threshold: number
    contribution: number
    maxContribution: number
    status: "good" | "warning" | "bad"
  }
  coverage: {
    value: number
    threshold: number
    contribution: number
    maxContribution: number
    status: "good" | "warning" | "bad"
  }
}

export interface RiskCategory {
  name: string
  score: number
  maxScore: number
  percentage: number
  status: "good" | "warning" | "bad"
  description: string
}

export interface Recommendation {
  id?: string
  priority: "critical" | "high" | "medium" | "low"
  metric: string
  title?: string
  description?: string
  action: string
  evidence?: string
  impact: string
  targetValue: string
  filePath?: string
  lineNumbers?: {
    start: number
    end: number
  }
  codeSnippet?: string
  fixExample?: {
    language: string
    before: string
    after: string
    explanation: string
  }
  metrics?: {
    current: number | string
    target: number | string
    unit: string
  }
}

export interface TrendAnalysis {
  direction: "improving" | "declining" | "stable"
  change: number
  message: string
}

export interface PredictionResult {
  risk: "High" | "Medium" | "Low"
  score: number
  reasons: string[]
  metrics: {
    bugDensity: number
    productivity: number
    bugs: number
    coverage: number
    complexity: number
  }
  confidence: number
  confidenceLevel: "Low" | "Medium" | "High"
  breakdown: ScoreBreakdown
  riskCategories: RiskCategory[]
  recommendations: Recommendation[]
  formulas: {
    bugDensity: string
    score: string
    productivity: string
  }
}

export interface HistoryEntry extends PredictionInput {
  id: string
  timestamp: number
  risk: "High" | "Medium" | "Low"
  score: number
  repoUrl?: string
}

export interface InputValidation {
  field: keyof PredictionInput
  type: "warning" | "error"
  message: string
}

// Constants for thresholds
export const THRESHOLDS = {
  bugDensity: {
    good: 0.1,
    warning: 0.3,
  },
  complexity: {
    good: 5,
    warning: 7,
  },
  coverage: {
    good: 70,
    warning: 50,
  },
  productivity: {
    good: 40,
    warning: 20,
  },
}

// Generate smart recommendations based on metrics
function generateRecommendations(
  input: PredictionInput,
  bugDensity: number,
  score: number
): Recommendation[] {
  const recommendations: Recommendation[] = []

  // Coverage recommendations
  if (input.coverage < THRESHOLDS.coverage.good) {
    const targetCoverage = Math.min(input.coverage + 20, 80)
    const projectedImprovement = Math.round((targetCoverage - input.coverage) * 0.33)
    recommendations.push({
      priority: input.coverage < THRESHOLDS.coverage.warning ? "high" : "medium",
      metric: "Test Coverage",
      action: `Increase test coverage from ${input.coverage}% to ${targetCoverage}%`,
      impact: `+${projectedImprovement} points to quality score`,
      targetValue: `${targetCoverage}%`,
    })
  }

  // Bug density recommendations
  if (bugDensity > THRESHOLDS.bugDensity.warning) {
    const targetBugReduction = Math.round(input.bugs * 0.3)
    const newBugDensity = (input.bugs - targetBugReduction) / Math.max(input.commits, 1)
    const improvement = Math.round((bugDensity - newBugDensity) * 40)
    recommendations.push({
      priority: "high",
      metric: "Bug Density",
      action: `Reduce bugs from ${input.bugs} to ${input.bugs - targetBugReduction}`,
      impact: `+${improvement} points, risk level may decrease`,
      targetValue: `${newBugDensity.toFixed(2)} bugs/commit`,
    })
  }

  // Complexity recommendations
  if (input.complexity > THRESHOLDS.complexity.warning) {
    const targetComplexity = Math.max(input.complexity - 2, 5)
    const improvement = (input.complexity - targetComplexity) * 3
    recommendations.push({
      priority: input.complexity >= 9 ? "high" : "medium",
      metric: "Code Complexity",
      action: `Reduce complexity from ${input.complexity}/10 to ${targetComplexity}/10`,
      impact: `+${improvement} points through refactoring`,
      targetValue: `${targetComplexity}/10`,
    })
  }

  // Productivity recommendations
  const productivity = input.commits / Math.max(input.developers, 1)
  if (productivity < THRESHOLDS.productivity.warning) {
    recommendations.push({
      priority: "low",
      metric: "Team Productivity",
      action: "Review workflow blockers and optimize processes",
      impact: "Improved delivery velocity",
      targetValue: `>${THRESHOLDS.productivity.warning} commits/dev`,
    })
  }

  // Sort by priority
  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
  return recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
}

// Calculate risk categories
function calculateRiskCategories(
  input: PredictionInput,
  bugDensity: number,
  breakdown: ScoreBreakdown
): RiskCategory[] {
  // Code Quality (based on complexity and bug density)
  const codeQualityScore = breakdown.complexity.contribution + (breakdown.bugDensity.contribution * 0.5)
  const codeQualityMax = breakdown.complexity.maxContribution + (breakdown.bugDensity.maxContribution * 0.5)
  const codeQualityPct = Math.round((codeQualityScore / codeQualityMax) * 100)

  // Testing Quality (based on coverage)
  const testingScore = breakdown.coverage.contribution
  const testingMax = breakdown.coverage.maxContribution
  const testingPct = Math.round((testingScore / testingMax) * 100)

  // Team Efficiency (based on productivity and bug density)
  const productivity = input.commits / Math.max(input.developers, 1)
  const productivityScore = Math.min(productivity / THRESHOLDS.productivity.good, 1) * 25
  const teamScore = productivityScore + (breakdown.bugDensity.contribution * 0.5)
  const teamMax = 25 + (breakdown.bugDensity.maxContribution * 0.5)
  const teamPct = Math.round((teamScore / teamMax) * 100)

  const getStatus = (pct: number): "good" | "warning" | "bad" => {
    if (pct >= 70) return "good"
    if (pct >= 50) return "warning"
    return "bad"
  }

  return [
    {
      name: "Code Quality",
      score: Math.round(codeQualityScore),
      maxScore: Math.round(codeQualityMax),
      percentage: codeQualityPct,
      status: getStatus(codeQualityPct),
      description: "Complexity and defect density",
    },
    {
      name: "Testing Quality",
      score: Math.round(testingScore),
      maxScore: Math.round(testingMax),
      percentage: testingPct,
      status: getStatus(testingPct),
      description: "Test coverage and reliability",
    },
    {
      name: "Team Efficiency",
      score: Math.round(teamScore),
      maxScore: Math.round(teamMax),
      percentage: teamPct,
      status: getStatus(teamPct),
      description: "Productivity and delivery",
    },
  ]
}

// Analyze trend from history
export function analyzeTrend(history: HistoryEntry[]): TrendAnalysis {
  if (history.length < 2) {
    return {
      direction: "stable",
      change: 0,
      message: "Not enough data for trend analysis",
    }
  }

  // Compare recent entries (last 3) vs earlier entries
  const recent = history.slice(-3)
  const earlier = history.slice(-6, -3)
  
  if (earlier.length === 0) {
    const lastTwo = history.slice(-2)
    const change = lastTwo[1].score - lastTwo[0].score
    if (Math.abs(change) < 3) {
      return { direction: "stable", change, message: "Quality is stable" }
    }
    return {
      direction: change > 0 ? "improving" : "declining",
      change,
      message: change > 0 
        ? `Quality improving (+${change} points)` 
        : `Quality declining (${change} points)`,
    }
  }

  const recentAvg = recent.reduce((sum, h) => sum + h.score, 0) / recent.length
  const earlierAvg = earlier.reduce((sum, h) => sum + h.score, 0) / earlier.length
  const change = Math.round(recentAvg - earlierAvg)

  if (Math.abs(change) < 3) {
    return { direction: "stable", change, message: "Quality is stable" }
  }

  return {
    direction: change > 0 ? "improving" : "declining",
    change,
    message: change > 0
      ? `Quality improving (+${change} avg points)`
      : `Quality declining (${change} avg points)`,
  }
}

export function validateInputs(input: PredictionInput): InputValidation[] {
  const validations: InputValidation[] = []

  // Check for zero or negative values
  if (input.commits <= 0) {
    validations.push({
      field: "commits",
      type: "error",
      message: "Commits must be greater than 0",
    })
  }

  if (input.developers <= 0) {
    validations.push({
      field: "developers",
      type: "error",
      message: "Developers must be greater than 0",
    })
  }

  // Check for unrealistic values
  if (input.bugs > input.commits) {
    validations.push({
      field: "bugs",
      type: "warning",
      message: "Bugs exceed commits - unusual ratio",
    })
  }

  if (input.commits > 0 && input.bugs / input.commits > 0.8) {
    validations.push({
      field: "bugs",
      type: "warning",
      message: "Very high bug density detected",
    })
  }

  if (input.developers > 0 && input.commits / input.developers > 500) {
    validations.push({
      field: "commits",
      type: "warning",
      message: "Unusually high commits per developer",
    })
  }

  if (input.complexity === 10 && input.coverage < 30) {
    validations.push({
      field: "coverage",
      type: "warning",
      message: "High complexity with low coverage is risky",
    })
  }

  return validations
}

export function predictQuality(input: PredictionInput, fileAnalysis?: any): PredictionResult {
  const { commits, bugs, complexity, developers, coverage } = input

  // Prevent division by zero
  const safeCommits = Math.max(commits, 1)
  const safeDevelopers = Math.max(developers, 1)

  // Calculate derived metrics
  const bugDensity = bugs / safeCommits
  const productivity = safeCommits / safeDevelopers

  // Calculate score components with enhanced weighting
  // Bug Density: 0-40 points (lower is better, exponential penalty)
  const bugDensityNormalized = Math.min(bugDensity / THRESHOLDS.bugDensity.warning, 2) // 0-2 scale
  const bugDensityContribution = (1 - Math.min(bugDensityNormalized, 1)) * 40

  // Complexity: 0-30 points (lower is better, linear)
  const complexityContribution = Math.max(0, (10 - complexity) * 3)

  // Coverage: 0-30 points (higher is better)
  const coverageContribution = (coverage / 100) * 30

  // Determine status for each metric
  const getBugDensityStatus = (): "good" | "warning" | "bad" => {
    if (bugDensity <= THRESHOLDS.bugDensity.good) return "good"
    if (bugDensity <= THRESHOLDS.bugDensity.warning) return "warning"
    return "bad"
  }

  const getComplexityStatus = (): "good" | "warning" | "bad" => {
    if (complexity <= THRESHOLDS.complexity.good) return "good"
    if (complexity <= THRESHOLDS.complexity.warning) return "warning"
    return "bad"
  }

  const getCoverageStatus = (): "good" | "warning" | "bad" => {
    if (coverage >= THRESHOLDS.coverage.good) return "good"
    if (coverage >= THRESHOLDS.coverage.warning) return "warning"
    return "bad"
  }

  const breakdown: ScoreBreakdown = {
    bugDensity: {
      value: Math.round(bugDensity * 100) / 100,
      threshold: THRESHOLDS.bugDensity.warning,
      contribution: Math.round(bugDensityContribution * 10) / 10,
      maxContribution: 40,
      status: getBugDensityStatus(),
    },
    complexity: {
      value: complexity,
      threshold: THRESHOLDS.complexity.warning,
      contribution: Math.round(complexityContribution * 10) / 10,
      maxContribution: 30,
      status: getComplexityStatus(),
    },
    coverage: {
      value: coverage,
      threshold: THRESHOLDS.coverage.warning,
      contribution: Math.round(coverageContribution * 10) / 10,
      maxContribution: 33,
      status: getCoverageStatus(),
    },
  }

  // Calculate total score (clamped 0-100)
  let score = bugDensityContribution + complexityContribution + coverageContribution
  score = Math.max(0, Math.min(100, Math.round(score)))

  // Determine risk level
  let risk: "High" | "Medium" | "Low"
  if (score < 50) {
    risk = "High"
  } else if (score < 75) {
    risk = "Medium"
  } else {
    risk = "Low"
  }

  // Generate detailed reasons with actual values
  const reasons: string[] = []
  if (coverage < THRESHOLDS.coverage.warning) {
    reasons.push(`Test coverage at ${coverage}% (threshold: ${THRESHOLDS.coverage.warning}%)`)
  }
  if (bugDensity > THRESHOLDS.bugDensity.warning) {
    reasons.push(`Bug density at ${bugDensity.toFixed(2)} bugs/commit (threshold: ${THRESHOLDS.bugDensity.warning})`)
  }
  if (complexity > THRESHOLDS.complexity.warning) {
    reasons.push(`Code complexity at ${complexity}/10 (threshold: ${THRESHOLDS.complexity.warning})`)
  }
  if (productivity < THRESHOLDS.productivity.warning) {
    reasons.push(`Developer productivity at ${productivity.toFixed(1)} commits/dev (threshold: ${THRESHOLDS.productivity.warning})`)
  }

  // Calculate confidence score based on distance from thresholds
  const distanceFrom50 = Math.abs(score - 50)
  const distanceFrom75 = Math.abs(score - 75)
  const minDistance = Math.min(distanceFrom50, distanceFrom75)
  const confidence = Math.min(100, Math.round(50 + minDistance * 2))

  // Determine confidence level
  const confidenceLevel: "Low" | "Medium" | "High" = 
    confidence >= 75 ? "High" : confidence >= 50 ? "Medium" : "Low"

  // Calculate risk categories
  const riskCategories = calculateRiskCategories(input, bugDensity, breakdown)

  // Generate recommendations using professional engineering standards
  let recommendations = generateRecommendations(input, bugDensity, score)
  
  // Map to professional recommendations with concrete implementation steps
  recommendations = recommendations.map(rec => {
    const professional = {
      ...rec,
      implementationSteps: generateImplementationSteps(rec, input, bugDensity),
      estimatedEffort: estimateEffort(rec.priority),
      riskLevel: estimateRiskLevel(rec.metric),
    }
    return professional
  })
  
  // Add file-specific hotspot recommendations if file analysis available
  if (fileAnalysis && fileAnalysis.hotspots && fileAnalysis.hotspots.length > 0) {
    const topHotspot = fileAnalysis.hotspots[0]
    recommendations.unshift({
      priority: topHotspot.riskScore > 80 ? "high" : "medium",
      metric: "Complexity Hotspot",
      action: `Refactor ${topHotspot.path.split('/').pop()} (detected complexity: ${topHotspot.complexity} - extract into ${Math.ceil(topHotspot.complexity / 5)} focused functions)`,
      impact: `Address top risk file (score: ${topHotspot.riskScore}) - improves maintainability by ~35%`,
      targetValue: `Reduce to complexity < 5 per function`,
      implementationSteps: [
        `Identify: ${topHotspot.path} has complexity ${topHotspot.complexity} (ideal: <5)`,
        `Extract: Split into ${Math.ceil(topHotspot.complexity / 5)} single-responsibility functions`,
        `Test: Add unit tests for each extracted function (100% coverage for refactored code)`,
        `Verify: Run integration tests to ensure behavior unchanged`,
        `Monitor: Track complexity metrics post-refactoring`,
      ],
      estimatedEffort: topHotspot.complexity > 15 ? "high" : "medium",
      riskLevel: topHotspot.riskScore > 80 ? "high" : "medium",
    } as any)
  }

  // Store formulas for display
  const formulas = {
    bugDensity: `bugs / commits = ${bugs} / ${safeCommits} = ${bugDensity.toFixed(3)}`,
    score: `(1 - bugDensity) * 40 + (10 - complexity) * 3 + coverage * 0.33`,
    productivity: `commits / developers = ${commits} / ${safeDevelopers} = ${productivity.toFixed(1)}`,
  }

  return {
    risk,
    score,
    reasons,
    metrics: {
      bugDensity: Math.round(bugDensity * 100) / 100,
      productivity: Math.round(productivity * 10) / 10,
      bugs,
      coverage,
      complexity,
    },
    confidence,
    confidenceLevel,
    breakdown,
    riskCategories,
    recommendations,
    formulas,
  }
}

// Simulate score for a given coverage value (for trend simulation)
export function simulateScoreForCoverage(
  baseInput: PredictionInput,
  newCoverage: number
): number {
  const result = predictQuality({ ...baseInput, coverage: newCoverage })
  return result.score
}

// Simulate score for a given complexity value
export function simulateScoreForComplexity(
  baseInput: PredictionInput,
  newComplexity: number
): number {
  const result = predictQuality({ ...baseInput, complexity: newComplexity })
  return result.score
}

// Generate simulation data for charts
export function generateSimulationData(
  baseInput: PredictionInput,
  metric: "coverage" | "complexity"
): { value: number; score: number }[] {
  const data: { value: number; score: number }[] = []
  
  if (metric === "coverage") {
    for (let i = 0; i <= 100; i += 5) {
      data.push({
        value: i,
        score: simulateScoreForCoverage(baseInput, i),
      })
    }
  } else {
    for (let i = 1; i <= 10; i++) {
      data.push({
        value: i,
        score: simulateScoreForComplexity(baseInput, i),
      })
    }
  }
  
  return data
}

export function getRiskColor(risk: "High" | "Medium" | "Low"): string {
  switch (risk) {
    case "High":
      return "text-red-500"
    case "Medium":
      return "text-amber-500"
    case "Low":
      return "text-emerald-500"
  }
}

export function getRiskBorderColor(risk: "High" | "Medium" | "Low"): string {
  switch (risk) {
    case "High":
      return "border-red-500"
    case "Medium":
      return "border-amber-500"
    case "Low":
      return "border-emerald-500"
  }
}

export function getRiskBgColor(risk: "High" | "Medium" | "Low"): string {
  switch (risk) {
    case "High":
      return "bg-red-500/10"
    case "Medium":
      return "bg-amber-500/10"
    case "Low":
      return "bg-emerald-500/10"
  }
}

// Generate concrete implementation steps for each recommendation
function generateImplementationSteps(
  rec: any,
  input: PredictionInput,
  bugDensity: number
): string[] {
  const steps: string[] = []

  if (rec.metric === "Test Coverage") {
    const currentGap = 80 - input.coverage
    const weeksNeeded = Math.ceil(currentGap / 10)
    steps.push(
      `Current state: ${input.coverage}% coverage = ${Math.round((100 - input.coverage) / 100 * 1000)} untested lines`,
      `Target: 80% coverage (${currentGap}% gap, ~${weeksNeeded} weeks)`,
      `Phase 1 (Week 1): Test top 20% of code by usage frequency - achieves ~40% of remaining coverage`,
      `Phase 2 (Week 2-3): Add integration tests for critical paths - adds ~35% of remaining coverage`,
      `Phase 3 (Week 4+): Edge cases and error handling - completes remaining coverage`,
      `Enforce: Add CI/CD gate: fail if coverage drops below 75%`
    )
  } else if (rec.metric === "Bug Density") {
    const targetBugs = Math.round(input.bugs * 0.3)
    steps.push(
      `Current: ${input.bugs} bugs across ${input.commits} commits = ${bugDensity.toFixed(2)} bugs/commit`,
      `Target: Reduce to ${targetBugs} bugs (${input.bugs - targetBugs} reduction needed)`,
      `Root cause analysis: Categorize bugs by type (logic, null checks, async, integration)`,
      `Implement: Code review for bugs, linting for patterns, tests for edge cases`,
      `Monitor: Track bugs by severity and time-to-fix over next 4 weeks`,
      `Success: If reaching 0.3 bugs/commit by week 8, risk improves by ~40 points`
    )
  } else if (rec.metric === "Code Complexity") {
    steps.push(
      `Current complexity: ${input.complexity}/10 - functions average ${Math.round(input.complexity * 10)} LOC with ${input.complexity > 7 ? "deep nesting (4+ levels)" : "moderate nesting"}`,
      `Target: 5/10 complexity - functions under 50 LOC, max 2-level nesting`,
      `Identify: Find top 5 most complex functions using cyclomatic complexity metrics`,
      `Refactor: Extract methods, use guard clauses, reduce parameter counts`,
      `Test: 100% unit test coverage of refactored functions, regression testing`,
      `Measure: Re-analyze after refactoring to verify improvement`
    )
  } else if (rec.metric === "Team Productivity") {
    steps.push(
      `Current: ${Math.round(input.commits / Math.max(input.developers, 1))} commits per developer per ${input.commits} commit period`,
      `Expected: ${THRESHOLDS.productivity.warning} commits per developer (healthy velocity)`,
      `Identify: Interview developers on blockers (meetings, process, tooling, clarity)`,
      `Remove: Top 3 blockers identified`,
      `Measure: Track velocity weekly, target +15% in 4 weeks`,
      `Success criteria: Sustainable velocity improvement without quality loss`
    )
  }

  return steps.length > 0 ? steps : ["Implement solution", "Test thoroughly", "Monitor metrics"]
}

// Estimate effort level
function estimateEffort(priority: "critical" | "high" | "medium" | "low"): "low" | "medium" | "high" {
  switch (priority) {
    case "critical":
      return "high"
    case "high":
      return "medium"
    case "medium":
      return "low"
    case "low":
      return "low"
  }
}

// Estimate risk level
function estimateRiskLevel(metric: string): "low" | "medium" | "high" {
  if (metric.includes("Bug") || metric.includes("Coverage") || metric.includes("Critical")) {
    return "high"
  }
  if (metric.includes("Complexity")) {
    return "medium"
  }
  return "low"
}

export function getBadgeVariant(score: number): { label: string; variant: "default" | "secondary" | "destructive" | "outline" } {
  if (score >= 75) {
    return { label: "Healthy", variant: "default" }
  } else if (score >= 50) {
    return { label: "Needs Attention", variant: "secondary" }
  } else {
    return { label: "Critical", variant: "destructive" }
  }
}

// Encode state to URL-safe string
export function encodeStateToURL(input: PredictionInput): string {
  const params = new URLSearchParams({
    c: input.commits.toString(),
    b: input.bugs.toString(),
    x: input.complexity.toString(),
    d: input.developers.toString(),
    v: input.coverage.toString(),
  })
  return params.toString()
}

// Decode state from URL
export function decodeStateFromURL(searchParams: URLSearchParams): PredictionInput | null {
  try {
    const commits = parseInt(searchParams.get("c") || "")
    const bugs = parseInt(searchParams.get("b") || "")
    const complexity = parseInt(searchParams.get("x") || "")
    const developers = parseInt(searchParams.get("d") || "")
    const coverage = parseInt(searchParams.get("v") || "")

    if ([commits, bugs, complexity, developers, coverage].some(isNaN)) {
      return null
    }

    return { commits, bugs, complexity, developers, coverage }
  } catch {
    return null
  }
}
