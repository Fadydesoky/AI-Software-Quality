"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Download, Trash2, GitCompare, History, ArrowUpDown, Filter, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { deleteHistoryEntry, clearHistory as clearHistoryStorage } from "@/lib/storage"
import type { HistoryEntry } from "@/lib/prediction"

type SortField = "timestamp" | "score" | "risk" | "bugs"
type SortOrder = "asc" | "desc"

interface HistoryTableProps {
  history: HistoryEntry[]
  onClear: () => void
  onCompare: (ids: [string, string]) => void
  selectedIds: string[]
  onSelect: (id: string) => void
  onDelete?: (id: string) => void
  onDeleteSelected?: (ids: string[]) => void
}

export function HistoryTable({ history, onClear, onCompare, selectedIds, onSelect, onDelete, onDeleteSelected }: HistoryTableProps) {
  const [sortField, setSortField] = React.useState<SortField>("timestamp")
  const [sortOrder, setSortOrder] = React.useState<SortOrder>("desc")
  const [filterRisk, setFilterRisk] = React.useState<"All" | "Low" | "Medium" | "High">("All")
  const [clearDialogOpen, setClearDialogOpen] = React.useState(false)
  const [deleteItemId, setDeleteItemId] = React.useState<string | null>(null)
  // Sorting and filtering logic
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortOrder("desc")
    }
  }

  const sortedAndFilteredHistory = React.useMemo(() => {
    let filtered = history.filter(entry => 
      filterRisk === "All" || entry.risk === filterRisk
    )

    return filtered.sort((a, b) => {
      let aVal: number, bVal: number

      switch (sortField) {
        case "timestamp":
          aVal = a.timestamp
          bVal = b.timestamp
          break
        case "score":
          aVal = a.score
          bVal = b.score
          break
        case "risk":
          const riskOrder = { "Low": 1, "Medium": 2, "High": 3 }
          aVal = riskOrder[a.risk]
          bVal = riskOrder[b.risk]
          break
        case "bugs":
          aVal = a.bugs
          bVal = b.bugs
          break
        default:
          return 0
      }

      return sortOrder === "asc" ? aVal - bVal : bVal - aVal
    })
  }, [history, sortField, sortOrder, filterRisk])

  const SortableHeader = ({ field, label }: { field: SortField; label: string }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center gap-1.5 hover:text-foreground transition-colors group"
      title={`Sort by ${label}`}
    >
      <span>{label}</span>
      <ArrowUpDown className={cn(
        "h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity",
        sortField === field && "opacity-100",
        sortField === field && sortOrder === "asc" && "rotate-180"
      )} />
    </button>
  )

  const exportCSV = () => {
    const headers = ["Timestamp", "Commits", "Bugs", "Complexity", "Developers", "Coverage", "Risk", "Score"]
    const rows = sortedAndFilteredHistory.map(entry => [
      new Date(entry.timestamp).toISOString(),
      entry.commits,
      entry.bugs,
      entry.complexity,
      entry.developers,
      entry.coverage,
      entry.risk,
      entry.score,
    ])
    
    const csv = [headers.join(","), ...rows.map(row => row.join(","))].join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `quality-predictions-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const canCompare = selectedIds.length === 2

  const handleDeleteItem = (id: string) => {
    // Update localStorage first, then trigger parent state update
    deleteHistoryEntry(id)
    // Trigger parent component state update which will reload from localStorage
    onDelete?.(id)
  }

  const handleDeleteSelected = () => {
    // Update localStorage by deleting each item
    selectedIds.forEach(id => deleteHistoryEntry(id))
    // Trigger parent component state update
    onDeleteSelected?.(selectedIds)
  }

  const handleClearAll = () => {
    // Clear localStorage and let parent component clear state
    clearHistoryStorage()
    setClearDialogOpen(false)
    onClear()
  }

  if (history.length === 0) {
    return (
      <Card className="border-border/50 border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted/50">
            <History className="h-7 w-7 text-muted-foreground/40" />
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            No predictions yet
          </p>
          <p className="mt-1 text-xs text-muted-foreground/60">
            Run your first analysis to see results here
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border/50">
      <CardHeader className="space-y-4 pb-4">
        <div className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-base font-semibold">Prediction History</CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">
              {sortedAndFilteredHistory.length} of {history.length} prediction{history.length !== 1 ? "s" : ""} shown
            </p>
          </div>
          <div className="flex items-center gap-2">
            {selectedIds.length > 0 && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => canCompare && onCompare(selectedIds as [string, string])}
                  disabled={!canCompare}
                  className="h-8 text-xs"
                >
                  <GitCompare className="h-3.5 w-3.5 mr-1.5" />
                  Compare ({selectedIds.length}/2)
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDeleteSelected}
                  className="h-8 text-xs text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                  Delete ({selectedIds.length})
                </Button>
              </>
            )}
            <Button variant="outline" size="sm" onClick={exportCSV} className="h-8 text-xs">
              <Download className="h-3.5 w-3.5 mr-1.5" />
              Export
            </Button>
            <Dialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 text-xs text-muted-foreground hover:text-destructive">
                  <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                  Clear All
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Clear All History?</DialogTitle>
                  <DialogDescription>
                    This action will permanently delete all {history.length} saved analysis
                    {history.length !== 1 ? "es" : ""}. This cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setClearDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button variant="destructive" onClick={handleClearAll}>
                    Clear All
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Risk Filter */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <div className="flex gap-2">
            {(["All", "Low", "Medium", "High"] as const).map(risk => (
              <Button
                key={risk}
                variant={filterRisk === risk ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterRisk(risk)}
                className="h-7 text-xs"
              >
                {risk}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="rounded-lg border border-border/50 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead className="w-12"></TableHead>
                <TableHead className="text-xs font-medium cursor-pointer hover:text-foreground">
                  <SortableHeader field="timestamp" label="Time" />
                </TableHead>
                <TableHead className="text-xs font-medium text-right">Commits</TableHead>
                <TableHead className="text-xs font-medium text-right cursor-pointer hover:text-foreground">
                  <SortableHeader field="bugs" label="Bugs" />
                </TableHead>
                <TableHead className="text-xs font-medium text-right">Complexity</TableHead>
                <TableHead className="text-xs font-medium text-right">Devs</TableHead>
                <TableHead className="text-xs font-medium text-right">Coverage</TableHead>
                <TableHead className="text-xs font-medium cursor-pointer hover:text-foreground">
                  <SortableHeader field="risk" label="Risk" />
                </TableHead>
                <TableHead className="text-xs font-medium text-right cursor-pointer hover:text-foreground">
                  <SortableHeader field="score" label="Score" />
                </TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedAndFilteredHistory.map((entry) => (
                <TableRow 
                  key={entry.id} 
                  className={cn(
                    "transition-colors",
                    selectedIds.includes(entry.id) && "bg-muted/50"
                  )}
                >
                  <TableCell className="py-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(entry.id)}
                        onChange={() => onSelect(entry.id)}
                        className="h-4 w-4 rounded border-border accent-primary cursor-pointer"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="py-3 whitespace-nowrap text-xs text-muted-foreground">
                    {new Date(entry.timestamp).toLocaleString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </TableCell>
                  <TableCell className="py-3 text-right text-xs tabular-nums">{entry.commits}</TableCell>
                  <TableCell className="py-3 text-right text-xs tabular-nums">{entry.bugs}</TableCell>
                  <TableCell className="py-3 text-right text-xs tabular-nums">{entry.complexity}</TableCell>
                  <TableCell className="py-3 text-right text-xs tabular-nums">{entry.developers}</TableCell>
                  <TableCell className="py-3 text-right text-xs tabular-nums">{entry.coverage}%</TableCell>
                  <TableCell className="py-3">
                    <Badge 
                      variant={entry.risk === "High" ? "destructive" : "secondary"}
                      className={cn(
                        "text-[10px] font-medium px-1.5 py-0",
                        entry.risk === "Low" && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20",
                        entry.risk === "Medium" && "bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20"
                      )}
                    >
                      {entry.risk}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-3 text-right text-xs tabular-nums font-semibold">{entry.score}</TableCell>
                  <TableCell className="py-3 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDeleteItem(entry.id)}
                      title="Delete this entry"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
