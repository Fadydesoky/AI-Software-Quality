"use client"

import * as React from "react"
import { Copy, Check, AlertCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { analyzeCodeStructure, type StructuralFinding } from "@/lib/code-structure-analyzer"

interface CodeInputViewerProps {
  onAnalysisComplete?: (findings: StructuralFinding[]) => void
}

type TabType = "paste" | "upload"

export function CodeInputViewer({ onAnalysisComplete }: CodeInputViewerProps) {
  const [activeTab, setActiveTab] = React.useState<TabType>("paste")
  const [pastedCode, setPastedCode] = React.useState("")
  const [uploadedCode, setUploadedCode] = React.useState<{ name: string; content: string } | null>(null)
  const [findings, setFindings] = React.useState<StructuralFinding[]>([])
  const [expandedFindings, setExpandedFindings] = React.useState<Set<number>>(new Set())
  const [analyzing, setAnalyzing] = React.useState(false)
  const [copied, setCopied] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  // Get current code based on active tab
  const getCurrentCode = () => activeTab === "paste" ? pastedCode : uploadedCode?.content || ""
  const getCurrentFileName = () => activeTab === "upload" ? uploadedCode?.name : "pasted_code.js"

  // Analyze code whenever it changes
  React.useEffect(() => {
    const code = getCurrentCode()
    if (!code.trim()) {
      setFindings([])
      return
    }

    const analyzeAsync = async () => {
      setAnalyzing(true)
      try {
        const analysis = analyzeCodeStructure(code, undefined, getCurrentFileName())
        setFindings(analysis.findings)
        onAnalysisComplete?.(analysis.findings)
      } catch (err) {
        console.log("[v0] Code analysis failed:", err)
        setFindings([])
      } finally {
        setAnalyzing(false)
      }
    }

    // Debounce analysis
    const timer = setTimeout(analyzeAsync, 500)
    return () => clearTimeout(timer)
  }, [pastedCode, uploadedCode, activeTab, onAnalysisComplete])

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file type
    const validExtensions = ['.py', '.js', '.ts', '.tsx', '.jsx', '.go', '.java', '.cpp', '.c', '.rs']
    const hasValidExt = validExtensions.some(ext => file.name.endsWith(ext))

    if (!hasValidExt) {
      alert(`Unsupported file type. Supported: ${validExtensions.join(', ')}`)
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      setUploadedCode({ name: file.name, content })
      setActiveTab("upload")
    }
    reader.onerror = () => {
      alert("Failed to read file")
    }
    reader.readAsText(file)
  }

  const code = getCurrentCode()
  const lines = code.split("\n")
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
      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-border">
        <button
          onClick={() => setActiveTab("paste")}
          className={cn(
            "px-3 py-2 text-sm font-medium border-b-2 transition-colors",
            activeTab === "paste"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          Paste Code
        </button>
        <button
          onClick={() => setActiveTab("upload")}
          className={cn(
            "px-3 py-2 text-sm font-medium border-b-2 transition-colors",
            activeTab === "upload"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          Upload File
        </button>
      </div>

      {/* Paste Tab */}
      {activeTab === "paste" && (
        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted-foreground">Paste your code:</label>
          <textarea
            value={pastedCode}
            onChange={(e) => setPastedCode(e.target.value)}
            placeholder="Paste Python, JavaScript, TypeScript, or other code here..."
            className="w-full h-64 font-mono text-xs p-3 rounded-lg border border-border bg-muted/30 text-foreground resize-vertical focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      )}

      {/* Upload Tab */}
      {activeTab === "upload" && (
        <div className="space-y-2">
          {uploadedCode ? (
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
              <p className="text-sm font-semibold text-foreground">Uploaded: {uploadedCode.name}</p>
              <p className="text-xs text-muted-foreground mt-1">{uploadedCode.content.split('\n').length} lines</p>
            </div>
          ) : (
            <div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-border rounded-lg p-6 hover:border-primary hover:bg-primary/5 transition-colors"
              >
                <p className="text-sm font-semibold text-foreground">Click to upload a file</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Supports: .py, .js, .ts, .tsx, .jsx, .go, .java, .cpp, .c, .rs
                </p>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".py,.js,.ts,.tsx,.jsx,.go,.java,.cpp,.c,.rs"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          )}
        </div>
      )}

      {/* Analysis Status */}
      {analyzing && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Analyzing code...
        </div>
      )}

      {/* Findings */}
      {findings.length > 0 && (
        <div className="space-y-2 bg-muted/20 border border-border rounded-lg p-3">
          <p className="text-xs font-semibold text-foreground">
            Structural Findings ({findings.length})
          </p>
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

      {/* Code Display */}
      {code && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-muted-foreground">{getCurrentFileName()}</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(code)
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

          <div className="overflow-x-auto rounded-lg border border-border bg-muted/30 p-4 max-h-96">
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
            Showing {lines.length} lines
          </p>
        </div>
      )}
    </div>
  )
}
