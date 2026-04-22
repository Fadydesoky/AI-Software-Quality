"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Lightbulb, ArrowRight, Target, TrendingUp, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Recommendation } from "@/lib/prediction"

interface RecommendationsProps {
  recommendations: Recommendation[]
  isAdvancedMode?: boolean
}

const priorityColors = {
  high: {
    badge: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30",
    icon: "text-red-500",
    border: "border-l-red-500",
  },
  medium: {
    badge: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
    icon: "text-amber-500",
    border: "border-l-amber-500",
  },
  low: {
    badge: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30",
    icon: "text-blue-500",
    border: "border-l-blue-500",
  },
}

export function Recommendations({ recommendations, isAdvancedMode = false }: RecommendationsProps) {
  if (recommendations.length === 0) {
    return (
      <Card className="border-emerald-500/20 bg-emerald-500/5">
        <CardContent className="flex items-center gap-3 py-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          </div>
          <div>
            <p className="font-medium text-emerald-600 dark:text-emerald-400">All Clear</p>
            <p className="text-sm text-muted-foreground">No critical recommendations at this time</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10">
            <Lightbulb className="h-4 w-4 text-amber-500" />
          </div>
          <div>
            <CardTitle className="text-sm font-medium">Smart Recommendations</CardTitle>
            <p className="text-xs text-muted-foreground">
              {recommendations.length} actionable suggestion{recommendations.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {recommendations.map((rec, index) => {
          const colors = priorityColors[rec.priority]

          return (
            <div
              key={index}
              className={cn(
                "rounded-lg border border-border/50 bg-card p-4 border-l-4 transition-all duration-300 hover:shadow-md",
                colors.border
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={cn("text-[10px] font-medium uppercase", colors.badge)}>
                      {rec.priority} priority
                    </Badge>
                    <span className="text-xs text-muted-foreground">{rec.metric}</span>
                  </div>
                  <p className="text-sm font-medium">{rec.action}</p>
                  {isAdvancedMode && (
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        <span>{rec.impact}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Target className="h-3 w-3" />
                        <span>Target: {rec.targetValue}</span>
                      </div>
                    </div>
                  )}
                </div>
                <ArrowRight className={cn("h-4 w-4 shrink-0 mt-1", colors.icon)} />
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
