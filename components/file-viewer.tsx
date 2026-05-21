"use client"

import * as React from "react"
import { Loader2, AlertCircle, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { analyzeCodeStructure, type StructuralFinding } from "@/lib/code-structure-analyzer"

interface FileViewerProps {
  owner: string
  repo: string
  filePath: string
  branch: string
  showFindings?: boolean
  highlightedFinding?: StructuralFinding | null
}

export function FileViewer({ owner, repo, filePath, branch, showFindings = true, highlightedFinding }: FileViewerProps) {
  const [content, setContent] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [copied, setCopied] = React.useState(false)
  const [findings, setFindings] = React.useState<StructuralFinding[]>([])
  const [expandedFindings, setExpandedFindings] = React.useState<Set<number>>(new Set())

  React.useEffect(() => {
    const fetchFile = async () => {
      try {
        setLoading(true)
        setError(null)

        const url = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}?ref=${branch}`
        const response = await fetch(url, {
          headers: {
            Accept: "application/vnd.github.v3.raw",
          },
        })

        if (!response.ok) {
          if (response.status === 404) {
            setError(`File not found. Verify the path is correct. Path: ${filePath}. Check if the file exists in the ${branch} branch.`)
          } else if (response.status === 403) {
            setError(`API rate limit exceeded or access denied. Try again later.`)
          } else {
            setError(`GitHub API error: ${response.statusText}. Please verify the repository path and file location.`)
          }
          setContent(null)
          return
        }

        const text = await response.text()
        setContent(text)

        // Analyze code structure to find evidence-backed findings
        if (showFindings) {
          try {
            const analysis = analyzeCodeStructure(text, undefined, filePath)
            setFindings(analysis.findings)
          } catch (err) {
            // Silently fail on analysis - don't break the file viewer
            console.log("[v0] Code structure analysis failed (non-critical)")
            setFindings([])
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch file")
        setContent(null)
      } finally {
        setLoading(false)
      }
    }

    fetchFile()
  }, [owner, repo, filePath, branch, showFindings])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        <span className="ml-2 text-sm text-muted-foreground">Loading file...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-destructive mb-1">Could not load file</h3>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!content) {
    return null
  }

  const lines = content.split("\n")
  const maxLineNumber = lines.length.toString().length

  // Check if a line is in a problematic region
  const isLineHighlighted = (lineNum: number) => {
    return findings.some(f => lineNum >= f.lineRange.start && lineNum <= f.lineRange.end)
  }

  // Get severity color for a highlighted line
  const getLineColor = (lineNum: number) => {
    const finding = findings.find(f => lineNum >= f.lineRange.start && lineNum <= f.lineRange.end)
    if (!finding) return ''
    switch (finding.severity) {
      case 'critical':
        return 'bg-red-500/20 border-l-2 border-red-500'
      case 'high':
        return 'bg-orange-500/15 border-l-2 border-orange-500'
      case 'medium':
        return 'bg-yellow-500/10 border-l-2 border-yellow-500'
      default:
        return 'bg-blue-500/10 border-l-2 border-blue-500'
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground">{filePath}</p>
          {findings.length > 0 && (
            <p className="text-xs text-orange-600 mt-1">
              {findings.length} structural finding{findings.length !== 1 ? 's' : ''} detected
            </p>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            navigator.clipboard.writeText(content)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
          }}
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 mr-1" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-4 w-4 mr-1" />
              Copy
            </>
          )}
        </Button>
      </div>

      {/* Findings List */}
      {findings.length > 0 && showFindings && (
        <div className="space-y-2 bg-muted/20 border border-border rounded-lg p-3">
          <p className="text-xs font-semibold text-foreground">Structural Findings</p>
          {findings.map((finding, idx) => (
            <button
              key={idx}
              onClick={() => {
                const newExpanded = new Set(expandedFindings)
                if (newExpanded.has(idx)) {
                  newExpanded.delete(idx)
                } else {
                  newExpanded.add(idx)
                }
                setExpandedFindings(newExpanded)
              }}
              className={cn(
                "w-full text-left text-xs p-2 rounded border transition-colors",
                finding.severity === 'critical' ? 'bg-red-500/10 border-red-500/30 hover:bg-red-500/15' :
                finding.severity === 'high' ? 'bg-orange-500/10 border-orange-500/30 hover:bg-orange-500/15' :
                finding.severity === 'medium' ? 'bg-yellow-500/10 border-yellow-500/30 hover:bg-yellow-500/15' :
                'bg-blue-500/10 border-blue-500/30 hover:bg-blue-500/15'
              )}
            >
              <div className="font-semibold">
                Lines {finding.lineRange.start}–{finding.lineRange.end}: {finding.type.replace('-', ' ')}
              </div>
              <div className="text-muted-foreground mt-1">{finding.evidence}</div>
              {expandedFindings.has(idx) && (
                <div className="mt-2 pt-2 border-t border-current/20 space-y-1">
                  <div><span className="font-semibold">Why: </span>{finding.interpretation}</div>
                  <div><span className="font-semibold">Action: </span>{finding.suggestedAction}</div>
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Code Viewer */}
      <div className="overflow-x-auto rounded-lg border border-border bg-muted/30 p-4">
        <pre className="font-mono text-xs leading-relaxed">
          {lines.map((line, idx) => {
            const lineNum = idx + 1
            const highlighted = isLineHighlighted(lineNum)
            return (
              <div
                key={idx}
                className={cn(
                  "flex",
                  highlighted ? getLineColor(lineNum) : ''
                )}
              >
                <span
                  className="inline-block w-12 shrink-0 select-none text-right text-muted-foreground pr-4"
                  style={{ minWidth: `${(maxLineNumber + 1) * 0.6}em` }}
                >
                  {lineNum}
                </span>
                <span className="text-foreground break-all">{line}</span>
              </div>
            )
          })}
        </pre>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Showing {lines.length} lines • {owner}/{repo}
      </p>
    </div>
  )
}
