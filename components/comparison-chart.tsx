"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { X } from "lucide-react"
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
      </CardContent>
    </Card>
  )
}
