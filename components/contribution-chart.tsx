"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList } from "recharts"
import { Info, Bug, Code2, TestTube } from "lucide-react"
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import type { ScoreBreakdown } from "@/lib/prediction"

interface ContributionChartProps {
  breakdown: ScoreBreakdown
  score: number
}

interface ChartDataItem {
  name: string
  contribution: number
  maxContribution: number
  percentage: number
  fill: string
  status: "good" | "warning" | "bad"
  icon: React.ElementType
  value: string
}

const statusColors = {
  good: "hsl(142.1 76.2% 36.3%)",
  warning: "hsl(45.4 93.4% 47.5%)",
  bad: "hsl(0 84.2% 60.2%)",
}

const statusBgColors = {
  good: "bg-emerald-500",
  warning: "bg-amber-500",
  bad: "bg-red-500",
}

export function ContributionChart({ breakdown, score }: ContributionChartProps) {
  const data: ChartDataItem[] = [
    {
      name: "Bug Density",
      contribution: breakdown.bugDensity.contribution,
      maxContribution: breakdown.bugDensity.maxContribution,
      percentage: Math.round((breakdown.bugDensity.contribution / breakdown.bugDensity.maxContribution) * 100),
      fill: statusColors[breakdown.bugDensity.status],
      status: breakdown.bugDensity.status,
      icon: Bug,
      value: `${breakdown.bugDensity.value} bugs/commit`,
    },
    {
      name: "Complexity",
      contribution: breakdown.complexity.contribution,
      maxContribution: breakdown.complexity.maxContribution,
      percentage: Math.round((breakdown.complexity.contribution / breakdown.complexity.maxContribution) * 100),
      fill: statusColors[breakdown.complexity.status],
      status: breakdown.complexity.status,
      icon: Code2,
      value: `${breakdown.complexity.value}/10`,
    },
    {
      name: "Coverage",
      contribution: breakdown.coverage.contribution,
      maxContribution: breakdown.coverage.maxContribution,
      percentage: Math.round((breakdown.coverage.contribution / breakdown.coverage.maxContribution) * 100),
      fill: statusColors[breakdown.coverage.status],
      status: breakdown.coverage.status,
      icon: TestTube,
      value: `${breakdown.coverage.value}%`,
    },
  ]

  const totalContribution = data.reduce((sum, d) => sum + d.contribution, 0)
  const totalMax = data.reduce((sum, d) => sum + d.maxContribution, 0)

  // Calculate percentage of score each metric contributes
  const contributionPercentages = data.map(d => ({
    ...d,
    scorePercentage: Math.round((d.contribution / totalContribution) * 100),
  }))

  return (
    <Card className="border-border/50 overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm font-medium">Score Contribution</CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">
              How each metric impacts your final score
            </p>
          </div>
          <UITooltip>
            <TooltipTrigger>
              <Info className="h-4 w-4 text-muted-foreground/60 cursor-help" />
            </TooltipTrigger>
            <TooltipContent side="left" className="max-w-[260px] text-xs">
              Each bar shows how much a metric contributes to the total score. Longer bars = better performance in that area.
            </TooltipContent>
          </UITooltip>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Stacked Bar Visual */}
        <div className="space-y-3">
          <div className="flex h-10 w-full overflow-hidden rounded-lg">
            {contributionPercentages.map((item, index) => (
              <UITooltip key={item.name}>
                <TooltipTrigger
                    className={cn(
                      "h-full transition-all duration-500 cursor-pointer hover:opacity-90",
                      statusBgColors[item.status],
                      index === 0 && "rounded-l-lg",
                      index === contributionPercentages.length - 1 && "rounded-r-lg"
                    )}
                    style={{ 
                      width: `${item.scorePercentage}%`,
                      minWidth: item.scorePercentage > 0 ? "24px" : "0",
                    }}
                  />
                <TooltipContent className="text-xs">
                  <div className="font-medium">{item.name}</div>
                  <div className="text-muted-foreground">
                    {item.scorePercentage}% of score ({item.contribution.toFixed(1)} pts)
                  </div>
                </TooltipContent>
              </UITooltip>
            ))}
          </div>
          
          {/* Legend */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
            {contributionPercentages.map((item) => {
              const Icon = item.icon
              return (
                <div key={item.name} className="flex items-center gap-1.5">
                  <div className={cn("h-2.5 w-2.5 rounded-sm", statusBgColors[item.status])} />
                  <Icon className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">{item.name}</span>
                  <span className="font-semibold tabular-nums">{item.scorePercentage}%</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Horizontal Bar Chart */}
        <div className="h-[160px] w-full">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 0, right: 40, left: 0, bottom: 0 }}
              barSize={24}
            >
              <XAxis
                type="number"
                domain={[0, 40]}
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 11, fill: "hsl(var(--foreground))" }}
                axisLine={false}
                tickLine={false}
                width={80}
              />
              <Tooltip
                cursor={{ fill: "hsl(var(--muted))", opacity: 0.3 }}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: 12,
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
                formatter={(value: number, name: string, props: { payload: ChartDataItem }) => {
                  const item = props.payload
                  return [
                    <span key="value" className="font-mono">
                      {value.toFixed(1)} / {item.maxContribution} pts ({item.percentage}%)
                    </span>,
                    item.name
                  ]
                }}
              />
              <Bar 
                dataKey="contribution" 
                radius={[4, 4, 4, 4]}
                animationDuration={800}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
                <LabelList
                  dataKey="contribution"
                  position="right"
                  formatter={(v: number) => `+${v.toFixed(1)}`}
                  style={{ 
                    fontSize: 11, 
                    fontWeight: 600,
                    fill: "hsl(var(--foreground))",
                    fontFeatureSettings: '"tnum"',
                  }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-3">
          {data.map((item) => {
            const Icon = item.icon
            return (
              <div 
                key={item.name}
                className={cn(
                  "rounded-lg border border-border/50 p-3 transition-colors",
                  "hover:bg-muted/50"
                )}
              >
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "flex h-6 w-6 items-center justify-center rounded",
                    item.status === "good" && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                    item.status === "warning" && "bg-amber-500/10 text-amber-600 dark:text-amber-400",
                    item.status === "bad" && "bg-red-500/10 text-red-600 dark:text-red-400"
                  )}>
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    {item.name.split(" ")[0]}
                  </span>
                </div>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-lg font-bold tabular-nums">{item.contribution.toFixed(1)}</span>
                  <span className="text-xs text-muted-foreground">/ {item.maxContribution}</span>
                </div>
                <div className="mt-1 text-[10px] text-muted-foreground">
                  {item.value}
                </div>
              </div>
            )
          })}
        </div>

        {/* Total Score Badge */}
        <div className="flex items-center justify-center">
          <div className={cn(
            "inline-flex items-center gap-2 rounded-full px-4 py-2",
            "border border-border/50 bg-muted/30"
          )}>
            <span className="text-xs font-medium text-muted-foreground">Total Score:</span>
            <span className="text-xl font-bold tabular-nums">{score}</span>
            <span className="text-xs text-muted-foreground">/ 100</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
