"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts"
import type { HistoryEntry } from "@/lib/prediction"

interface TrendChartProps {
  history: HistoryEntry[]
}

export function TrendChart({ history }: TrendChartProps) {
  if (history.length < 2) {
    return null
  }

  const data = history.map((entry, index) => ({
    index: index + 1,
    score: entry.score,
    time: new Date(entry.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  }))

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-4">
        <CardTitle className="text-sm font-medium">Score Trend</CardTitle>
        <p className="text-xs text-muted-foreground">Quality progression over time</p>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <LineChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                interval="preserveStartEnd"
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} 
                domain={[0, 100]}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                cursor={{ stroke: "hsl(var(--border))", strokeDasharray: "4 4" }}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: 12,
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
                formatter={(value) => [`${value ?? 0}`, "Score"]}
              />
              <ReferenceLine 
                y={75} 
                stroke="hsl(142.1 76.2% 36.3%)" 
                strokeDasharray="4 4" 
                strokeOpacity={0.5}
              />
              <ReferenceLine 
                y={50} 
                stroke="hsl(45.4 93.4% 47.5%)" 
                strokeDasharray="4 4" 
                strokeOpacity={0.5}
              />
              <Line 
                type="monotone" 
                dataKey="score" 
                stroke="hsl(var(--foreground))" 
                strokeWidth={2}
                dot={{ fill: "hsl(var(--background))", stroke: "hsl(var(--foreground))", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: "hsl(var(--foreground))" }}
                animationDuration={800}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
