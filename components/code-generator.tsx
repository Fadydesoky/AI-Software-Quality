"use client"

import * as React from "react"
import { Loader2, Copy, Download, Check, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { Recommendation } from "@/lib/prediction"

interface CodeGeneratorProps {
  recommendation: Recommendation
  fileContent?: string
  language?: string
}

export function CodeGenerator({
  recommendation,
  fileContent,
  language = "typescript",
}: CodeGeneratorProps) {
  const [generating, setGenerating] = React.useState(false)
  const [improvedCode, setImprovedCode] = React.useState<string | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [copied, setCopied] = React.useState(false)

  const generateImprovement = async () => {
    try {
      setGenerating(true)
      setError(null)
      setImprovedCode(null)

      const prompt = `You are a code quality expert. A code analysis tool has identified the following issue:

Issue: ${recommendation.action}
Category: ${recommendation.metric}
Priority: ${recommendation.priority}
Impact: ${recommendation.impact}
Target: ${recommendation.targetValue}

${fileContent ? `Original code:\n\`\`\`${language}\n${fileContent}\n\`\`\`` : "No code provided - provide a general example for this issue"}

Please provide:
1. Analysis of the issue
2. Improved/refactored code that addresses this issue
3. Explanation of changes

Format your response with clear sections marked with ## headings.`

      // For now, create a template suggestion since we don't have an AI API
      // In production, this would call your AI API
      const suggestions = generateCodeSuggestions(recommendation, fileContent)
      setImprovedCode(suggestions)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate suggestions")
    } finally {
      setGenerating(false)
    }
  }

  const copyToClipboard = async () => {
    if (!improvedCode) return
    try {
      await navigator.clipboard.writeText(improvedCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("[v0] Copy failed:", err)
    }
  }

  const downloadAsFile = () => {
    if (!improvedCode) return
    const element = document.createElement("a")
    const file = new Blob([improvedCode], { type: "text/plain" })
    element.href = URL.createObjectURL(file)
    element.download = `improved-code-${recommendation.metric.toLowerCase().replace(/\s+/g, "-")}.${getFileExtension(language)}`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  return (
    <div className="space-y-4">
      <Button
        onClick={generateImprovement}
        disabled={generating}
        className="w-full"
        variant="default"
      >
        {generating ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Generating suggestions...
          </>
        ) : (
          <>
            Generate AI Suggestions
          </>
        )}
      </Button>

      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex gap-2">
          <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-500">{error}</p>
        </div>
      )}

      {improvedCode && (
        <div className="space-y-3">
          <div className="p-4 rounded-lg bg-muted border border-border">
            <pre className="text-xs overflow-x-auto">
              <code className="text-muted-foreground">{improvedCode}</code>
            </pre>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={copyToClipboard}
              className="flex-1"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={downloadAsFile}
              className="flex-1"
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

function generateCodeSuggestions(
  recommendation: Recommendation,
  fileContent?: string
): string {
  const suggestions: string[] = []

  suggestions.push(`# Code Improvement Suggestion`)
  suggestions.push(`## Issue: ${recommendation.action}`)
  suggestions.push(`**Category:** ${recommendation.metric}`)
  suggestions.push(`**Priority:** ${recommendation.priority}`)
  suggestions.push(`**Impact:** ${recommendation.impact}`)
  suggestions.push(`**Target:** ${recommendation.targetValue}\n`)

  suggestions.push(`## Problem Analysis`)
  suggestions.push(getSuggestionText(recommendation.metric, "analysis"))

  suggestions.push(`## Recommended Solution`)
  suggestions.push(getSuggestionText(recommendation.metric, "solution"))

  suggestions.push(`## Code Example`)
  suggestions.push(getCodeExample(recommendation.metric))

  if (fileContent) {
    suggestions.push(`## Your Code Analysis`)
    suggestions.push(`Original code has ${countComplexityIssues(fileContent)} potential issues.`)
    suggestions.push(`Apply the recommended patterns above to improve code quality.`)
  }

  suggestions.push(`## Benefits`)
  suggestions.push(getSuggestionText(recommendation.metric, "benefits"))

  return suggestions.join("\n\n")
}

function getSuggestionText(
  metric: string,
  section: "analysis" | "solution" | "benefits"
): string {
  const suggestions: Record<string, Record<string, string>> = {
    "Code Complexity": {
      analysis:
        "Complex code is harder to understand, maintain, and test. Functions with high cyclomatic complexity indicate multiple decision paths that should be simplified.",
      solution:
        "Break down complex functions into smaller, single-responsibility functions. Extract conditional logic into separate named functions. Use design patterns like Strategy or State.",
      benefits:
        "- Improved readability\n- Easier testing and debugging\n- Better code reuse\n- Reduced bug surface",
    },
    "Test Coverage": {
      analysis:
        "Low test coverage means critical code paths aren't being validated. This increases the risk of undetected bugs in production.",
      solution:
        "Write unit tests for critical functions. Use integration tests for workflows. Aim for coverage of edge cases and error conditions.",
      benefits:
        "- Faster bug detection\n- Confidence in refactoring\n- Better documentation\n- Reduced production issues",
    },
    "Bug Density": {
      analysis:
        "High bug density indicates code quality issues. Each bug caught in production could have been prevented with better practices.",
      solution:
        "Implement code review processes. Use linting and static analysis tools. Write more comprehensive tests before deployment.",
      benefits:
        "- Fewer production issues\n- Improved user experience\n- Reduced support costs\n- Better team velocity",
    },
    "Maintainability": {
      analysis:
        "Poor maintainability makes it difficult for teams to understand and modify code, slowing down feature development.",
      solution:
        "Add clear documentation. Use consistent naming conventions. Extract magic numbers into named constants. Write self-documenting code.",
      benefits:
        "- Faster onboarding\n- Easier maintenance\n- Better knowledge sharing\n- Improved team productivity",
    },
  }

  return (
    suggestions[metric]?.[section] ||
    `Focus on improving ${metric.toLowerCase()} to enhance code quality.`
  )
}

function getCodeExample(metric: string): string {
  const examples: Record<string, string> = {
    "Code Complexity": `// BEFORE: Complex nested logic
function processOrder(order) {
  if (order.items.length > 0) {
    if (order.total > 100) {
      if (order.customer.isVIP) {
        return applyVIPDiscount(order);
      } else {
        return applyStandardDiscount(order);
      }
    }
  }
  return order;
}

// AFTER: Simplified with helper functions
function processOrder(order) {
  if (!hasItems(order)) return order;
  return applyApplicableDiscount(order);
}

function hasItems(order) {
  return order.items.length > 0;
}

function applyApplicableDiscount(order) {
  const discount = calculateDiscount(order);
  return discount(order);
}

function calculateDiscount(order) {
  if (order.total < 100) return (o) => o;
  return order.customer.isVIP ? applyVIPDiscount : applyStandardDiscount;
}`,
    "Test Coverage": `// Add unit tests for critical paths
describe("processOrder", () => {
  it("should apply VIP discount for VIP customers", () => {
    const order = { items: [1], total: 150, customer: { isVIP: true } };
    const result = processOrder(order);
    expect(result.discount).toBeGreaterThan(0);
  });

  it("should handle empty orders", () => {
    const order = { items: [], total: 0, customer: {} };
    const result = processOrder(order);
    expect(result.total).toBe(0);
  });

  it("should apply standard discount for regular customers", () => {
    const order = { items: [1], total: 150, customer: { isVIP: false } };
    const result = processOrder(order);
    expect(result.discount).toBeLessThan(0.1);
  });
});`,
    "Maintainability": `// BEFORE: Magic numbers and unclear logic
const result = value * 1.15 * 0.9;

// AFTER: Clear intent with named constants
const TAX_RATE = 0.15;
const EMPLOYEE_DISCOUNT = 0.1;
const finalPrice = applyTaxAndDiscount(value, TAX_RATE, EMPLOYEE_DISCOUNT);

function applyTaxAndDiscount(value, taxRate, discountRate) {
  const withTax = value * (1 + taxRate);
  return withTax * (1 - discountRate);
}`,
  }

  return (
    examples[metric] ||
    `\`\`\`typescript
// Example of improved code structure
// following best practices for ${metric.toLowerCase()}
\`\`\``
  )
}

function countComplexityIssues(code: string): number {
  let count = 0
  if (code.includes("if")) count += (code.match(/if/g) || []).length / 3
  if (code.includes("for")) count += (code.match(/for/g) || []).length / 2
  if (code.includes("while")) count += (code.match(/while/g) || []).length / 2
  return Math.max(1, Math.round(count))
}

function getFileExtension(language: string): string {
  const extensions: Record<string, string> = {
    typescript: "ts",
    javascript: "js",
    python: "py",
    java: "java",
    cpp: "cpp",
    csharp: "cs",
    go: "go",
    rust: "rs",
    default: "txt",
  }
  return extensions[language] || extensions.default
}
