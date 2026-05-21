/**
 * GitHub File-Level Analysis
 * Identifies complexity hotspots and code quality issues by analyzing file metrics
 */

export interface FileMetrics {
  path: string
  size: number // lines of code estimate from size
  complexity: number // estimated cyclomatic complexity
  lastModified: string
  contributors: number
  isHotspot: boolean
  riskScore: number // 0-100
}

export interface FileAnalysisResult {
  totalFiles: number
  hotspots: FileMetrics[]
  averageComplexity: number
  riskLevel: "Low" | "Medium" | "High"
  recommendations: string[]
}

/**
 * Estimates cyclomatic complexity based on file size and patterns
 * Lower estimates for languages like Python, higher for JavaScript
 */
function estimateComplexity(size: number, language: string): number {
  const baseFactor = {
    'py': 0.8,
    'js': 1.2,
    'ts': 1.15,
    'jsx': 1.3,
    'tsx': 1.3,
    'go': 0.9,
    'rs': 0.85,
    'java': 1.0,
    'cpp': 1.1,
    'c': 1.05,
  }[language] || 1.0

  // Estimate: 1 complexity unit per ~5-10 lines depending on language
  return Math.max(1, Math.round((size / 8) * baseFactor))
}

/**
 * Determines if a file is a hotspot based on complexity and size
 */
function isComplexityHotspot(complexity: number, size: number): boolean {
  // Files with high complexity or excessive size are hotspots
  return complexity > 20 || size > 500
}

/**
 * Calculate risk score based on complexity, size, and other factors
 */
function calculateRiskScore(complexity: number, size: number, language: string): number {
  let score = 0

  // Complexity contribution (0-40 points)
  score += Math.min(40, (complexity / 30) * 40)

  // Size contribution (0-30 points)
  score += Math.min(30, (size / 1000) * 30)

  // Language-specific weight (0-20 points)
  const riskByLanguage = {
    'js': 15,
    'jsx': 18,
    'ts': 12,
    'tsx': 14,
    'py': 8,
    'go': 5,
    'rs': 3,
    'java': 10,
    'cpp': 18,
    'c': 20,
  }[language] || 10

  score += riskByLanguage

  return Math.min(100, Math.round(score))
}

/**
 * Generates recommendations based on file analysis
 */
function generateRecommendations(analysis: FileAnalysisResult): string[] {
  const recommendations: string[] = []

  if (analysis.hotspots.length > 5) {
    recommendations.push(`Found ${analysis.hotspots.length} complexity hotspots. Consider refactoring high-risk files: ${analysis.hotspots.slice(0, 3).map(h => h.path).join(', ')}`)
  }

  if (analysis.averageComplexity > 15) {
    recommendations.push("Average complexity is high. Implement code review processes focusing on complexity reduction.")
  }

  if (analysis.riskLevel === "High") {
    recommendations.push("High overall risk detected. Prioritize: 1) Add tests to hotspots 2) Refactor complex functions 3) Increase code reviews")
  }

  if (analysis.hotspots.some(h => h.riskScore > 80)) {
    recommendations.push("Critical risk files detected. These should be prioritized for immediate refactoring and testing.")
  }

  return recommendations
}

/**
 * Analyzes files from GitHub API response
 * This is a mock implementation that works with real GitHub data
 */
export function analyzeGitHubFiles(files: any[]): FileAnalysisResult {
  const metrics: FileMetrics[] = files
    .filter(file => {
      // Only analyze code files
      const ext = file.name.split('.').pop()?.toLowerCase() || ''
      const codeExtensions = ['js', 'ts', 'jsx', 'tsx', 'py', 'go', 'rs', 'java', 'cpp', 'c', 'h', 'hpp']
      return codeExtensions.includes(ext)
    })
    .map(file => {
      const ext = file.name.split('.').pop()?.toLowerCase() || 'txt'
      const sizeInLOC = Math.max(1, Math.round((file.size || 0) / 50)) // Rough estimate: ~50 bytes per line
      const complexity = estimateComplexity(sizeInLOC, ext)
      const riskScore = calculateRiskScore(complexity, sizeInLOC, ext)
      const isHotspot = isComplexityHotspot(complexity, sizeInLOC)

      return {
        path: file.path,
        size: sizeInLOC,
        complexity,
        lastModified: file.last_modified || new Date().toISOString(),
        contributors: Math.max(1, Math.floor(Math.random() * 10) + 1), // Placeholder
        isHotspot,
        riskScore,
      }
    })
    .sort((a, b) => b.riskScore - a.riskScore)

  const hotspots = metrics.filter(m => m.isHotspot)
  const averageComplexity = metrics.length > 0
    ? Math.round(metrics.reduce((sum, m) => sum + m.complexity, 0) / metrics.length)
    : 0

  const riskLevel: "Low" | "Medium" | "High" = 
    averageComplexity > 20 ? "High" :
    averageComplexity > 12 ? "Medium" :
    "Low"

  const analysis: FileAnalysisResult = {
    totalFiles: metrics.length,
    hotspots: hotspots.slice(0, 10), // Top 10 hotspots
    averageComplexity,
    riskLevel,
    recommendations: [],
  }

  analysis.recommendations = generateRecommendations(analysis)

  return analysis
}

/**
 * Format file path for display
 */
export function formatFilePath(path: string): string {
  const parts = path.split('/')
  if (parts.length > 3) {
    return `.../${parts.slice(-2).join('/')}`
  }
  return path
}

/**
 * Get risk color for a risk score
 */
export function getRiskColor(score: number): string {
  if (score >= 70) return "bg-red-500/10 text-red-600 dark:text-red-400 border-red-200/50 dark:border-red-800/50"
  if (score >= 40) return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200/50 dark:border-amber-800/50"
  return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-800/50"
}
