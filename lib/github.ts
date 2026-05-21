// GitHub API types and utilities
export interface GitHubRepoData {
  commits: number
  contributorsCount: number
  openIssues: number
  closedIssues: number
  language: string | null
  stars: number
  mainBranch: string
}

export interface GitHubAnalyzeError {
  type: 'repo-not-found' | 'rate-limit' | 'invalid-url' | 'api-error' | 'network-error'
  message: string
  statusCode?: number
}

// Parse and validate GitHub URLs
export function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  // Handle full URL format: https://github.com/owner/repo or https://github.com/owner/repo.git
  const fullUrlMatch = url.match(/github\.com[:/]([^/]+)\/([^/]+?)(?:\.git)?$/)
  if (fullUrlMatch) {
    return { owner: fullUrlMatch[1], repo: fullUrlMatch[2] }
  }

  // Handle short format: owner/repo
  const shortMatch = url.match(/^([^/]+)\/([^/]+)$/)
  if (shortMatch) {
    return { owner: shortMatch[1], repo: shortMatch[2] }
  }

  return null
}

// Validate that a string looks like a valid GitHub URL or owner/repo format
export function isValidGitHubUrl(url: string): boolean {
  return parseGitHubUrl(url) !== null
}

// Normalize repo reference to owner/repo format
export function normalizeRepoReference(url: string): string | null {
  const parsed = parseGitHubUrl(url)
  return parsed ? `${parsed.owner}/${parsed.repo}` : null
}

// Build GitHub API URL for a repository
export function getGitHubRepoApiUrl(owner: string, repo: string): string {
  return `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`
}
