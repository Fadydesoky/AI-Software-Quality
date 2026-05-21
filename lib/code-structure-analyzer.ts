/**
 * Line-Aware Structural Code Analyzer
 * Analyzes code and returns evidence-backed findings with ACTUAL line numbers
 * All line references must originate from parsed code analysis, never fabricated
 */

export interface LineRange {
  start: number
  end: number
}

export interface StructuralFinding {
  type: "nesting" | "complexity" | "function-size" | "duplication" | "dead-code" | "test-coverage"
  severity: "low" | "medium" | "high" | "critical"
  lineRange: LineRange
  evidence: string // Concrete finding from code analysis
  interpretation: string // Why this matters
  suggestedAction: string // Specific, implementable steps
  metrics?: {
    current: string | number
    threshold: string | number
    unit: string
  }
  confidence: "high" | "medium" | "low"
}

export interface CodeStructureAnalysis {
  language: string
  totalLines: number
  findings: StructuralFinding[]
  summary: {
    totalComplexity: number
    maxNestingLevel: number
    largestFunction: { lineRange: LineRange; locCount: number }
  }
}

/**
 * Detect the programming language from file content/path
 */
function detectLanguage(content: string, path?: string): string {
  if (path) {
    if (path.endsWith('.py')) return 'python'
    if (path.endsWith('.js')) return 'javascript'
    if (path.endsWith('.ts')) return 'typescript'
    if (path.endsWith('.tsx')) return 'typescript'
    if (path.endsWith('.jsx')) return 'javascript'
  }
  // Fallback detection from content
  if (content.includes('import type') || content.includes('interface ')) return 'typescript'
  if (content.includes('def ') || content.includes('import ')) return 'python'
  return 'unknown'
}

/**
 * Parse code into lines with metadata
 */
function parseCodeLines(content: string): Array<{ number: number; content: string; trimmed: string }> {
  const lines = content.split('\n')
  return lines.map((content, idx) => ({
    number: idx + 1,
    content,
    trimmed: content.trim(),
  }))
}

/**
 * Detect function/class boundaries with exact line numbers
 * Returns: { name, type, startLine, endLine, locCount }
 */
function detectFunctions(lines: Array<{ number: number; content: string; trimmed: string }>, language: string) {
  const functions: Array<{
    name: string
    type: 'function' | 'class' | 'method'
    startLine: number
    endLine: number
  }> = []

  let inFunction = false
  let currentFunction: { name: string; type: 'function' | 'class' | 'method'; startLine: number } | null = null
  let indentationLevel = 0

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trimmed

    // TypeScript/JavaScript function detection
    if (language === 'typescript' || language === 'javascript' || language === 'jsx') {
      // Function declaration
      if (trimmed.match(/^(export\s+)?(async\s+)?function\s+(\w+)/)) {
        if (currentFunction) {
          functions.push({ ...currentFunction, endLine: i })
        }
        const match = trimmed.match(/function\s+(\w+)/)
        currentFunction = {
          name: match?.[1] || 'anonymous',
          type: 'function',
          startLine: i + 1,
        }
        inFunction = true
      }
      // Arrow function or method
      else if (trimmed.match(/^\s*(\w+)\s*[:=]\s*(async\s*)?\([^)]*\)\s*=>/)) {
        const match = trimmed.match(/(\w+)\s*[:=]/)
        if (match && currentFunction) {
          functions.push({ ...currentFunction, endLine: i })
        }
        currentFunction = {
          name: match?.[1] || 'anonymous',
          type: 'method',
          startLine: i + 1,
        }
      }
      // Class detection
      else if (trimmed.match(/^(export\s+)?(class|interface)\s+(\w+)/)) {
        if (currentFunction) {
          functions.push({ ...currentFunction, endLine: i })
        }
        const match = trimmed.match(/(class|interface)\s+(\w+)/)
        currentFunction = {
          name: match?.[2] || 'anonymous',
          type: match?.[1] === 'class' ? 'class' : 'method',
          startLine: i + 1,
        }
      }
    }
    // Python function detection
    else if (language === 'python') {
      if (trimmed.match(/^(async\s+)?def\s+(\w+)/)) {
        if (currentFunction) {
          functions.push({ ...currentFunction, endLine: i })
        }
        const match = trimmed.match(/def\s+(\w+)/)
        currentFunction = {
          name: match?.[1] || 'anonymous',
          type: 'function',
          startLine: i + 1,
        }
        indentationLevel = line.content.search(/\S/)
      } else if (trimmed.match(/^class\s+(\w+)/)) {
        if (currentFunction) {
          functions.push({ ...currentFunction, endLine: i })
        }
        const match = trimmed.match(/class\s+(\w+)/)
        currentFunction = {
          name: match?.[1] || 'anonymous',
          type: 'class',
          startLine: i + 1,
        }
        indentationLevel = line.content.search(/\S/)
      }
      // End of function when indentation decreases
      else if (inFunction && trimmed && line.content.search(/\S/) <= indentationLevel && i > 0) {
        if (currentFunction) {
          functions.push({ ...currentFunction, endLine: i })
          currentFunction = null
          inFunction = false
        }
      }
    }
  }

  // Close last function
  if (currentFunction) {
    functions.push({ ...currentFunction, endLine: lines.length })
  }

  return functions
}

/**
 * Detect nesting levels (nested if/for/while statements)
 * Returns line ranges with high nesting
 */
function detectDeepNesting(lines: Array<{ number: number; content: string; trimmed: string }>, language: string) {
  const findings: StructuralFinding[] = []
  const nestingPatterns = language === 'python'
    ? /^\s{4,}(if |for |while |try:|with )/
    : /[{}]|if\s*\(|for\s*\(|while\s*\(|try\s*{|\.forEach|\.map|\.filter/

  let maxNesting = 0
  const sections: Array<{ startLine: number; maxNesting: number; lines: number }> = []
  let currentSection = { startLine: 1, maxNesting: 0, lines: 0 }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trimmed

    // Skip comments and empty lines
    if (trimmed.startsWith('//') || trimmed.startsWith('#') || !trimmed) continue

    // Count nesting level (simplified: count indentation + brackets)
    let nestingLevel = 0
    if (language === 'python') {
      const indent = line.content.search(/\S/)
      nestingLevel = Math.floor(indent / 4)
    } else {
      // Count opening brackets - closing brackets
      const opens = (line.content.match(/{/g) || []).length
      const closes = (line.content.match(/}/g) || []).length
      nestingLevel = opens - closes
    }

    if (nestingLevel > maxNesting) maxNesting = nestingLevel

    // If nesting >= 4 levels, record the section
    if (nestingLevel >= 4) {
      if (currentSection.startLine === 0 || nestingLevel > currentSection.maxNesting) {
        if (currentSection.maxNesting >= 4) {
          sections.push({ ...currentSection })
        }
        currentSection = { startLine: i + 1, maxNesting: nestingLevel, lines: 1 }
      } else {
        currentSection.lines++
      }
    }
  }

  // Add high-nesting sections as findings
  for (const section of sections) {
    if (section.maxNesting >= 4 && section.lines >= 5) {
      findings.push({
        type: 'nesting',
        severity: section.maxNesting >= 6 ? 'critical' : 'high',
        lineRange: {
          start: section.startLine,
          end: Math.min(section.startLine + section.lines - 1, lines.length),
        },
        evidence: `Lines ${section.startLine}–${Math.min(section.startLine + section.lines - 1, lines.length)}: ${section.maxNesting}-level nesting detected (threshold: 4 levels)`,
        interpretation: `High nesting complexity reduces code readability and increases bug risk. Nested conditions make testing and maintenance harder.`,
        suggestedAction: `Refactor by extracting nested logic into separate functions/methods. This reduces nesting to 2 levels and improves maintainability.`,
        metrics: {
          current: section.maxNesting,
          threshold: 4,
          unit: 'nesting levels',
        },
        confidence: 'high',
      })
    }
  }

  return { findings, maxNesting }
}

/**
 * Detect overly large functions
 */
function detectLargeFunctions(
  lines: Array<{ number: number; content: string; trimmed: string }>,
  functions: Array<{ name: string; type: string; startLine: number; endLine: number }>
) {
  const findings: StructuralFinding[] = []

  for (const fn of functions) {
    const locCount = fn.endLine - fn.startLine + 1
    const threshold = fn.type === 'class' ? 200 : 50

    if (locCount > threshold) {
      const severity = locCount > threshold * 2 ? 'critical' : 'high'
      findings.push({
        type: 'function-size',
        severity,
        lineRange: { start: fn.startLine, end: fn.endLine },
        evidence: `Function ${fn.name}() at lines ${fn.startLine}–${fn.endLine}: ${locCount} LOC (threshold: ${threshold})`,
        interpretation: `Large functions are difficult to understand, test, and maintain. High LOC count indicates the function likely handles multiple responsibilities.`,
        suggestedAction: `Break ${fn.name}() into smaller focused functions. Aim for max ${threshold} LOC per function. Extract cohesive logic into separate, well-named functions.`,
        metrics: {
          current: locCount,
          threshold,
          unit: 'lines of code',
        },
        confidence: 'high',
      })
    }
  }

  return findings
}

/**
 * Main analyzer: parse code and return evidence-backed findings
 */
export function analyzeCodeStructure(content: string, language?: string, filePath?: string): CodeStructureAnalysis {
  const detectedLanguage = language || detectLanguage(content, filePath)
  const lines = parseCodeLines(content)
  const functions = detectFunctions(lines, detectedLanguage)

  const { findings: nestingFindings, maxNesting } = detectDeepNesting(lines, detectedLanguage)
  const sizeFindings = detectLargeFunctions(lines, functions)

  // Combine all findings
  const allFindings = [...nestingFindings, ...sizeFindings]

  // Calculate total complexity (simplified)
  const totalComplexity = Math.min(
    10,
    Math.floor(lines.length / 100) + maxNesting
  )

  const largestFunction = functions.reduce((max, fn) => {
    const locCount = fn.endLine - fn.startLine + 1
    return locCount > (max?.locCount || 0) ? { lineRange: { start: fn.startLine, end: fn.endLine }, locCount } : max
  }, null as any)

  return {
    language: detectedLanguage,
    totalLines: lines.length,
    findings: allFindings,
    summary: {
      totalComplexity,
      maxNestingLevel: maxNesting,
      largestFunction: largestFunction || { lineRange: { start: 1, end: 1 }, locCount: 0 },
    },
  }
}

/**
 * Convert structural findings to Evidence → Interpretation → Suggested Action format
 * for use in AI insights
 */
export function formatFindingsAsInsights(analysis: CodeStructureAnalysis): string[] {
  return analysis.findings.map(finding => {
    return `**Lines ${finding.lineRange.start}–${finding.lineRange.end}: ${finding.evidence}**

${finding.interpretation}

${finding.suggestedAction}`
  })
}
