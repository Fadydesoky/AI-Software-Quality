"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calculator, ChevronDown, ChevronUp, Code2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface FormulaDisplayProps {
  formulas: {
    bugDensity: string
    score: string
    productivity: string
  }
  breakdown: {
    bugDensity: { contribution: number; maxContribution: number }
    complexity: { contribution: number; maxContribution: number }
    coverage: { contribution: number; maxContribution: number }
  }
}

export function FormulaDisplay({ formulas, breakdown }: FormulaDisplayProps) {
  const [isExpanded, setIsExpanded] = React.useState(false)

  const totalContribution = 
    breakdown.bugDensity.contribution + 
    breakdown.complexity.contribution + 
    breakdown.coverage.contribution

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
              <Calculator className="h-4 w-4 text-blue-500" />
            </div>
            <div>
              <CardTitle className="text-sm font-medium">Scoring Formula</CardTitle>
              <p className="text-xs text-muted-foreground">How your score is calculated</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-8 text-xs"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-3.5 w-3.5 mr-1" />
                Hide
              </>
            ) : (
              <>
                <ChevronDown className="h-3.5 w-3.5 mr-1" />
                Details
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Formula */}
        <div className="rounded-lg bg-muted/50 p-4 font-mono text-sm">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Code2 className="h-3.5 w-3.5" />
            <span className="text-xs uppercase tracking-wider">Score Formula</span>
          </div>
          <code className="text-xs leading-relaxed block">
            {formulas.score}
          </code>
        </div>

        {/* Score Calculation */}
        <div className="rounded-lg border border-border/50 p-4">
          <p className="text-xs text-muted-foreground mb-3">Score Calculation</p>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Bug Density Factor</span>
              <span className="font-mono tabular-nums">+{breakdown.bugDensity.contribution.toFixed(1)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Complexity Factor</span>
              <span className="font-mono tabular-nums">+{breakdown.complexity.contribution.toFixed(1)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Coverage Factor</span>
              <span className="font-mono tabular-nums">+{breakdown.coverage.contribution.toFixed(1)}</span>
            </div>
            <div className="border-t border-border pt-2 mt-2 flex items-center justify-between text-sm font-semibold">
              <span>Total Score</span>
              <span className="font-mono tabular-nums">{Math.round(totalContribution)}</span>
            </div>
          </div>
        </div>

        {/* Expanded Details */}
        {isExpanded && (
          <div className="space-y-3 animate-fade-in">
            <div className="rounded-lg bg-muted/30 p-3">
              <p className="text-xs text-muted-foreground mb-1">Bug Density</p>
              <code className="text-xs font-mono">{formulas.bugDensity}</code>
            </div>
            <div className="rounded-lg bg-muted/30 p-3">
              <p className="text-xs text-muted-foreground mb-1">Productivity</p>
              <code className="text-xs font-mono">{formulas.productivity}</code>
            </div>
            <div className="text-xs text-muted-foreground p-2">
              <p className="font-medium mb-1">Thresholds</p>
              <ul className="space-y-1 ml-3 list-disc">
                <li>Bug Density: {"<"} 0.3 good, {">"} 0.3 warning</li>
                <li>Complexity: {"<"} 7 good, {">"} 7 warning</li>
                <li>Coverage: {">"} 70% good, {"<"} 50% warning</li>
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
