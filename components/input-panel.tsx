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
import { Info, AlertCircle, CheckCircle2, Loader2, GitBranch } from "lucide-react"
import { isValidGitHubUrl, parseGitHubUrl, type GitHubRepoData } from "@/lib/github"
import type { PredictionInput } from "@/lib/prediction"
import { DataSourceIndicator } from "@/components/data-source-indicator"

interface InputPanelProps {
  values: PredictionInput
  onChange: (values: PredictionInput) => void
  onPredict: () => void
  isLoading?: boolean
  disabled?: boolean
  onRepoUrlChange?: (repoUrl: string | undefined) => void
}

interface GitHubFetchState {
  repoUrl: string
  data: GitHubRepoData | null
  error: string | null
  loading: boolean
  timestamp: number | null
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
  disabled,
  onRepoUrlChange,
}: InputPanelProps) {
  const [githubUrl, setGithubUrl] = React.useState("")
  const [githubFetch, setGithubFetch] = React.useState<GitHubFetchState>({
    repoUrl: "",
    data: null,
    error: null,
    loading: false,
    timestamp: null,
  })

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

  const handleAnalyzeRepository = async () => {
    if (!isValidGitHubUrl(githubUrl)) {
      setGithubFetch(prev => ({
        ...prev,
        error: "Please enter a valid GitHub URL or owner/repo format",
      }))
      return
    }

    const parsed = parseGitHubUrl(githubUrl)
    if (!parsed) return

    setGithubFetch(prev => ({
      ...prev,
      loading: true,
      error: null,
    }))

    try {
      const response = await fetch("/api/github/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          owner: parsed.owner,
          repo: parsed.repo,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error?.message || "Failed to fetch repository data")
      }

      const result = await response.json()

      if (result.success && result.data) {
        const { commits, contributorsCount, openIssues, closedIssues } = result.data

        // Calculate metrics from GitHub data
        const updatedValues: PredictionInput = {
          ...values,
          commits: Math.max(commits, 1),
          bugs: openIssues + closedIssues,
          developers: Math.max(contributorsCount, 1),
          // Complexity and coverage remain as manual input (unavailable from GitHub API)
        }

        onChange(updatedValues)

        const fullRepoUrl = `${parsed.owner}/${parsed.repo}`
        setGithubFetch({
          repoUrl: fullRepoUrl,
          data: result.data,
          error: null,
          loading: false,
          timestamp: Date.now(),
        })
        onRepoUrlChange?.(fullRepoUrl)
      } else {
        throw new Error(result.error?.message || "Unknown error occurred")
      }
    } catch (error) {
      console.error("[v0] GitHub fetch error:", error)
      setGithubFetch(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : "Failed to fetch repository data",
      }))
    }
  }

  const isGithubDataLoaded = !!githubFetch.data

  return (
    <TooltipProvider>
      <Card className="border-border/50 shadow-sm">
        <CardHeader className="pb-6">
          <CardTitle className="text-base font-semibold">
            Input Metrics
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* GitHub URL Input Section */}
          <div className="space-y-3 pb-4 border-b border-border/50">
            <div className="flex items-center gap-2">
              <GitBranch className="h-4 w-4 text-muted-foreground" />
              <Label className="text-sm font-medium">GitHub Repository (Optional)</Label>
            </div>
            <div className="flex flex-col gap-2">
              <Input
                placeholder="e.g., owner/repo or https://github.com/owner/repo"
                value={githubUrl}
                onChange={(e) => {
                  setGithubUrl(e.target.value)
                  setGithubFetch(prev => ({ ...prev, error: null }))
                }}
                disabled={githubFetch.loading}
              />
              <Button
                onClick={handleAnalyzeRepository}
                disabled={githubFetch.loading || !githubUrl.trim()}
                variant="outline"
                size="sm"
                className="w-full"
              >
                {githubFetch.loading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />
                    Fetching...
                  </>
                ) : (
                  <>
                    <GitBranch className="h-3.5 w-3.5 mr-2" />
                    Analyze Repository
                  </>
                )}
              </Button>
            </div>

            {/* GitHub Data Loaded Success */}
            {isGithubDataLoaded && (
              <Card className="border-emerald-200/50 dark:border-emerald-800/50 bg-emerald-500/5">
                <CardContent className="flex items-center gap-3 py-3">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <p className="text-sm text-emerald-600 dark:text-emerald-400">
                    Repository data loaded: <strong>{githubFetch.repoUrl}</strong>
                  </p>
                </CardContent>
              </Card>
            )}

            {/* GitHub Data Fetch Error */}
            {githubFetch.error && (
              <Card className="border-red-200/50 dark:border-red-800/50 bg-red-500/5">
                <CardContent className="flex items-center gap-3 py-3">
                  <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 shrink-0" />
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {githubFetch.error}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Data Source Info */}
            {isGithubDataLoaded && (
              <div className="flex flex-col gap-2 text-xs text-muted-foreground p-3 bg-muted/30 rounded-md">
                <p>✓ Commits: {values.commits}</p>
                <p>✓ Total Issues: {values.bugs}</p>
                <p>✓ Contributors: {values.developers}</p>
                <p className="pt-1 text-muted-foreground/70">Complexity and Coverage require manual input</p>
              </div>
            )}
          </div>
          <div className="grid gap-5 sm:grid-cols-3">
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <Label htmlFor="commits" className="text-sm font-medium">Commits</Label>
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
                id="commits"
                type="number"
                min={1}
                max={10000}
                value={values.commits}
                onChange={handleNumberChange("commits")}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <Label htmlFor="bugs" className="text-sm font-medium">Bugs</Label>
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
                id="bugs"
                type="number"
                min={0}
                max={1000}
                value={values.bugs}
                onChange={handleNumberChange("bugs")}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <Label htmlFor="developers" className="text-sm font-medium">Developers</Label>
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
                id="developers"
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
                <Label htmlFor="complexity" className="text-sm font-medium">Complexity</Label>
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
              id="complexity"
              value={[values.complexity]}
              onValueChange={handleSliderChange("complexity")}
              min={1}
              max={10}
              step={1}
              aria-label="Complexity level"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Label htmlFor="coverage" className="text-sm font-medium">Test Coverage</Label>
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
              id="coverage"
              value={[values.coverage]}
              onValueChange={handleSliderChange("coverage")}
              min={0}
              max={100}
              step={1}
              aria-label="Test coverage percentage"
            />
          </div>

          <div className="border-t border-border/50" />

          {isGithubDataLoaded && (
            <div className="flex items-center gap-2 rounded-md bg-blue-500/5 border border-blue-200/50 dark:border-blue-800/50 px-3 py-2">
              <DataSourceIndicator
                source="github"
                repoUrl={githubFetch.repoUrl}
                timestamp={githubFetch.timestamp || undefined}
                compact
              />
              <span className="text-xs text-muted-foreground">
                Metrics: Commits, Issues, Contributors
              </span>
            </div>
          )}

          <Button
            onClick={onPredict}
            className="w-full"
            disabled={isLoading || disabled}
          >
            {isLoading ? "Analyzing..." : "Save Scenario"}
          </Button>
        </CardContent>
      </Card>
    </TooltipProvider>
  )
}
