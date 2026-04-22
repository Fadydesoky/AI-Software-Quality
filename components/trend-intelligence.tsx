"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  LineChart, 
  Line, 
  ResponsiveContainer, 
  Tooltip,
  ReferenceLine,
} from "recharts"
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Activity,
  AlertTriangle,
  CheckCircle2,
  Info,
  Zap,
} from "lucide-react"
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import type { TrendAnalysis, HistoryEntry } from "@/lib/prediction"

interface TrendIntelligenceProps {
  trend: TrendAnalysis
  history?: HistoryEntry[]
}

interface PatternInsight {
  type: "positive" | "warning" | "info"
  message: string
  icon: React.ElementType
}

function detectPatterns(history: HistoryEntry[]): PatternInsight[] {
  if (history.length < 3) return []
  
  const insights: PatternInsight[] = []
  const scores = history.map(h => h.score)
  const recent = scores.slice(-5)
  
  // Detect consistent improvement
  const isImproving = recent.every((s, i) => i === 0 || s >= recent[i - 1])
  if (isImproving && recent.length >= 3) {
    insights.push({
      type: "positive",
      message: "Consistent upward trend detected",
      icon: TrendingUp,
    })
  }
  
  // Detect volatility
  let volatilityCount = 0
  for (let i = 1; i < recent.length; i++) {
    if (Math.abs(recent[i] - recent[i - 1]) > 10) volatilityCount++
  }
  if (volatilityCount >= 2) {
    insights.push({
      type: "warning",
      message: "High score volatility - stability issues",
      icon: AlertTriangle,
    })
  }
  
  // Detect plateau
  const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length
  const isPlateaued = recent.every(s => Math.abs(s - recentAvg) < 3)
  if (isPlateaued && recent.length >= 3) {
    insights.push({
      type: "info",
      message: "Score has plateaued - consider new improvements",
      icon: Info,
    })
  }
  
  // Detect recent spike
  if (history.length >= 2) {
    const lastScore = history[history.length - 1].score
    const prevScore = history[history.length - 2].score
    if (lastScore - prevScore >= 15) {
      insights.push({
        type: "positive",
        message: `Significant improvement: +${lastScore - prevScore} points`,
        icon: Zap,
      })
    }
  }
  
  // Detect approaching risk threshold
  const latestScore = scores[scores.length - 1]
  if (latestScore >= 48 && latestScore <= 52) {
    insights.push({
      type: "warning",
      message: "Score near Medium/High risk threshold",
      icon: AlertTriangle,
    })
  } else if (latestScore >= 73 && latestScore <= 77) {
    insights.push({
      type: "info",
      message: "Score near Low/Medium risk threshold",
      icon: Info,
    })
  }
  
  return insights.slice(0, 3) // Max 3 insights
}

export function TrendIntelligence({ trend, history = [] }: TrendIntelligenceProps) {
  const config = {
    improving: {
      icon: TrendingUp,
      color: "text-emerald-600 dark:text-emerald-400",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/30",
      lineColor: "#10b981",
      label: "Improving",
    },
    declining: {
      icon: TrendingDown,
      color: "text-red-600 dark:text-red-400",
      bgColor: "bg-red-500/10",
      borderColor: "border-red-500/30",
      lineColor: "#ef4444",
      label: "Declining",
    },
    stable: {
      icon: Minus,
      color: "text-muted-foreground",
      bgColor: "bg-muted/50",
      borderColor: "border-border/50",
      lineColor: "hsl(var(--muted-foreground))",
      label: "Stable",
    },
  }

  const { icon: Icon, color, bgColor, borderColor, lineColor, label } = config[trend.direction]
  
  // Prepare sparkline data
  const sparklineData = history.slice(-10).map((h, i) => ({
    index: i,
    score: h.score,
  }))
  
  // Detect patterns
  const insights = detectPatterns(history)

  // Calculate stats
  const scores = history.map(h => h.score)
  const avgScore = scores.length > 0 
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) 
    : 0
  const minScore = scores.length > 0 ? Math.min(...scores) : 0
  const maxScore = scores.length > 0 ? Math.max(...scores) : 0

  return (
    <Card className={cn("border overflow-hidden", borderColor, bgColor)}>
      <CardContent className="py-5">
        <div className="flex items-start gap-5">
          {/* Main Trend Indicator */}
          <div className={cn(
            "flex h-14 w-14 shrink-0 items-center justify-center rounded-xl",
            bgColor,
            "ring-1 ring-inset",
            trend.direction === "improving" && "ring-emerald-500/20",
            trend.direction === "declining" && "ring-red-500/20",
            trend.direction === "stable" && "ring-border/50"
          )}>
            <Icon className={cn("h-7 w-7", color)} />
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Activity className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Trend Intelligence
              </span>
            </div>
            <div className="flex items-center gap-3 mt-1">
              <p className={cn("text-xl font-bold", color)}>{label}</p>
              {trend.change !== 0 && (
                <Badge 
                  variant="outline" 
                  className={cn(
                    "font-bold tabular-nums",
                    trend.direction === "improving" && "border-emerald-500/30 text-emerald-600 dark:text-emerald-400",
                    trend.direction === "declining" && "border-red-500/30 text-red-600 dark:text-red-400"
                  )}
                >
                  {trend.change > 0 ? "+" : ""}{trend.change} pts
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">{trend.message}</p>
            
            {/* Pattern Insights */}
            {insights.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {insights.map((insight, i) => {
                  const InsightIcon = insight.icon
                  return (
                    <UITooltip key={i}>
                      <TooltipTrigger
                          className={cn(
                            "inline-flex items-center gap-1 cursor-help text-[11px] font-medium rounded-md border px-2.5 py-0.5",
                            insight.type === "positive" && "border-emerald-500/30 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400",
                            insight.type === "warning" && "border-amber-500/30 bg-amber-500/5 text-amber-600 dark:text-amber-400",
                            insight.type === "info" && "border-muted bg-muted/50 text-muted-foreground"
                          )}
                        >
                          <InsightIcon className="h-3 w-3" />
                          <span className="hidden sm:inline">{insight.message.split(" ").slice(0, 3).join(" ")}...</span>
                          <span className="sm:hidden">
                            {insight.type === "positive" ? "Good" : insight.type === "warning" ? "Warning" : "Info"}
                          </span>
                        </TooltipTrigger>
                      <TooltipContent className="text-xs max-w-[200px]">
                        {insight.message}
                      </TooltipContent>
                    </UITooltip>
                  )
                })}
              </div>
            )}
          </div>
          
          {/* Sparkline */}
          {sparklineData.length >= 3 && (
            <div className="hidden sm:flex flex-col items-end gap-2">
              <div className="h-[50px] w-[120px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sparklineData} margin={{ top: 4, right: 4, left: 4, bottom: 4 }}>
                    <ReferenceLine y={50} stroke="hsl(var(--border))" strokeDasharray="2 2" />
                    <ReferenceLine y={75} stroke="hsl(var(--border))" strokeDasharray="2 2" />
                    <Tooltip
                      cursor={false}
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "6px",
                        fontSize: 10,
                        padding: "4px 8px",
                      }}
                      formatter={(value) => [`${value}`, "Score"]}
                      labelFormatter={() => ""}
                    />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke={lineColor}
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 3, fill: lineColor }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <span className="text-[10px] text-muted-foreground">Last {sparklineData.length} runs</span>
            </div>
          )}
          
          {/* Stats */}
          {history.length >= 2 && (
            <div className="hidden lg:flex flex-col gap-1 pl-4 border-l border-border/50">
              <div className="text-center">
                <p className="text-lg font-bold tabular-nums">{avgScore}</p>
                <p className="text-[10px] text-muted-foreground">Avg</p>
              </div>
              <div className="flex gap-3 text-center">
                <div>
                  <p className="text-sm font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">{maxScore}</p>
                  <p className="text-[9px] text-muted-foreground">Best</p>
                </div>
                <div>
                  <p className="text-sm font-semibold tabular-nums text-red-600 dark:text-red-400">{minScore}</p>
                  <p className="text-[9px] text-muted-foreground">Worst</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
