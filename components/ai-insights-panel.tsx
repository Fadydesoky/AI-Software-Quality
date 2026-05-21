"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Brain, Sparkles, AlertTriangle, TrendingUp, Target, Zap } from "lucide-react"
import { cn } from "@/lib/utils"
import type { PredictionResult, ScoreBreakdown } from "@/lib/prediction"

interface AIInsightsPanelProps {
  result: PredictionResult
  inputValues: {
    commits: number
    bugs: number
    complexity: number
    developers: number
    coverage: number
  }
}

// Generate evidence-backed AI insight following Evidence → Interpretation → Suggested Action
function generateAIInsight(
  result: PredictionResult,
  inputValues: AIInsightsPanelProps["inputValues"]
): string {
  const { risk, score, breakdown, metrics } = result
  
  // Build factor analysis with contributions
  const factors = [
    { 
      name: "bug density", 
      displayName: "Bug Density",
      contribution: breakdown.bugDensity.contribution, 
      max: breakdown.bugDensity.maxContribution, 
      status: breakdown.bugDensity.status, 
      efficiency: Math.round((breakdown.bugDensity.contribution / breakdown.bugDensity.maxContribution) * 100),
      value: metrics.bugDensity.toFixed(2),
      unit: "bugs/commit",
      threshold: "0.3",
    },
    { 
      name: "code complexity", 
      displayName: "Complexity",
      contribution: breakdown.complexity.contribution, 
      max: breakdown.complexity.maxContribution, 
      status: breakdown.complexity.status, 
      efficiency: Math.round((breakdown.complexity.contribution / breakdown.complexity.maxContribution) * 100),
      value: inputValues.complexity.toString(),
      unit: "/10",
      threshold: "7",
    },
    { 
      name: "test coverage", 
      displayName: "Test Coverage",
      contribution: breakdown.coverage.contribution, 
      max: breakdown.coverage.maxContribution, 
      status: breakdown.coverage.status, 
      efficiency: Math.round((breakdown.coverage.contribution / breakdown.coverage.maxContribution) * 100),
      value: inputValues.coverage.toString(),
      unit: "%",
      threshold: "70",
    },
  ]
  
  // Calculate contribution percentages to total score
  const totalContribution = factors.reduce((sum, f) => sum + f.contribution, 0)
  const factorsWithImpact = factors.map(f => ({
    ...f,
    impactPercentage: Math.round((f.contribution / totalContribution) * 100)
  }))
  
  // Sort by efficiency to find best and worst performing
  const sortedByEfficiency = [...factorsWithImpact].sort((a, b) => b.efficiency - a.efficiency)
  const strongestMetric = sortedByEfficiency[0]
  const weakestMetric = sortedByEfficiency[sortedByEfficiency.length - 1]
  
  // Sort by impact to find primary driver
  const sortedByImpact = [...factorsWithImpact].sort((a, b) => b.impactPercentage - a.impactPercentage)
  const primaryDriver = sortedByImpact[0]
  
  // Build insight following Evidence → Interpretation → Suggested Action
  let insight = ""
  
  // EVIDENCE SECTION
  insight += `**EVIDENCE**\n`
  insight += `Risk Level: **${risk}** (Score: **${score}/100**)\n`
  insight += `Primary Driver: **${primaryDriver.displayName}** at **${primaryDriver.value}${primaryDriver.unit}** (threshold: ${primaryDriver.threshold}${primaryDriver.unit}) — **${primaryDriver.impactPercentage}% of total risk**\n`
  
  if (weakestMetric.status !== "good") {
    insight += `Weakest Metric: **${weakestMetric.displayName}** at **${weakestMetric.value}${weakestMetric.unit}** (${weakestMetric.efficiency}% of max contribution)\n`
  }
  
  if (strongestMetric.status === "good") {
    insight += `Strongest Metric: **${strongestMetric.displayName}** at **${strongestMetric.efficiency}% efficiency** (performing well)\n`
  }
  
  // INTERPRETATION SECTION
  insight += `\n**INTERPRETATION**\n`
  
  if (primaryDriver.name === "bug density") {
    insight += `Bug density of **${primaryDriver.value} bugs/commit** exceeds the **${primaryDriver.threshold} bugs/commit** threshold. This indicates high defect rates relative to development activity. High bug density increases production incidents, customer impact, and maintenance costs. It represents **${primaryDriver.impactPercentage}%** of your overall risk score.\n`
  } else if (primaryDriver.name === "code complexity") {
    insight += `Code complexity at **${primaryDriver.value}/10** exceeds the warning threshold of **${primaryDriver.threshold}/10**. Higher complexity makes code harder to understand, test, and maintain safely. Complex code has higher bug density and requires more testing effort. It represents **${primaryDriver.impactPercentage}%** of your overall risk score.\n`
  } else if (primaryDriver.name === "test coverage") {
    insight += `Test coverage at **${primaryDriver.value}%** is below the **${primaryDriver.threshold}%** industry benchmark. Low coverage means **${100 - parseInt(primaryDriver.value)}%** of code paths are untested, increasing bug escape rates to production. Untested code blocks become maintenance risks and regression vectors. It represents **${primaryDriver.impactPercentage}%** of your overall risk score.\n`
  }
  
  // SUGGESTED ACTION SECTION
  insight += `\n**SUGGESTED ACTION**\n`
  
  if (primaryDriver.name === "bug density") {
    const targetBugs = Math.max(Math.round(inputValues.bugs * 0.5), 1)
    const improvement = Math.round((1 - (targetBugs / inputValues.bugs)) * 100)
    insight += `Reduce bug count from **${inputValues.bugs}** to **${targetBugs}** (${improvement}% reduction). Actions: (1) Add error handling to API calls and async operations; (2) Implement input validation for all user-facing functions; (3) Write tests for edge cases (null, empty, timeout scenarios); (4) Use type-safe patterns to catch bugs at compile time.`
  } else if (primaryDriver.name === "code complexity") {
    const targetComplexity = Math.max(inputValues.complexity - 2, 3)
    insight += `Reduce complexity from **${inputValues.complexity}** to **${targetComplexity}** through refactoring. Actions: (1) Break large functions into smaller, focused units (max 50 LOC each); (2) Extract nested conditions into helper functions; (3) Simplify conditional logic using early returns; (4) Replace complex inheritance with composition.`
  } else if (primaryDriver.name === "test coverage") {
    const targetCoverage = Math.min(inputValues.coverage + 20, 90)
    insight += `Increase test coverage from **${inputValues.coverage}%** to **${targetCoverage}%**. Actions: (1) Write unit tests for all public functions; (2) Add integration tests for critical workflows; (3) Test error paths and edge cases explicitly; (4) Set up CI/CD coverage gates (fail builds if coverage drops below ${targetCoverage}%).`
  }
  
  return insight
}

// Find the dominant risk factor
function findDominantFactor(breakdown: ScoreBreakdown): {
  name: string
  percentage: number
  status: "good" | "warning" | "bad"
  icon: React.ElementType
  improvement: string
} {
  const factors = [
    { 
      name: "Bug Density", 
      contribution: breakdown.bugDensity.contribution, 
      max: breakdown.bugDensity.maxContribution, 
      status: breakdown.bugDensity.status,
      icon: AlertTriangle,
      improvement: "Reduce bug count or increase commits"
    },
    { 
      name: "Complexity", 
      contribution: breakdown.complexity.contribution, 
      max: breakdown.complexity.maxContribution, 
      status: breakdown.complexity.status,
      icon: Zap,
      improvement: "Refactor complex code modules"
    },
    { 
      name: "Coverage", 
      contribution: breakdown.coverage.contribution, 
      max: breakdown.coverage.maxContribution, 
      status: breakdown.coverage.status,
      icon: Target,
      improvement: "Add more test coverage"
    },
  ]
  
  // Sort to find worst performing (lowest contribution percentage)
  const sorted = [...factors].sort((a, b) => 
    (a.contribution / a.max) - (b.contribution / b.max)
  )
  
  const worst = sorted[0]
  const totalContribution = factors.reduce((sum, f) => sum + f.contribution, 0)
  
  return {
    name: worst.name,
    percentage: Math.round((worst.contribution / totalContribution) * 100),
    status: worst.status,
    icon: worst.icon,
    improvement: worst.improvement,
  }
}

// Calculate sensitivity of each metric
function calculateSensitivity(breakdown: ScoreBreakdown): Array<{
  name: string
  sensitivity: "High" | "Medium" | "Low"
  impact: number
  description: string
}> {
  // Higher max contribution = more sensitive
  // Status also affects perceived sensitivity
  return [
    {
      name: "Bug Density",
      sensitivity: breakdown.bugDensity.maxContribution >= 35 ? "High" : breakdown.bugDensity.maxContribution >= 20 ? "Medium" : "Low",
      impact: breakdown.bugDensity.maxContribution,
      description: "40 pts max impact",
    },
    {
      name: "Coverage",
      sensitivity: breakdown.coverage.status === "bad" ? "High" : breakdown.coverage.status === "warning" ? "Medium" : "Low",
      impact: breakdown.coverage.maxContribution,
      description: "33 pts max impact",
    },
    {
      name: "Complexity",
      sensitivity: breakdown.complexity.status === "bad" ? "High" : "Medium",
      impact: breakdown.complexity.maxContribution,
      description: "30 pts max impact",
    },
  ]
}

export function AIInsightsPanel({ result, inputValues }: AIInsightsPanelProps) {
  const [isVisible, setIsVisible] = React.useState(false)
  const insight = generateAIInsight(result, inputValues)
  const dominantFactor = findDominantFactor(result.breakdown)
  const sensitivities = calculateSensitivity(result.breakdown)
  
  React.useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const DominantIcon = dominantFactor.icon

  return (
    <Card className={cn(
      "border-border/50 overflow-hidden transition-all duration-500",
      isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
    )}>
      <CardHeader className="pb-4 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5">
                <Brain className="h-5 w-5 text-primary" />
              </div>
              <div className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary">
                <Sparkles className="h-2.5 w-2.5 text-primary-foreground" />
              </div>
            </div>
            <div>
              <CardTitle className="text-sm font-semibold">AI Insight Analysis</CardTitle>
              <p className="text-xs text-muted-foreground">Intelligent system assessment</p>
            </div>
          </div>
          <Badge variant="outline" className="text-[10px] font-medium bg-primary/5 text-primary border-primary/20">
            AI-Powered
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-5 space-y-6">
        {/* Main AI Insight Paragraph */}
        <div className="relative rounded-lg bg-gradient-to-br from-muted/50 to-muted/20 p-4 border border-border/50">
          <div className="absolute -left-px top-4 h-12 w-1 rounded-full bg-primary" />
          <p className="text-sm leading-relaxed text-foreground/90 pl-3">
            {insight.split("**").map((part, index) => 
              index % 2 === 1 ? (
                <span key={index} className="font-semibold text-foreground">{part}</span>
              ) : (
                <span key={index}>{part}</span>
              )
            )}
          </p>
        </div>

        {/* Primary Risk Driver */}
        {dominantFactor.status !== "good" && (
          <div className={cn(
            "rounded-lg p-4 border-l-4 transition-all duration-300",
            dominantFactor.status === "bad" 
              ? "bg-red-500/5 border-l-red-500" 
              : "bg-amber-500/5 border-l-amber-500"
          )}>
            <div className="flex items-start gap-3">
              <div className={cn(
                "flex h-8 w-8 items-center justify-center rounded-lg shrink-0",
                dominantFactor.status === "bad" 
                  ? "bg-red-500/10 text-red-600 dark:text-red-400" 
                  : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
              )}>
                <DominantIcon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Primary Risk Driver
                  </span>
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "text-[10px] font-medium",
                      dominantFactor.status === "bad" 
                        ? "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30" 
                        : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
                    )}
                  >
                    {dominantFactor.status === "bad" ? "Critical" : "Warning"}
                  </Badge>
                </div>
                <p className="mt-1 text-sm font-semibold">{dominantFactor.name}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{dominantFactor.improvement}</p>
              </div>
              <div className="text-right shrink-0">
                <div className="text-lg font-bold tabular-nums">{dominantFactor.percentage}%</div>
                <div className="text-[10px] text-muted-foreground">of impact</div>
              </div>
            </div>
          </div>
        )}

        {/* Score Sensitivity Indicators */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Score Sensitivity
            </span>
            <span className="text-[10px] text-muted-foreground">Impact on total score</span>
          </div>
          <div className="grid gap-2">
            {sensitivities.map((item, index) => (
              <div 
                key={item.name}
                className={cn(
                  "flex items-center justify-between rounded-lg border border-border/50 px-3 py-2.5 transition-all duration-300",
                  "hover:bg-muted/50 hover:border-border"
                )}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">{item.name}</span>
                  <span className="text-[10px] text-muted-foreground">{item.description}</span>
                </div>
                <Badge 
                  variant="outline" 
                  className={cn(
                    "text-[10px] font-semibold",
                    item.sensitivity === "High" 
                      ? "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30" 
                      : item.sensitivity === "Medium"
                      ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
                      : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                  )}
                >
                  {item.sensitivity} Impact
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
