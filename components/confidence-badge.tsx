"use client"

import * as React from "react"
import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Shield, Info } from "lucide-react"
import { cn } from "@/lib/utils"

interface ConfidenceBadgeProps {
  confidence: number
  confidenceLevel: "Low" | "Medium" | "High"
}

const levelConfig = {
  Low: {
    color: "text-red-500",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/30",
    description: "Prediction is near threshold boundaries. Results may vary.",
  },
  Medium: {
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/30",
    description: "Moderate certainty in prediction. Some metrics are borderline.",
  },
  High: {
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/30",
    description: "High certainty in prediction. Metrics are clearly defined.",
  },
}

export function ConfidenceBadge({ confidence, confidenceLevel }: ConfidenceBadgeProps) {
  const config = levelConfig[confidenceLevel]

  return (
    <Tooltip>
      <TooltipTrigger>
        <div className={cn(
          "inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 cursor-help transition-all duration-200 hover:shadow-sm",
          config.bgColor,
          config.borderColor
        )}>
          <Shield className={cn("h-4 w-4", config.color)} />
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground">Confidence:</span>
            <span className={cn("text-sm font-semibold", config.color)}>
              {confidenceLevel}
            </span>
            <span className="text-xs text-muted-foreground">({confidence}%)</span>
          </div>
          <Info className="h-3 w-3 text-muted-foreground/50" />
        </div>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="max-w-[240px] text-xs">
        <p className="font-medium mb-1">{confidenceLevel} Confidence</p>
        <p className="text-muted-foreground">{config.description}</p>
      </TooltipContent>
    </Tooltip>
  )
}
