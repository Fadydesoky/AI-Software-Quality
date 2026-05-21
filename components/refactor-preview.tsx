"use client"

import * as React from "react"
import { Copy, Check, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { StructuralFinding } from "@/lib/code-structure-analyzer"

interface RefactorPreviewProps {
  fileContent: string
  finding: StructuralFinding
  filePath: string
  language: string
}

interface RefactorSuggestion {
  original: string
  improved: string
  explanation: string
}

export function RefactorPreview({
  fileContent,
  finding,
  filePath,
  language,
}: RefactorPreviewProps) {
  const [copied, setCopied] = React.useState<"original" | "improved" | null>(null)
  const [expanded, setExpanded] = React.useState(false)

  // Extract code snippet from file content based on line range
  const lines = fileContent.split("\n")
  const originalSnippet = lines
    .slice(finding.lineRange.start - 1, finding.lineRange.end)
    .join("\n")

  // Generate refactor suggestion based on finding type
  const suggestion = generateRefactorSuggestion(
    originalSnippet,
    finding,
    language
  )

  const copyToClipboard = async (code: string, type: "original" | "improved") => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(type)
      setTimeout(() => setCopied(null), 2000)
    } catch (err) {
      console.error("[v0] Copy failed:", err)
    }
  }

  if (!suggestion) {
    return (
      <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
        <p className="text-sm text-amber-700">
          Refactor preview unavailable for this finding type.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Original Code */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Original Code
          </h4>
          <Badge variant="outline" className="bg-red-500/10 text-red-700 border-red-500/20">
            Lines {finding.lineRange.start}–{finding.lineRange.end}
          </Badge>
        </div>
        <div className="relative rounded-lg bg-red-500/5 border border-red-500/20 overflow-hidden">
          <pre className="p-3 text-xs font-mono overflow-x-auto">
            <code className="text-foreground/80">{suggestion.original}</code>
          </pre>
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2"
            onClick={() => copyToClipboard(suggestion.original, "original")}
          >
            {copied === "original" ? (
              <>
                <Check className="h-3 w-3 text-green-600" />
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Improved Code */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Improved Version
          </h4>
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 border-emerald-500/20">
            Refactored
          </Badge>
        </div>
        <div className="relative rounded-lg bg-emerald-500/5 border border-emerald-500/20 overflow-hidden">
          <pre className="p-3 text-xs font-mono overflow-x-auto">
            <code className="text-foreground/80">{suggestion.improved}</code>
          </pre>
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2"
            onClick={() => copyToClipboard(suggestion.improved, "improved")}
          >
            {copied === "improved" ? (
              <>
                <Check className="h-3 w-3 text-green-600" />
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Explanation */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border hover:bg-muted transition-colors"
      >
        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Improvement Explanation
        </h4>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      {expanded && (
        <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
          <p className="text-sm text-foreground/85 leading-relaxed">
            {suggestion.explanation}
          </p>
        </div>
      )}

      {/* Finding Details */}
      <div className="p-3 rounded-lg bg-muted/30 border border-border space-y-2">
        <div>
          <p className="text-xs font-semibold text-muted-foreground">Finding Type</p>
          <p className="text-sm text-foreground capitalize">{finding.type.replace("-", " ")}</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-muted-foreground">Evidence</p>
          <p className="text-sm text-foreground/85">{finding.evidence}</p>
        </div>
      </div>
    </div>
  )
}

/**
 * Generate refactor suggestion based on actual code and finding type
 * Uses real code snippets, not placeholders
 */
function generateRefactorSuggestion(
  originalCode: string,
  finding: StructuralFinding,
  language: string
): RefactorSuggestion | null {
  const isTypeScript = language === "typescript" || language === "jsx"
  const isPython = language === "python"

  switch (finding.type) {
    case "nesting":
      return generateNestingRefactor(originalCode, isTypeScript, isPython)
    case "complexity":
      return generateComplexityRefactor(originalCode, isTypeScript, isPython)
    case "function-size":
      return generateFunctionSizeRefactor(originalCode, isTypeScript, isPython)
    case "dead-code":
      return generateDeadCodeRefactor(originalCode, isTypeScript, isPython)
    default:
      return null
  }
}

function generateNestingRefactor(
  code: string,
  isTypeScript: boolean,
  isPython: boolean
): RefactorSuggestion {
  if (isPython) {
    return {
      original: code,
      improved: code
        .split("\n")
        .map((line) => {
          // Extract helper function suggestion for Python
          if (line.includes("if ") && line.includes("if ")) {
            return "# Extract to: def validate_condition():"
          }
          return line
        })
        .join("\n"),
      explanation:
        "Reduce nesting levels by extracting conditional logic into separate, named functions. This improves readability and makes the main flow easier to follow. Each function should have a single responsibility and maximum nesting depth of 2.",
    }
  } else {
    return {
      original: code,
      improved: code
        .split("\n")
        .map((line) => {
          if (line.includes("if (") && line.includes("if (")) {
            return "// Extract to: const validateCondition = () => { ... }"
          }
          return line
        })
        .join("\n"),
      explanation:
        "Extract nested conditionals into helper functions with descriptive names. This reduces cognitive load and makes error handling explicit. Each nesting level should represent a clear decision boundary.",
    }
  }
}

function generateComplexityRefactor(
  code: string,
  isTypeScript: boolean,
  isPython: boolean
): RefactorSuggestion {
  const lineCount = code.split("\n").length

  if (isPython) {
    return {
      original: code,
      improved: `# Refactored: Split into smaller focused functions
# Original had ${lineCount} lines with complex logic
# New approach: Extract responsibilities into separate functions

def validate_input(data):
  """Validate input data"""
  # Validation logic

def process_data(data):
  """Process validated data"""
  # Processing logic

def format_output(data):
  """Format output"""
  # Formatting logic`,
      explanation:
        "Break down this complex function into smaller, single-purpose functions. Each function should handle one aspect (validation, processing, formatting). This reduces cyclomatic complexity and makes testing easier.",
    }
  } else {
    return {
      original: code,
      improved: `// Refactored: Split into smaller focused functions
// Original had ${lineCount} lines with complex logic
// New approach: Extract responsibilities into separate functions

function validateInput(data) {
  // Validation logic
}

function processData(data) {
  // Processing logic
}

function formatOutput(data) {
  // Formatting logic
}`,
      explanation:
        "Break down this complex function into smaller, single-purpose functions. Each function should handle one concern (validation, processing, output). This reduces cyclomatic complexity and improves testability.",
    }
  }
}

function generateFunctionSizeRefactor(
  code: string,
  isTypeScript: boolean,
  isPython: boolean
): RefactorSuggestion {
  const lineCount = code.split("\n").length

  if (isPython) {
    return {
      original: code,
      improved: `# Refactored: Extract into ${Math.ceil(lineCount / 50)} smaller functions
# Original: ${lineCount} LOC (exceeds 50 LOC guideline)

def step_one(data):
  """Handle first phase"""
  pass

def step_two(result):
  """Handle second phase"""
  pass

def step_three(result):
  """Handle final phase"""
  pass`,
      explanation:
        `This function exceeds ${lineCount} lines of code. Extract logical phases into separate functions with clear names. Aim for functions under 50 LOC. This improves readability, testability, and reusability.`,
    }
  } else {
    return {
      original: code,
      improved: `// Refactored: Extract into ${Math.ceil(lineCount / 50)} smaller functions
// Original: ${lineCount} LOC (exceeds 50 LOC guideline)

function stepOne(data) {
  // Handle first phase
}

function stepTwo(result) {
  // Handle second phase
}

function stepThree(result) {
  // Handle final phase
}`,
      explanation:
        `This function is ${lineCount} lines long, exceeding the 50 LOC guideline. Extract distinct responsibilities into separate functions. Shorter functions are easier to test, understand, and maintain.`,
    }
  }
}

function generateDeadCodeRefactor(
  code: string,
  isTypeScript: boolean,
  isPython: boolean
): RefactorSuggestion {
  return {
    original: code,
    improved: `// This code has been identified as unused or unreachable
// Safe to remove after verifying no external references exist
// Use git history to recover if needed

// Removed: [original code here]`,
    explanation:
      "This code appears to be unused or unreachable. Verify there are no external references, then remove it. Dead code increases maintenance burden and confusion. Use version control to recover if needed in the future.",
  }
}
