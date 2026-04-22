"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Link2, Check, FileText } from "lucide-react"
import { encodeStateToURL, type PredictionInput, type PredictionResult } from "@/lib/prediction"

interface ExportPanelProps {
  input: PredictionInput
  result: PredictionResult | null
}

export function ExportPanel({ input, result }: ExportPanelProps) {
  const [copied, setCopied] = React.useState(false)

  const handleCopyLink = async () => {
    const params = encodeStateToURL(input)
    const url = `${window.location.origin}${window.location.pathname}?${params}`
    
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement("textarea")
      textArea.value = url
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand("copy")
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleExportCSV = () => {
    const timestamp = new Date().toISOString()
    const headers = ["Timestamp", "Commits", "Bugs", "Complexity", "Developers", "Coverage", "Score", "Risk", "Confidence"]
    const values = [
      timestamp,
      input.commits,
      input.bugs,
      input.complexity,
      input.developers,
      input.coverage,
      result?.score ?? "N/A",
      result?.risk ?? "N/A",
      result?.confidence ?? "N/A",
    ]

    // Add breakdown if available
    if (result?.breakdown) {
      headers.push("Bug Density", "Bug Density Contribution", "Complexity Score", "Complexity Contribution", "Coverage Score", "Coverage Contribution")
      values.push(
        result.breakdown.bugDensity.value,
        result.breakdown.bugDensity.contribution,
        result.breakdown.complexity.value,
        result.breakdown.complexity.contribution,
        result.breakdown.coverage.value,
        result.breakdown.coverage.contribution
      )
    }

    // Add reasons
    if (result?.reasons && result.reasons.length > 0) {
      headers.push("Improvement Areas")
      values.push(`"${result.reasons.join("; ")}"`)
    }

    const csv = [headers.join(","), values.join(",")].join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `quality-report-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleExportPDF = () => {
    // Create a printable HTML document
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Software Quality Report</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: system-ui, -apple-system, sans-serif; padding: 40px; color: #1a1a1a; line-height: 1.5; }
            h1 { font-size: 24px; font-weight: 600; margin-bottom: 8px; }
            .subtitle { color: #666; font-size: 14px; margin-bottom: 32px; }
            .section { margin-bottom: 32px; }
            .section-title { font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #666; margin-bottom: 16px; border-bottom: 1px solid #e5e5e5; padding-bottom: 8px; }
            .score-box { background: #f5f5f5; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px; }
            .score { font-size: 64px; font-weight: 700; }
            .risk { font-size: 18px; margin-top: 8px; }
            .risk.high { color: #dc2626; }
            .risk.medium { color: #d97706; }
            .risk.low { color: #16a34a; }
            .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
            .metric { background: #fafafa; border-radius: 8px; padding: 16px; }
            .metric-label { font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 0.5px; }
            .metric-value { font-size: 24px; font-weight: 600; margin-top: 4px; }
            .breakdown { margin-top: 24px; }
            .breakdown-item { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e5e5e5; }
            .breakdown-item:last-child { border-bottom: none; }
            .breakdown-label { font-weight: 500; }
            .breakdown-value { color: #666; }
            .breakdown-contribution { font-weight: 600; }
            .reasons { margin-top: 24px; }
            .reason { background: #fef3c7; border-left: 3px solid #d97706; padding: 12px 16px; margin-bottom: 8px; border-radius: 0 8px 8px 0; font-size: 14px; }
            .footer { margin-top: 48px; padding-top: 24px; border-top: 1px solid #e5e5e5; font-size: 12px; color: #999; text-align: center; }
          </style>
        </head>
        <body>
          <h1>Software Quality Report</h1>
          <p class="subtitle">Generated on ${new Date().toLocaleString()}</p>
          
          <div class="score-box">
            <div class="score">${result?.score ?? "N/A"}</div>
            <div class="risk ${result?.risk?.toLowerCase() ?? ""}">Risk Level: ${result?.risk ?? "N/A"}</div>
          </div>
          
          <div class="section">
            <div class="section-title">Input Metrics</div>
            <div class="grid">
              <div class="metric">
                <div class="metric-label">Commits</div>
                <div class="metric-value">${input.commits}</div>
              </div>
              <div class="metric">
                <div class="metric-label">Bugs</div>
                <div class="metric-value">${input.bugs}</div>
              </div>
              <div class="metric">
                <div class="metric-label">Complexity</div>
                <div class="metric-value">${input.complexity}/10</div>
              </div>
              <div class="metric">
                <div class="metric-label">Developers</div>
                <div class="metric-value">${input.developers}</div>
              </div>
              <div class="metric">
                <div class="metric-label">Test Coverage</div>
                <div class="metric-value">${input.coverage}%</div>
              </div>
              <div class="metric">
                <div class="metric-label">Confidence</div>
                <div class="metric-value">${result?.confidence ?? "N/A"}%</div>
              </div>
            </div>
          </div>
          
          ${result?.breakdown ? `
          <div class="section">
            <div class="section-title">Score Breakdown</div>
            <div class="breakdown">
              <div class="breakdown-item">
                <span class="breakdown-label">Bug Density</span>
                <span class="breakdown-value">${result.breakdown.bugDensity.value} bugs/commit</span>
                <span class="breakdown-contribution">+${result.breakdown.bugDensity.contribution.toFixed(1)} pts</span>
              </div>
              <div class="breakdown-item">
                <span class="breakdown-label">Complexity</span>
                <span class="breakdown-value">${result.breakdown.complexity.value}/10</span>
                <span class="breakdown-contribution">+${result.breakdown.complexity.contribution.toFixed(1)} pts</span>
              </div>
              <div class="breakdown-item">
                <span class="breakdown-label">Test Coverage</span>
                <span class="breakdown-value">${result.breakdown.coverage.value}%</span>
                <span class="breakdown-contribution">+${result.breakdown.coverage.contribution.toFixed(1)} pts</span>
              </div>
            </div>
          </div>
          ` : ""}
          
          ${result?.reasons && result.reasons.length > 0 ? `
          <div class="section">
            <div class="section-title">Areas for Improvement</div>
            <div class="reasons">
              ${result.reasons.map(r => `<div class="reason">${r}</div>`).join("")}
            </div>
          </div>
          ` : ""}
          
          <div class="footer">
            Generated by Software Quality Predictor
          </div>
        </body>
      </html>
    `

    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.write(printContent)
      printWindow.document.close()
      printWindow.print()
    }
  }

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-4">
        <CardTitle className="text-sm font-medium">Export & Share</CardTitle>
        <p className="text-xs text-muted-foreground">
          Save or share your analysis results
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button
          variant="outline"
          className="w-full justify-start h-10"
          onClick={handleCopyLink}
        >
          {copied ? (
            <Check className="h-4 w-4 mr-2 text-emerald-500" />
          ) : (
            <Link2 className="h-4 w-4 mr-2" />
          )}
          {copied ? "Link Copied!" : "Copy Share Link"}
        </Button>
        
        <Button
          variant="outline"
          className="w-full justify-start h-10"
          onClick={handleExportCSV}
        >
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
        
        <Button
          variant="outline"
          className="w-full justify-start h-10"
          onClick={handleExportPDF}
          disabled={!result}
        >
          <FileText className="h-4 w-4 mr-2" />
          Export PDF Report
        </Button>
      </CardContent>
    </Card>
  )
}
