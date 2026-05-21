"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, CheckCircle2, AlertCircle, Shield, TrendingUp, Bug, Code2, Users, GitBranch } from "lucide-react"
import { cn } from "@/lib/utils"
import type { PredictionInput, PredictionResult } from "@/lib/prediction"
import { getRiskColor, getBadgeVariant } from "@/lib/prediction"
import { ScoreGauge } from "./score-gauge"
import { DataSourceIndicator } from "./data-source-indicator"

interface ResultsCardProps {
  result: PredictionResult | null
  previousScore?: number
  inputValues?: PredictionInput
  repoUrl?: string
}

export function ResultsCard({ result, previousScore, inputValues, repoUrl }: ResultsCardProps) {
  if (!result) {
    return (
      <Card className="border-border/50 border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-20 text-center">
          <div className="relative">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-muted/80 to-muted/30">
              <Shield className="h-10 w-10 text-muted-foreground/30" />
            </div>
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-muted/0 to-muted/0 animate-pulse" />
          </div>
          <p className="mt-6 text-sm font-medium text-muted-foreground">
            Enter metrics and click Predict
          </p>
          <p className="mt-1 text-xs text-muted-foreground/60">
            Results will appear here
          </p>
        </CardContent>
      </Card>
    )
  }

  const { label: badgeLabel, variant: badgeVariant } = getBadgeVariant(result.score)
  const RiskIcon = result.risk === "High" ? AlertTriangle : result.risk === "Medium" ? AlertCircle : CheckCircle2

  return (
    <div className="space-y-5">
      {/* Main Score Card with Gauge */}
      <Card className={cn(
        "overflow-hidden border-border/50",
        "bg-gradient-to-br from-card via-card to-muted/20"
      )}>
        <CardContent className="py-8">
          <ScoreGauge
            score={result.score}
            previousScore={previousScore}
            risk={result.risk}
            confidence={result.confidence}
            confidenceLevel={result.confidenceLevel}
            size="md"
          />
        </CardContent>
      </Card>

      {/* Data Sources Section */}
      {repoUrl && (
        <Card className="border-blue-200/50 dark:border-blue-800/50 bg-blue-500/5">
          <CardContent className="py-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <GitBranch className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  Repository Analysis
                </p>
              </div>
              <div className="text-xs text-muted-foreground break-all">
                {repoUrl}
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                <DataSourceIndicator source="github" repoUrl={repoUrl} compact />
                <span className="text-xs text-muted-foreground">Auto-fetched from GitHub API</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { 
            icon: Bug, 
            label: "Bug Density", 
            value: result.metrics.bugDensity,
            status: result.breakdown.bugDensity.status,
            source: repoUrl ? "github" : "manual",
          },
          { 
            icon: TrendingUp, 
            label: "Productivity", 
            value: result.metrics.productivity,
            suffix: "c/dev",
            status: "good" as const,
            source: repoUrl ? "github" : "manual",
          },
          { 
            icon: Code2, 
            label: "Complexity", 
            value: `${result.metrics.complexity}`,
            suffix: "/10",
            status: result.breakdown.complexity.status,
            source: "manual",
          },
          { 
            icon: Users, 
            label: "Coverage", 
            value: `${result.metrics.coverage}`,
            suffix: "%",
            status: result.breakdown.coverage.status,
            source: "manual",
          },
        ].map(({ icon: Icon, label, value, suffix, status, source }) => (
          <Card 
            key={label} 
            className={cn(
              "border-border/50 transition-all hover:border-border hover:shadow-sm",
              "group"
            )}
          >
            <CardContent className="py-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-3 flex-1">
                  <div className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-lg transition-colors",
                    status === "good" && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                    status === "warning" && "bg-amber-500/10 text-amber-600 dark:text-amber-400",
                    status === "bad" && "bg-red-500/10 text-red-600 dark:text-red-400"
                  )}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
                    <p className="text-base font-bold tabular-nums">
                      {value}
                      {suffix && <span className="text-xs font-normal text-muted-foreground">{suffix}</span>}
                    </p>
                  </div>
                </div>
              </div>
              {repoUrl && (["Commits", "Total Issues", "Contributors"].includes(label) || label === "Bugs Density") && (
                <div className="pt-2">
                  <DataSourceIndicator source="github" compact tooltipText="Fetched from GitHub API" />
                </div>
              )}
              {!repoUrl && (
                <div className="pt-2">
                  <DataSourceIndicator source="manual" compact tooltipText="Manually entered" />
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Areas for Improvement */}
      {result.reasons.length > 0 && (
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Areas for Improvement</CardTitle>
              <Badge variant="outline" className="text-[10px] font-medium">
                {result.reasons.length} {result.reasons.length === 1 ? "issue" : "issues"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <ul className="space-y-3">
              {result.reasons.map((reason, index) => (
                <li 
                  key={index} 
                  className={cn(
                    "flex items-start gap-3 rounded-lg p-3 transition-colors",
                    "bg-amber-500/5 border border-amber-500/10"
                  )}
                >
                  <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                  <span className="text-sm text-foreground/80">{reason}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {result.reasons.length === 0 && (
        <Card className="border-emerald-500/20 bg-emerald-500/5">
          <CardContent className="flex items-center gap-4 py-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                All metrics are healthy
              </p>
              <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70">
                No immediate actions required
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
