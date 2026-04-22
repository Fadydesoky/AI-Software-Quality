"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts"
import type { HistoryEntry } from "@/lib/prediction"

interface ScoreHistogramProps {
  history: HistoryEntry[]
}

const colors = [
  "var(--chart-3)", // 0-20: red/orange
  "var(--chart-3)", // 21-40: red/orange  
  "var(--chart-4)", // 41-60: amber
  "var(--chart-2)", // 61-80: teal
  "var(--chart-2)", // 81-100: green
]

export function ScoreHistogram({ history }: ScoreHistogramProps) {
  if (history.length < 2) {
    return null
  }

  const buckets = [
    { range: "0-20", min: 0, max: 20, count: 0 },
    { range: "21-40", min: 21, max: 40, count: 0 },
    { range: "41-60", min: 41, max: 60, count: 0 },
    { range: "61-80", min: 61, max: 80, count: 0 },
    { range: "81-100", min: 81, max: 100, count: 0 },
  ]

  history.forEach(entry => {
    const bucket = buckets.find(b => entry.score >= b.min && entry.score <= b.max)
    if (bucket) bucket.count++
  })

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-4">
        <CardTitle className="text-sm font-medium">Score Distribution</CardTitle>
        <p className="text-xs text-muted-foreground">Distribution across all predictions</p>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <BarChart data={buckets} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <XAxis 
                dataKey="range" 
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} 
                allowDecimals={false}
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
                formatter={(value) => {
                  const numValue = typeof value === 'number' ? value : 0
                  return [`${numValue} prediction${numValue !== 1 ? 's' : ''}`, "Count"]
                }}
              />
              <Bar dataKey="count" radius={[6, 6, 0, 0]} animationDuration={800}>
                {buckets.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
