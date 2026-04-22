export interface PredictionInput {
  commits: number
  bugs: number
  complexity: number
  developers: number
  coverage: number
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
  breakdown: ScoreBreakdown
}

export interface HistoryEntry extends PredictionInput {
  id: string
  timestamp: number
  risk: "High" | "Medium" | "Low"
  score: number
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

export function predictQuality(input: PredictionInput): PredictionResult {
  const { commits, bugs, complexity, developers, coverage } = input

  // Prevent division by zero
  const safeCommits = Math.max(commits, 1)
  const safeDevelopers = Math.max(developers, 1)

  // Calculate derived metrics
  const bugDensity = bugs / safeCommits
  const productivity = safeCommits / safeDevelopers

  // Calculate score components with detailed breakdown
  const bugDensityContribution = (1 - Math.min(bugDensity, 1)) * 40
  const complexityContribution = (10 - complexity) * 3
  const coverageContribution = coverage * 0.33

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
    breakdown,
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
