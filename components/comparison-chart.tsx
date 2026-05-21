"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { X, TrendingUp, TrendingDown, Minus } from "lucide-react"
import { cn } from "@/lib/utils"
import type { HistoryEntry } from "@/lib/prediction"

interface ComparisonChartProps {
  entries: [HistoryEntry, HistoryEntry]
  onClose: () => void
}

export function ComparisonChart({ entries, onClose }: ComparisonChartProps) {
  const [entryA, entryB] = entries

  const data = [
    {
      name: "Bugs",
      "Scenario A": entryA.bugs,
      "Scenario B": entryB.bugs,
    },
    {
      name: "Coverage",
      "Scenario A": entryA.coverage,
      "Scenario B": entryB.coverage,
    },
    {
      name: "Complexity",
      "Scenario A": entryA.complexity * 10,
      "Scenario B": entryB.complexity * 10,
    },
    {
      name: "Score",
      "Scenario A": entryA.score,
      "Scenario B": entryB.score,
    },
  ]

  return (
    <Card className="border-border/50">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="text-base font-semibold">Scenario Comparison</CardTitle>
          <p className="mt-1 text-xs text-muted-foreground">
            Comparing predictions from {new Date(entryA.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} vs {new Date(entryB.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-lg">
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="h-[240px] w-full">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <BarChart data={data} margin={{ top: 16, right: 16, left: -16, bottom: 0 }}>
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} 
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} 
                axisLine={false}
                tickLine={false}
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
              />
              <Legend 
                wrapperStyle={{ fontSize: 12, paddingTop: 16 }}
              />
              <Bar dataKey="Scenario A" fill="var(--chart-1)" radius={[4, 4, 0, 0]} animationDuration={600} />
              <Bar dataKey="Scenario B" fill="var(--chart-2)" radius={[4, 4, 0, 0]} animationDuration={600} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-border/50 bg-muted/30 p-3">
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full bg-[var(--chart-1)]" />
              <p className="text-xs font-medium">Scenario A</p>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Risk: <span className="font-semibold text-foreground">{entryA.risk}</span> | Score: <span className="font-semibold text-foreground">{entryA.score}</span>
            </p>
          </div>
          <div className="rounded-lg border border-border/50 bg-muted/30 p-3">
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full bg-[var(--chart-2)]" />
              <p className="text-xs font-medium">Scenario B</p>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Risk: <span className="font-semibold text-foreground">{entryB.risk}</span> | Score: <span className="font-semibold text-foreground">{entryB.score}</span>
            </p>
          </div>
        </div>

        {/* Delta Analysis */}
        <div className="mt-6 space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Impact Analysis (B vs A)</h4>
          <div className="grid gap-2">
            {[
              { label: "Score", valueA: entryA.score, valueB: entryB.score, format: (v: number) => v.toString(), betterIsHigher: true },
              { label: "Bugs", valueA: entryA.bugs, valueB: entryB.bugs, format: (v: number) => v.toString(), betterIsHigher: false },
              { label: "Coverage", valueA: entryA.coverage, valueB: entryB.coverage, format: (v: number) => `${v}%`, betterIsHigher: true },
              { label: "Complexity", valueA: entryA.complexity, valueB: entryB.complexity, format: (v: number) => `${v}/10`, betterIsHigher: false },
            ].map(({ label, valueA, valueB, format, betterIsHigher }) => {
              const delta = valueB - valueA
              const deltaPercent = valueA !== 0 ? ((delta / valueA) * 100).toFixed(0) : 0
              const isImprovement = betterIsHigher ? delta > 0 : delta < 0
              const isDeteriorated = betterIsHigher ? delta < 0 : delta > 0

              return (
                <div key={label} className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/20 px-3 py-2">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">{label}</p>
                    <p className="mt-0.5 text-[10px] text-muted-foreground/60">
                      {format(valueA)} → {format(valueB)}
                    </p>
                  </div>
                  <div className={cn(
                    "flex items-center gap-1 rounded-md px-2 py-1",
                    isImprovement && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                    isDeteriorated && "bg-red-500/10 text-red-600 dark:text-red-400",
                    delta === 0 && "bg-muted/50 text-muted-foreground"
                  )}>
                    {isImprovement && <TrendingUp className="h-3 w-3" />}
                    {isDeteriorated && <TrendingDown className="h-3 w-3" />}
                    {delta === 0 && <Minus className="h-3 w-3" />}
                    <span className="text-xs font-semibold">
                      {delta > 0 ? "+" : ""}{delta === 0 ? "No change" : `${deltaPercent}%`}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
