"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Code2, GitBranch } from "lucide-react"
import { cn } from "@/lib/utils"
import type { FileAnalysisResult, FileMetrics } from "@/lib/github-file-analyzer"
import { formatFilePath, getRiskColor } from "@/lib/github-file-analyzer"

interface FileAnalysisProps {
  analysis: FileAnalysisResult | null
  isLoading?: boolean
  repoUrl?: string
}

export function FileAnalysis({ analysis, isLoading, repoUrl }: FileAnalysisProps) {
  if (isLoading) {
    return (
      <Card className="border-border/50">
        <CardContent className="py-12 text-center">
          <div className="animate-pulse">
            <Code2 className="mx-auto h-8 w-8 text-muted-foreground/30" />
            <p className="mt-4 text-sm text-muted-foreground">Analyzing repository files...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!analysis) {
    return (
      <Card className="border-border/50 border-dashed">
        <CardContent className="py-12 text-center">
          <Code2 className="mx-auto h-8 w-8 text-muted-foreground/30" />
          <p className="mt-4 text-sm text-muted-foreground">No file analysis available</p>
          <p className="mt-1 text-xs text-muted-foreground/60">Connect a GitHub repository to see complexity hotspots</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="border-border/50">
          <CardContent className="pt-4">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Files Analyzed</p>
            <p className="mt-2 text-2xl font-bold">{analysis.totalFiles}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="pt-4">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Avg Complexity</p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold">{analysis.averageComplexity}</span>
              <span className="text-xs text-muted-foreground">/30</span>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="pt-4">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Risk Level</p>
            <div className="mt-2">
              <Badge variant={
                analysis.riskLevel === "High" ? "destructive" :
                analysis.riskLevel === "Medium" ? "secondary" :
                "default"
              } className="bg-opacity-90">
                {analysis.riskLevel}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Hotspots */}
      {analysis.hotspots.length > 0 && (
        <Card className="border-border/50">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold">Complexity Hotspots</CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">
              Top {analysis.hotspots.length} files requiring attention
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analysis.hotspots.map((file) => (
                <div
                  key={file.path}
                  className={cn(
                    "flex items-center justify-between rounded-lg border p-3 transition-colors",
                    getRiskColor(file.riskScore)
                  )}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Code2 className="h-4 w-4 shrink-0" />
                      <p className="text-xs font-medium truncate">{formatFilePath(file.path)}</p>
                    </div>
                    <div className="mt-1.5 flex gap-3 text-[10px] text-current/70">
                      <span>Lines: {file.size}</span>
                      <span>Complexity: {file.complexity}</span>
                      <span>Contributors: {file.contributors}</span>
                    </div>
                  </div>
                  <div className="ml-4 flex flex-col items-end gap-1">
                    <span className="text-xs font-bold">{file.riskScore}</span>
                    <span className="text-[10px] font-medium opacity-70">Risk</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {analysis.recommendations.length > 0 && (
        <Card className="border-blue-200/50 dark:border-blue-800/50 bg-blue-500/5">
          <CardHeader className="pb-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
              <div className="flex-1">
                <CardTitle className="text-base font-semibold text-blue-900 dark:text-blue-100">
                  Recommendations
                </CardTitle>
                <p className="mt-1 text-xs text-blue-800/70 dark:text-blue-400/70">
                  Actionable insights based on file analysis
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {analysis.recommendations.map((rec, idx) => (
                <li key={idx} className="flex gap-3 text-sm text-blue-900 dark:text-blue-100">
                  <span className="font-bold text-blue-600 dark:text-blue-400 shrink-0">{idx + 1}.</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
