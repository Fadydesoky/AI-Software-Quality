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
import { ExternalLink, AlertCircle, CheckCircle2, TrendingUp, Target, Code2 } from "lucide-react"
import { FileViewer } from "@/components/file-viewer"
import { CodeGenerator } from "@/components/code-generator"
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
  // All hooks must be called unconditionally, before any early returns
  const [showFileViewer, setShowFileViewer] = React.useState(false)
  const [defaultBranch, setDefaultBranch] = React.useState("main")
  const [owner, setOwner] = React.useState("")
  const [repo, setRepo] = React.useState("")

  // Parse repository information and fetch default branch
  React.useEffect(() => {
    if (!repoUrl || !open) return

    // Parse repo URL: https://github.com/owner/repo or owner/repo
    let parsedOwner = ""
    let parsedRepo = ""

    if (repoUrl.includes("github.com")) {
      const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/)
      if (match) {
        parsedOwner = match[1]
        parsedRepo = match[2]
      }
    } else if (repoUrl.includes("/")) {
      const parts = repoUrl.split("/")
      parsedOwner = parts[0]
      parsedRepo = parts[1]
    }

    setOwner(parsedOwner)
    setRepo(parsedRepo)

    // Fetch repository metadata to get the default branch
    if (parsedOwner && parsedRepo) {
      fetch(`https://api.github.com/repos/${parsedOwner}/${parsedRepo}`)
        .then(res => res.json())
        .then(data => {
          if (data.default_branch) {
            setDefaultBranch(data.default_branch)
          }
        })
        .catch(() => {
          // Fallback to main if API call fails
          setDefaultBranch("main")
        })
    }
  }, [repoUrl, open])

  if (!recommendation) {
    return null
  }

  const colors = priorityColors[recommendation.priority]

  // Use filePath if provided, otherwise don't attempt file viewing
  const filename = recommendation.filePath || null

  // Build GitHub URL for direct file viewing
  const getGitHubLink = () => {
    if (!owner || !repo || !filename) return null

    const cleanFilename = filename
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/[<>]/g, '')
      .trim()
    
    // Only create link if filename is actually a file, not a metric value
    if (cleanFilename && !cleanFilename.includes('reduce') && !cleanFilename.includes('increase')) {
      return `https://github.com/${owner}/${repo}/blob/${defaultBranch}/${cleanFilename}`
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
                {recommendation.metric} - {recommendation.priority} priority
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

          {/* File Location - If available */}
          {recommendation.filePath && (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
              <p className="text-xs text-muted-foreground mb-1">Affected File</p>
              <code className="text-sm font-mono text-foreground">{recommendation.filePath}</code>
              {recommendation.lineNumbers && (
                <p className="text-xs text-muted-foreground mt-1">
                  Lines {recommendation.lineNumbers.start}-{recommendation.lineNumbers.end}
                </p>
              )}
            </div>
          )}

          {/* Evidence / Why */}
          <div className="space-y-2">
            <h3 className="font-semibold flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
              Why This Matters
            </h3>
            <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {recommendation.evidence || `This ${recommendation.priority.toLowerCase()}-priority issue affects ${recommendation.metric}. Focus on reducing ${recommendation.targetValue} to improve code quality and maintainability.`}
            </div>
          </div>

          {/* Target / Suggested Actions */}
          <div className="bg-muted/30 rounded-lg border border-border/50 p-4 space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              Action Plan
            </h3>
            <div className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
              {recommendation.action}
            </div>
            {recommendation.metrics && (
              <div className="border-t pt-3 mt-3">
                <p className="text-xs text-muted-foreground font-medium mb-2">Expected Progress</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground">Current:</span>
                    <p className="font-semibold text-foreground">{recommendation.metrics.current}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Target:</span>
                    <p className="font-semibold text-emerald-600">{recommendation.metrics.target}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Code Generator - Always Available */}
          <div className="space-y-3 border-t pt-6">
            <h3 className="font-semibold flex items-center gap-2">
              <Code2 className="h-4 w-4" />
              AI-Powered Code Improvements
            </h3>
            <p className="text-sm text-muted-foreground">
              Get specific code suggestions and examples to address this issue.
            </p>
            <CodeGenerator recommendation={recommendation} />
          </div>

          {/* File Viewer - Optional */}
          {filename && owner && repo && (
            <div className="space-y-3 border-t pt-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold flex items-center gap-2">
                  <Code2 className="h-4 w-4" />
                  Source Code Review
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFileViewer(!showFileViewer)}
                >
                  {showFileViewer ? "Hide" : "Show"}
                </Button>
              </div>
              {showFileViewer && (
                <FileViewer
                  owner={owner}
                  repo={repo}
                  filePath={filename}
                  branch={defaultBranch}
                />
              )}
            </div>
          )}

          {/* GitHub Link - Always available if valid */}
          {githubLink && (
            <div className="border-t pt-4">
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
