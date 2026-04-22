"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, ReferenceDot } from "recharts"
import { TestTube, Code2, RotateCcw } from "lucide-react"
import { cn } from "@/lib/utils"
import { generateSimulationData, type PredictionInput } from "@/lib/prediction"

interface TrendSimulationProps {
  currentInput: PredictionInput
}

type SimulationMetric = "coverage" | "complexity"

export function TrendSimulation({ currentInput }: TrendSimulationProps) {
  const [metric, setMetric] = React.useState<SimulationMetric>("coverage")
  const [simulatedValue, setSimulatedValue] = React.useState(
    metric === "coverage" ? currentInput.coverage : currentInput.complexity
  )

  const data = React.useMemo(() => 
    generateSimulationData(currentInput, metric),
    [currentInput, metric]
  )

  const currentValue = metric === "coverage" ? currentInput.coverage : currentInput.complexity
  const currentScore = data.find(d => d.value === currentValue)?.score ?? 0
  const simulatedScore = data.find(d => d.value === simulatedValue)?.score ?? 
    data.reduce((prev, curr) => 
      Math.abs(curr.value - simulatedValue) < Math.abs(prev.value - simulatedValue) ? curr : prev
    ).score

  const scoreDiff = simulatedScore - currentScore

  const handleMetricChange = (newMetric: SimulationMetric) => {
    setMetric(newMetric)
    setSimulatedValue(newMetric === "coverage" ? currentInput.coverage : currentInput.complexity)
  }

  const handleReset = () => {
    setSimulatedValue(currentValue)
  }

  const handleSliderChange = (value: number | readonly number[]) => {
    const numValue = Array.isArray(value) ? value[0] : value
    setSimulatedValue(numValue)
  }

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm font-medium">What-If Analysis</CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">
              Simulate how changes affect your score
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="h-8 text-xs"
            disabled={simulatedValue === currentValue}
          >
            <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
            Reset
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Metric Toggle */}
        <div className="flex gap-2">
          <Button
            variant={metric === "coverage" ? "default" : "outline"}
            size="sm"
            onClick={() => handleMetricChange("coverage")}
            className="flex-1 h-9"
          >
            <TestTube className="h-4 w-4 mr-2" />
            Coverage
          </Button>
          <Button
            variant={metric === "complexity" ? "default" : "outline"}
            size="sm"
            onClick={() => handleMetricChange("complexity")}
            className="flex-1 h-9"
          >
            <Code2 className="h-4 w-4 mr-2" />
            Complexity
          </Button>
        </div>

        {/* Simulation Slider */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {metric === "coverage" ? "Test Coverage" : "Complexity"}
            </span>
            <span className="text-sm font-semibold tabular-nums">
              {metric === "coverage" ? `${simulatedValue}%` : `${simulatedValue}/10`}
            </span>
          </div>
          <Slider
            value={[simulatedValue]}
            onValueChange={handleSliderChange}
            min={metric === "coverage" ? 0 : 1}
            max={metric === "coverage" ? 100 : 10}
            step={metric === "coverage" ? 5 : 1}
          />
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>{metric === "coverage" ? "0%" : "1 (Simple)"}</span>
            <span>{metric === "coverage" ? "100%" : "10 (Complex)"}</span>
          </div>
        </div>

        {/* Score Impact */}
        <div className="rounded-lg border border-border/50 bg-muted/30 p-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Current</p>
              <p className="mt-1 text-xl font-bold tabular-nums">{currentScore}</p>
            </div>
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Impact</p>
              <p className={cn(
                "mt-1 text-xl font-bold tabular-nums",
                scoreDiff > 0 ? "text-emerald-500" : scoreDiff < 0 ? "text-red-500" : "text-muted-foreground"
              )}>
                {scoreDiff > 0 ? "+" : ""}{scoreDiff}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Simulated</p>
              <p className="mt-1 text-xl font-bold tabular-nums">{simulatedScore}</p>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="h-[180px] w-full">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <LineChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <XAxis
                dataKey="value"
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => metric === "coverage" ? `${v}%` : v.toString()}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
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
                formatter={(value) => [`${value}`, "Score"]}
                labelFormatter={(label) => metric === "coverage" ? `${label}% Coverage` : `Complexity ${label}/10`}
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
                stroke="hsl(var(--muted-foreground))"
                strokeWidth={2}
                dot={false}
                animationDuration={400}
              />
              {/* Current position */}
              <ReferenceDot
                x={currentValue}
                y={currentScore}
                r={6}
                fill="hsl(var(--background))"
                stroke="hsl(var(--foreground))"
                strokeWidth={2}
              />
              {/* Simulated position */}
              {simulatedValue !== currentValue && (
                <ReferenceDot
                  x={simulatedValue}
                  y={simulatedScore}
                  r={6}
                  fill={scoreDiff >= 0 ? "hsl(142.1 76.2% 36.3%)" : "hsl(0 84.2% 60.2%)"}
                  stroke="hsl(var(--background))"
                  strokeWidth={2}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full border-2 border-foreground bg-background" />
            <span>Current</span>
          </div>
          {simulatedValue !== currentValue && (
            <div className="flex items-center gap-1.5">
              <div className={cn(
                "h-2.5 w-2.5 rounded-full",
                scoreDiff >= 0 ? "bg-emerald-500" : "bg-red-500"
              )} />
              <span>Simulated</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
