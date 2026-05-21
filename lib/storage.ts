import type { PredictionInput, HistoryEntry } from "./prediction"

const STORAGE_KEYS = {
  CURRENT_INPUT: "qualioro:currentInput",
  HISTORY: "qualioro:history",
  LAST_SAVED: "qualioro:lastSaved",
}

/**
 * Saves the current input values to localStorage
 */
export function saveCurrentInput(input: PredictionInput): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(STORAGE_KEYS.CURRENT_INPUT, JSON.stringify(input))
  } catch (error) {
    console.error("[v0] Failed to save current input to localStorage:", error)
  }
}

/**
 * Restores the current input values from localStorage
 */
export function loadCurrentInput(): PredictionInput | null {
  if (typeof window === "undefined") return null
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_INPUT)
    return stored ? JSON.parse(stored) : null
  } catch (error) {
    console.error("[v0] Failed to load current input from localStorage:", error)
    return null
  }
}

/**
 * Saves a prediction entry to the history
 */
export function saveHistoryEntry(entry: HistoryEntry): void {
  if (typeof window === "undefined") return
  try {
    const history = loadHistory()
    history.push(entry)
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history))
    localStorage.setItem(STORAGE_KEYS.LAST_SAVED, new Date().toISOString())
  } catch (error) {
    console.error("[v0] Failed to save history entry to localStorage:", error)
  }
}

/**
 * Loads all history entries from localStorage
 */
export function loadHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return []
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.HISTORY)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error("[v0] Failed to load history from localStorage:", error)
    return []
  }
}

/**
 * Deletes a history entry by ID
 */
export function deleteHistoryEntry(id: string): void {
  if (typeof window === "undefined") return
  try {
    const history = loadHistory()
    const filtered = history.filter(entry => entry.id !== id)
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(filtered))
  } catch (error) {
    console.error("[v0] Failed to delete history entry:", error)
  }
}

/**
 * Clears all history
 */
export function clearHistory(): void {
  if (typeof window === "undefined") return
  try {
    localStorage.removeItem(STORAGE_KEYS.HISTORY)
    localStorage.removeItem(STORAGE_KEYS.LAST_SAVED)
  } catch (error) {
    console.error("[v0] Failed to clear history:", error)
  }
}

/**
 * Gets the timestamp of the last saved history entry
 */
export function getLastSavedTime(): string | null {
  if (typeof window === "undefined") return null
  try {
    return localStorage.getItem(STORAGE_KEYS.LAST_SAVED)
  } catch (error) {
    console.error("[v0] Failed to get last saved time:", error)
    return null
  }
}

/**
 * Exports history as JSON for backup
 */
export function exportHistory(): string {
  const history = loadHistory()
  return JSON.stringify(history, null, 2)
}

/**
 * Imports history from JSON
 */
export function importHistory(jsonData: string): boolean {
  if (typeof window === "undefined") return false
  try {
    const parsed = JSON.parse(jsonData)
    if (!Array.isArray(parsed)) {
      throw new Error("Invalid history format: expected array")
    }
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(parsed))
    localStorage.setItem(STORAGE_KEYS.LAST_SAVED, new Date().toISOString())
    return true
  } catch (error) {
    console.error("[v0] Failed to import history:", error)
    return false
  }
}
