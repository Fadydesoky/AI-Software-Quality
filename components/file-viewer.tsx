"use client"

import * as React from "react"
import { Loader2, AlertCircle, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface FileViewerProps {
  owner: string
  repo: string
  filePath: string
  branch: string
}

export function FileViewer({ owner, repo, filePath, branch }: FileViewerProps) {
  const [content, setContent] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [copied, setCopied] = React.useState(false)

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
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch file")
        setContent(null)
      } finally {
        setLoading(false)
      }
    }

    fetchFile()
  }, [owner, repo, filePath, branch])

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

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground">{filePath}</p>
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

      <div className="overflow-x-auto rounded-lg border border-border bg-muted/30 p-4">
        <pre className="font-mono text-xs leading-relaxed">
          {lines.map((line, idx) => (
            <div key={idx} className="flex">
              <span
                className="inline-block w-12 shrink-0 select-none text-right text-muted-foreground pr-4"
                style={{ minWidth: `${(maxLineNumber + 1) * 0.6}em` }}
              >
                {idx + 1}
              </span>
              <span className="text-foreground break-all">{line}</span>
            </div>
          ))}
        </pre>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Showing {lines.length} lines • {owner}/{repo}
      </p>
    </div>
  )
}
