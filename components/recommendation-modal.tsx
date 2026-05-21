"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, AlertCircle, CheckCircle2, TrendingUp, Target } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Recommendation } from "@/lib/prediction"

interface RecommendationModalProps {
  recommendation: Recommendation | null
  open: boolean
  onOpenChange: (open: boolean) => void
  repoUrl?: string
}

const priorityColors = {
  critical: {
    icon: "text-red-500",
    bg: "bg-red-500/10",
    border: "border-red-500/30",
  },
  high: {
    icon: "text-orange-500",
    bg: "bg-orange-500/10",
    border: "border-orange-500/30",
  },
  medium: {
    icon: "text-amber-500",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
  },
  low: {
    icon: "text-blue-500",
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
  },
}

export function RecommendationModal({
  recommendation,
  open,
  onOpenChange,
  repoUrl,
}: RecommendationModalProps) {
  if (!recommendation) {
    return null
  }

  const colors = priorityColors[recommendation.priority]

  // Extract filename from metrics if it's a complexity hotspot
  const filename = recommendation.metric?.includes("Complexity") 
    ? recommendation.targetValue?.split("/")[0] 
    : null

  // Build GitHub URL for direct file viewing
  const getGitHubLink = () => {
    if (!repoUrl || !filename) return null

    // Parse repo URL: https://github.com/owner/repo or owner/repo
    let owner = ""
    let repo = ""

    if (repoUrl.includes("github.com")) {
      const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/)
      if (match) {
        owner = match[1]
        repo = match[2]
      }
    } else if (repoUrl.includes("/")) {
      const parts = repoUrl.split("/")
      owner = parts[0]
      repo = parts[1]
    }

    if (owner && repo) {
      return `https://github.com/${owner}/${repo}/blob/main/${filename}`
    }
    return null
  }

  const githubLink = getGitHubLink()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className="text-xl">{recommendation.action}</DialogTitle>
              <DialogDescription className="mt-2">
                {recommendation.description}
              </DialogDescription>
            </div>
            <Badge
              className={cn(
                "h-fit whitespace-nowrap font-semibold uppercase text-xs",
                colors.bg,
                colors.border,
                "border"
              )}
            >
              {recommendation.priority} Priority
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Metric Information */}
          <div className={cn(
            "rounded-lg border p-4",
            colors.bg,
            colors.border,
            "border"
          )}>
            <h3 className="flex items-center gap-2 font-semibold mb-3">
              <Target className={cn("h-4 w-4", colors.icon)} />
              Metric Information
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground font-medium">Category</p>
                <p className="font-semibold mt-1">{recommendation.metric}</p>
              </div>
              <div>
                <p className="text-muted-foreground font-medium">Impact</p>
                <p className="flex items-center gap-1 font-semibold mt-1">
                  <TrendingUp className="h-4 w-4 text-emerald-500" />
                  {recommendation.impact}
                </p>
              </div>
            </div>
          </div>

          {/* Evidence / Why */}
          <div className="space-y-2">
            <h3 className="font-semibold flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
              Why This Matters
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {recommendation.description}
            </p>
          </div>

          {/* Target / Suggested Actions */}
          <div className="bg-muted/30 rounded-lg border border-border/50 p-4 space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              Suggested Actions
            </h3>
            <ul className="space-y-2 text-sm">
              <li className="flex gap-2 text-muted-foreground">
                <span className="mt-1">•</span>
                <span>{recommendation.action}</span>
              </li>
              {recommendation.targetValue && (
                <li className="flex gap-2 text-muted-foreground">
                  <span className="mt-1">•</span>
                  <span>Target: <strong className="text-foreground">{recommendation.targetValue}</strong></span>
                </li>
              )}
            </ul>
          </div>

          {/* GitHub Link */}
          {githubLink && (
            <div>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => window.open(githubLink, "_blank")}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View File on GitHub
              </Button>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
