"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Code2, TestTube, Users, Info } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import type { RiskCategory } from "@/lib/prediction"

interface RiskBreakdownProps {
  categories: RiskCategory[]
}

const statusColors = {
  good: {
    text: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-500",
    bgLight: "bg-emerald-500/10",
    border: "border-emerald-500/30",
  },
  warning: {
    text: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-500",
    bgLight: "bg-amber-500/10",
    border: "border-amber-500/30",
  },
  bad: {
    text: "text-red-600 dark:text-red-400",
    bg: "bg-red-500",
    bgLight: "bg-red-500/10",
    border: "border-red-500/30",
  },
}

const categoryIcons = {
  "Code Quality": Code2,
  "Testing Quality": TestTube,
  "Team Efficiency": Users,
}

export function RiskBreakdown({ categories }: RiskBreakdownProps) {
  return (
    <Card className="border-border/50">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Risk Categories</CardTitle>
          <Tooltip>
            <TooltipTrigger>
              <Info className="h-4 w-4 text-muted-foreground/60 cursor-help" />
            </TooltipTrigger>
            <TooltipContent side="left" className="max-w-[240px] text-xs">
              Quality is broken down into three risk categories. Each category represents a different aspect of software health.
            </TooltipContent>
          </Tooltip>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {categories.map((category) => {
          const colors = statusColors[category.status]
          const Icon = categoryIcons[category.name as keyof typeof categoryIcons] || Code2

          return (
            <div
              key={category.name}
              className={cn(
                "rounded-lg border p-4 transition-all duration-300",
                colors.bgLight,
                colors.border
              )}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", colors.bgLight)}>
                    <Icon className={cn("h-5 w-5", colors.text)} />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold">{category.name}</h4>
                    <p className="text-xs text-muted-foreground">{category.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={cn("text-2xl font-bold tabular-nums", colors.text)}>
                    {category.percentage}%
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {category.score}/{category.maxScore} pts
                  </p>
                </div>
              </div>
              <div className="mt-3">
                <Progress 
                  value={category.percentage} 
                  className="h-1.5"
                />
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
