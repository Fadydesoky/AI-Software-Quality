"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  ReferenceLine,
  CartesianGrid,
} from "recharts"
import { 
  TestTube, 
  Code2, 
  Bug, 
  RotateCcw, 
  TrendingUp, 
  TrendingDown,
  Minus,
  Sparkles,
  ArrowRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { predictQuality, type PredictionInput } from "@/lib/prediction"

interface WhatIfSimulatorProps {
  currentInput: PredictionInput
}

interface SimulationState {
  coverage: number
  complexity: number
  bugs: number
}

export function WhatIfSimulator({ currentInput }: WhatIfSimulatorProps) {
  const [simulation, setSimulation] = React.useState<SimulationState>({
    coverage: currentInput.coverage,
    complexity: currentInput.complexity,
    bugs: currentInput.bugs,
  })

  const [isAnimating, setIsAnimating] = React.useState(false)

  // Calculate current and simulated scores
  const currentResult = React.useMemo(() => predictQuality(currentInput), [currentInput])
  
  const simulatedResult = React.useMemo(() => {
    return predictQuality({
      ...currentInput,
      coverage: simulation.coverage,
      complexity: simulation.complexity,
      bugs: simulation.bugs,
    })
  }, [currentInput, simulation])

  const scoreDiff = simulatedResult.score - currentResult.score
  const hasChanges = 
    simulation.coverage !== currentInput.coverage ||
    simulation.complexity !== currentInput.complexity ||
    simulation.bugs !== currentInput.bugs

  // Generate simulation data for the chart
  const chartData = React.useMemo(() => {
    const data: { coverage: number; score: number; simulated?: number }[] = []
    for (let cov = 0; cov <= 100; cov += 5) {
      const result = predictQuality({
        ...currentInput,
        coverage: cov,
        complexity: simulation.complexity,
        bugs: simulation.bugs,
      })
      data.push({
        coverage: cov,
        score: result.score,
        simulated: cov === simulation.coverage ? result.score : undefined,
      })
    }
    return data
  }, [currentInput, simulation.complexity, simulation.bugs, simulation.coverage])

  const handleReset = () => {
    setIsAnimating(true)
    setSimulation({
      coverage: currentInput.coverage,
      complexity: currentInput.complexity,
      bugs: currentInput.bugs,
    })
    setTimeout(() => setIsAnimating(false), 300)
  }

  const handleOptimize = () => {
    setIsAnimating(true)
    // Suggest optimal values
    setSimulation({
      coverage: Math.min(currentInput.coverage + 20, 90),
      complexity: Math.max(currentInput.complexity - 2, 3),
      bugs: Math.max(Math.round(currentInput.bugs * 0.7), 0),
    })
    setTimeout(() => setIsAnimating(false), 300)
  }

  const metrics = [
    {
      key: "coverage" as const,
      label: "Test Coverage",
      icon: TestTube,
      current: currentInput.coverage,
      simulated: simulation.coverage,
      min: 0,
      max: 100,
      step: 5,
      format: (v: number) => `${v}%`,
      color: "emerald",
      description: "Higher is better",
    },
    {
      key: "complexity" as const,
      label: "Code Complexity",
      icon: Code2,
      current: currentInput.complexity,
      simulated: simulation.complexity,
      min: 1,
      max: 10,
      step: 1,
      format: (v: number) => `${v}/10`,
      color: "amber",
      description: "Lower is better",
    },
    {
      key: "bugs" as const,
      label: "Bug Count",
      icon: Bug,
      current: currentInput.bugs,
      simulated: simulation.bugs,
      min: 0,
      max: Math.max(currentInput.bugs * 2, 100),
      step: 1,
      format: (v: number) => `${v}`,
      color: "red",
      description: "Lower is better",
    },
  ]

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "Low": return "text-emerald-500"
      case "Medium": return "text-amber-500"
      case "High": return "text-red-500"
      default: return "text-muted-foreground"
    }
  }

  return (
    <Card className="border-border/50 overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary/10 to-primary/5">
              <Sparkles className="h-4.5 w-4.5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold">What-If Simulator</CardTitle>
              <p className="text-xs text-muted-foreground">
                Adjust metrics to preview score changes
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleOptimize}
              className="h-8 text-xs"
            >
              <TrendingUp className="h-3.5 w-3.5 mr-1.5" />
              Optimize
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="h-8 text-xs"
              disabled={!hasChanges}
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
              Reset
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Score Comparison */}
        <div className={cn(
          "rounded-xl border border-border/50 bg-gradient-to-br from-muted/50 to-muted/20 p-5 transition-all duration-300",
          isAnimating && "scale-[0.99] opacity-90"
        )}>
          <div className="flex items-center justify-between">
            {/* Current Score */}
            <div className="text-center">
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Current</p>
              <p className="mt-2 text-3xl font-bold tabular-nums">{currentResult.score}</p>
              <Badge 
                variant="outline" 
                className={cn("mt-2", getRiskColor(currentResult.risk))}
              >
                {currentResult.risk} Risk
              </Badge>
            </div>

            {/* Arrow & Diff */}
            <div className="flex flex-col items-center gap-1 px-4">
              <ArrowRight className="h-5 w-5 text-muted-foreground/50" />
              <div className={cn(
                "flex items-center gap-1 rounded-full px-3 py-1 text-sm font-bold tabular-nums transition-all",
                scoreDiff > 0 && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                scoreDiff < 0 && "bg-red-500/10 text-red-600 dark:text-red-400",
                scoreDiff === 0 && "bg-muted text-muted-foreground"
              )}>
                {scoreDiff > 0 ? (
                  <TrendingUp className="h-3.5 w-3.5" />
                ) : scoreDiff < 0 ? (
                  <TrendingDown className="h-3.5 w-3.5" />
                ) : (
                  <Minus className="h-3.5 w-3.5" />
                )}
                {scoreDiff > 0 ? "+" : ""}{scoreDiff}
              </div>
            </div>

            {/* Simulated Score */}
            <div className="text-center">
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Simulated</p>
              <p className={cn(
                "mt-2 text-3xl font-bold tabular-nums transition-colors",
                scoreDiff > 0 && "text-emerald-600 dark:text-emerald-400",
                scoreDiff < 0 && "text-red-600 dark:text-red-400"
              )}>
                {simulatedResult.score}
              </p>
              <Badge 
                variant="outline" 
                className={cn("mt-2", getRiskColor(simulatedResult.risk))}
              >
                {simulatedResult.risk} Risk
              </Badge>
            </div>
          </div>
        </div>

        {/* Metric Sliders */}
        <div className="space-y-5">
          {metrics.map((metric) => {
            const Icon = metric.icon
            const diff = metric.simulated - metric.current
            const isImproved = metric.key === "coverage" ? diff > 0 : diff < 0
            const showDiff = diff !== 0

            return (
              <div key={metric.key} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-lg",
                      metric.color === "emerald" && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                      metric.color === "amber" && "bg-amber-500/10 text-amber-600 dark:text-amber-400",
                      metric.color === "red" && "bg-red-500/10 text-red-600 dark:text-red-400"
                    )}>
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <span className="text-sm font-medium">{metric.label}</span>
                      <p className="text-[10px] text-muted-foreground">{metric.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-right">
                    <span className="text-sm text-muted-foreground tabular-nums">
                      {metric.format(metric.current)}
                    </span>
                    {showDiff && (
                      <>
                        <ArrowRight className="h-3 w-3 text-muted-foreground/50" />
                        <span className={cn(
                          "text-sm font-semibold tabular-nums",
                          isImproved ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                        )}>
                          {metric.format(metric.simulated)}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <Slider
                  value={[metric.simulated]}
                  onValueChange={(value) => {
                    const newValue = Array.isArray(value) ? value[0] : value
                    setSimulation(prev => ({ ...prev, [metric.key]: newValue }))
                  }}
                  min={metric.min}
                  max={metric.max}
                  step={metric.step}
                  className={cn(
                    "transition-opacity",
                    isAnimating && "opacity-50"
                  )}
                />
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>{metric.format(metric.min)}</span>
                  <span>{metric.format(metric.max)}</span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Impact Chart */}
        <div className="space-y-3">
          <p className="text-xs font-medium text-muted-foreground">
            Coverage Impact Curve
          </p>
          <div className="h-[140px] w-full">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <AreaChart 
                data={chartData} 
                margin={{ top: 8, right: 8, left: -24, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="hsl(var(--border))" 
                  opacity={0.5}
                  vertical={false}
                />
                <XAxis
                  dataKey="coverage"
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${v}%`}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
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
                  labelFormatter={(label) => `${label}% Coverage`}
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
                <ReferenceLine
                  x={currentInput.coverage}
                  stroke="hsl(var(--foreground))"
                  strokeDasharray="4 4"
                  strokeOpacity={0.3}
                />
                {hasChanges && (
                  <ReferenceLine
                    x={simulation.coverage}
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    strokeOpacity={0.8}
                  />
                )}
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fill="url(#scoreGradient)"
                  animationDuration={400}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions */}
        {scoreDiff !== 0 && (
          <div className={cn(
            "rounded-lg border p-4 transition-all",
            scoreDiff > 0 
              ? "border-emerald-500/30 bg-emerald-500/5" 
              : "border-red-500/30 bg-red-500/5"
          )}>
            <p className="text-xs font-medium">
              {scoreDiff > 0 ? (
                <span className="text-emerald-600 dark:text-emerald-400">
                  These changes would improve your score by {scoreDiff} points
                </span>
              ) : (
                <span className="text-red-600 dark:text-red-400">
                  Warning: These changes would decrease your score by {Math.abs(scoreDiff)} points
                </span>
              )}
            </p>
            {simulatedResult.risk !== currentResult.risk && (
              <p className="mt-1 text-[11px] text-muted-foreground">
                Risk level would change from {currentResult.risk} to {simulatedResult.risk}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
