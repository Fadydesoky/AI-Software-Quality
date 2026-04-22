"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Info } from "lucide-react"
import type { PredictionInput } from "@/lib/prediction"

interface InputPanelProps {
  values: PredictionInput
  onChange: (values: PredictionInput) => void
  onPredict: () => void
  isLoading?: boolean
}

const tooltips = {
  commits:
    "Total number of commits in the analyzed period. Higher commit counts with fewer bugs indicate healthier development.",
  bugs:
    "Number of bugs or defects found. Directly impacts the bug density metric.",
  complexity:
    "Code complexity score from 1 (simple) to 10 (very complex). Higher complexity often correlates with more bugs.",
  developers:
    "Number of developers working on the project. Used to calculate productivity metrics.",
  coverage:
    "Percentage of code covered by tests. Higher coverage generally means fewer production bugs.",
}

export function InputPanel({
  values,
  onChange,
  onPredict,
  isLoading,
}: InputPanelProps) {
  const handleNumberChange =
    (field: keyof PredictionInput) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseInt(e.target.value) || 0
      onChange({ ...values, [field]: value })
    }

  const handleSliderChange =
    (field: keyof PredictionInput) => (value: number | readonly number[]) => {
      const numValue = Array.isArray(value) ? value[0] : value
      onChange({ ...values, [field]: numValue })
    }

  return (
    <TooltipProvider>
      <Card className="border-border/50 shadow-sm">
        <CardHeader className="pb-6">
          <CardTitle className="text-base font-semibold">
            Input Metrics
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid gap-5 sm:grid-cols-3">
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <Label className="text-sm font-medium">Commits</Label>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-3.5 w-3.5 text-muted-foreground/60 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-[200px] text-xs">
                    {tooltips.commits}
                  </TooltipContent>
                </Tooltip>
              </div>

              <Input
                type="number"
                min={1}
                max={10000}
                value={values.commits}
                onChange={handleNumberChange("commits")}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <Label className="text-sm font-medium">Bugs</Label>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-3.5 w-3.5 text-muted-foreground/60 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-[200px] text-xs">
                    {tooltips.bugs}
                  </TooltipContent>
                </Tooltip>
              </div>

              <Input
                type="number"
                min={0}
                max={1000}
                value={values.bugs}
                onChange={handleNumberChange("bugs")}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <Label className="text-sm font-medium">Developers</Label>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-3.5 w-3.5 text-muted-foreground/60 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-[200px] text-xs">
                    {tooltips.developers}
                  </TooltipContent>
                </Tooltip>
              </div>

              <Input
                type="number"
                min={1}
                max={100}
                value={values.developers}
                onChange={handleNumberChange("developers")}
              />
            </div>
          </div>

          <div className="border-t border-border/50" />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Label className="text-sm font-medium">Complexity</Label>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-3.5 w-3.5 text-muted-foreground/60 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-[200px] text-xs">
                    {tooltips.complexity}
                  </TooltipContent>
                </Tooltip>
              </div>
              <span className="text-sm font-semibold">
                {values.complexity}
              </span>
            </div>

            <Slider
              value={[values.complexity]}
              onValueChange={handleSliderChange("complexity")}
              min={1}
              max={10}
              step={1}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Label className="text-sm font-medium">Test Coverage</Label>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-3.5 w-3.5 text-muted-foreground/60 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-[200px] text-xs">
                    {tooltips.coverage}
                  </TooltipContent>
                </Tooltip>
              </div>
              <span className="text-sm font-semibold">
                {values.coverage}%
              </span>
            </div>

            <Slider
              value={[values.coverage]}
              onValueChange={handleSliderChange("coverage")}
              min={0}
              max={100}
              step={1}
            />
          </div>

          <div className="border-t border-border/50" />

          <Button
            onClick={onPredict}
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? "Analyzing..." : "Predict Quality"}
          </Button>
        </CardContent>
      </Card>
    </TooltipProvider>
  )
}
