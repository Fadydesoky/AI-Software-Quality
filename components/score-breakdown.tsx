"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Bug, Code2, TestTube, Info } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import type { ScoreBreakdown } from "@/lib/prediction"

interface ScoreBreakdownProps {
  breakdown: ScoreBreakdown
}

const statusColors = {
  good: {
    text: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-500",
    bgLight: "bg-emerald-500/10",
  },
  warning: {
    text: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-500",
    bgLight: "bg-amber-500/10",
  },
  bad: {
    text: "text-red-600 dark:text-red-400",
    bg: "bg-red-500",
    bgLight: "bg-red-500/10",
  },
}

export function ScoreBreakdownCard({ breakdown }: ScoreBreakdownProps) {
  const metrics = [
    {
      key: "bugDensity",
      icon: Bug,
      label: "Bug Density",
      data: breakdown.bugDensity,
      format: (v: number) => `${v} bugs/commit`,
      thresholdLabel: `< ${breakdown.bugDensity.threshold}`,
      explanation: "Lower bug density contributes more to the score. Calculated as bugs divided by commits.",
    },
    {
      key: "complexity",
      icon: Code2,
      label: "Code Complexity",
      data: breakdown.complexity,
      format: (v: number) => `${v}/10`,
      thresholdLabel: `< ${breakdown.complexity.threshold}`,
      explanation: "Lower complexity scores better. Based on cyclomatic complexity scale 1-10.",
    },
    {
      key: "coverage",
      icon: TestTube,
      label: "Test Coverage",
      data: breakdown.coverage,
      format: (v: number) => `${v}%`,
      thresholdLabel: `> ${breakdown.coverage.threshold}%`,
      explanation: "Higher test coverage contributes more to the score. Target is 70%+ for healthy projects.",
    },
  ]

  const totalContribution = metrics.reduce((sum, m) => sum + m.data.contribution, 0)
  const totalMax = metrics.reduce((sum, m) => sum + m.data.maxContribution, 0)

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Score Breakdown</CardTitle>
          <Tooltip>
            <TooltipTrigger>
              <Info className="h-4 w-4 text-muted-foreground/60 cursor-help" />
            </TooltipTrigger>
            <TooltipContent side="left" className="max-w-[240px] text-xs">
              Each metric contributes to the final score. Green indicates healthy values, yellow needs attention, and red requires action.
            </TooltipContent>
          </Tooltip>
        </div>
        <p className="text-xs text-muted-foreground">
          Contributing {Math.round(totalContribution)} of {totalMax} possible points
        </p>
      </CardHeader>
      <CardContent className="space-y-5">
        {metrics.map(({ key, icon: Icon, label, data, format, thresholdLabel, explanation }) => {
          const colors = statusColors[data.status]
          const percentage = (data.contribution / data.maxContribution) * 100

          return (
            <div key={key} className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", colors.bgLight)}>
                    <Icon className={cn("h-4 w-4", colors.text)} />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-medium">{label}</span>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-3 w-3 text-muted-foreground/50 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-[200px] text-xs">
                          {explanation}
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Value: <span className={cn("font-semibold", colors.text)}>{format(data.value)}</span>
                      <span className="mx-1.5">|</span>
                      Threshold: {thresholdLabel}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold tabular-nums">
                    +{data.contribution.toFixed(1)}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    of {data.maxContribution} pts
                  </p>
                </div>
              </div>
              <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted/50">
                <div
                  className={cn("h-full rounded-full transition-all duration-500", colors.bg)}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          )
        })}

        {/* Summary */}
        <div className="mt-6 rounded-lg border border-border/50 bg-muted/30 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Total Score</p>
              <p className="mt-1 text-2xl font-bold tabular-nums">{Math.round(totalContribution)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Maximum possible</p>
              <p className="text-lg font-semibold text-muted-foreground">{totalMax}</p>
            </div>
          </div>
          <Progress 
            value={(totalContribution / totalMax) * 100} 
            className="mt-3 h-1.5"
          />
        </div>
      </CardContent>
    </Card>
  )
}
