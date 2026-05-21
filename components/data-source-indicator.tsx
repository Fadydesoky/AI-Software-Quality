"use client"

import * as React from "react"
import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { GitBranch, CheckCircle2, AlertCircle } from "lucide-react"

type DataSource = "github" | "manual" | "unavailable"

interface DataSourceIndicatorProps {
  source: DataSource
  repoUrl?: string
  timestamp?: number
  confidence?: "high" | "medium" | "low"
  tooltipText?: string
  compact?: boolean
}

export function DataSourceIndicator({
  source,
  repoUrl,
  timestamp,
  confidence = "high",
  tooltipText,
  compact = false,
}: DataSourceIndicatorProps) {
  const getSourceLabel = (): { label: string; icon: React.ReactNode; color: string } => {
    switch (source) {
      case "github":
        return {
          label: "GitHub API",
          icon: <GitBranch className={compact ? "h-3 w-3" : "h-3.5 w-3.5"} />,
          color: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200/50 dark:border-blue-800/50",
        }
      case "manual":
        return {
          label: "Manual Entry",
          icon: <CheckCircle2 className={compact ? "h-3 w-3" : "h-3.5 w-3.5"} />,
          color: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-800/50",
        }
      case "unavailable":
        return {
          label: "Not Analyzed",
          icon: <AlertCircle className={compact ? "h-3 w-3" : "h-3.5 w-3.5"} />,
          color: "bg-muted text-muted-foreground border-border/50",
        }
    }
  }

  const sourceInfo = getSourceLabel()

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 1) return "just now"
    if (diffMins < 60) return `${diffMins}m ago`

    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`

    const diffDays = Math.floor(diffHours / 24)
    if (diffDays < 7) return `${diffDays}d ago`

    return date.toLocaleDateString()
  }

  const defaultTooltip = React.useMemo(() => {
    const parts: string[] = []
    parts.push(`Source: ${sourceInfo.label}`)

    if (source === "github" && repoUrl) {
      parts.push(`Repository: ${repoUrl}`)
    }

    if (timestamp) {
      parts.push(`Fetched: ${formatDate(timestamp)}`)
    }

    if (source === "github" && confidence) {
      parts.push(`Confidence: ${confidence}`)
    }

    return parts.join("\n")
  }, [source, sourceInfo.label, repoUrl, timestamp, confidence])

  const badgeSize = compact ? "text-[10px] py-0.5 px-2" : "text-xs py-1 px-2.5"

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <Badge
            variant="outline"
            className={`${sourceInfo.color} ${badgeSize} font-medium cursor-help border flex items-center gap-1.5 w-fit`}
          >
            {sourceInfo.icon}
            <span>{sourceInfo.label}</span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-sm whitespace-pre-wrap text-xs">
          {tooltipText || defaultTooltip}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
