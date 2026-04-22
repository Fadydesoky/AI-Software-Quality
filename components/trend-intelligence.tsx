"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Minus, Activity } from "lucide-react"
import { cn } from "@/lib/utils"
import type { TrendAnalysis } from "@/lib/prediction"

interface TrendIntelligenceProps {
  trend: TrendAnalysis
}

export function TrendIntelligence({ trend }: TrendIntelligenceProps) {
  const config = {
    improving: {
      icon: TrendingUp,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/30",
      label: "Improving",
    },
    declining: {
      icon: TrendingDown,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
      borderColor: "border-red-500/30",
      label: "Declining",
    },
    stable: {
      icon: Minus,
      color: "text-muted-foreground",
      bgColor: "bg-muted/50",
      borderColor: "border-border/50",
      label: "Stable",
    },
  }

  const { icon: Icon, color, bgColor, borderColor, label } = config[trend.direction]

  return (
    <Card className={cn("border", borderColor, bgColor)}>
      <CardContent className="py-4">
        <div className="flex items-center gap-4">
          <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl", bgColor)}>
            <Icon className={cn("h-6 w-6", color)} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Activity className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Trend Intelligence
              </span>
            </div>
            <p className={cn("text-lg font-semibold mt-0.5", color)}>{label}</p>
            <p className="text-sm text-muted-foreground">{trend.message}</p>
          </div>
          {trend.change !== 0 && (
            <div className="text-right">
              <p className={cn("text-2xl font-bold tabular-nums", color)}>
                {trend.change > 0 ? "+" : ""}{trend.change}
              </p>
              <p className="text-xs text-muted-foreground">points</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
