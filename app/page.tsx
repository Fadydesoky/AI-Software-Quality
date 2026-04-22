"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"
import { InputPanel } from "@/components/input-panel"
import { ResultsCard } from "@/components/results-card"
import { MetricsChart } from "@/components/metrics-chart"
import { HistoryTable } from "@/components/history-table"
import { ComparisonChart } from "@/components/comparison-chart"
import { ScoreHistogram } from "@/components/score-histogram"
import { KPICards } from "@/components/kpi-cards"
import { TrendChart } from "@/components/trend-chart"
import { ThemeToggle } from "@/components/theme-toggle"
import { ScoreBreakdownCard } from "@/components/score-breakdown"
import { TrendSimulation } from "@/components/trend-simulation"
import { ExportPanel } from "@/components/export-panel"
import { ValidationWarnings } from "@/components/validation-warnings"
import { RiskBreakdown } from "@/components/risk-breakdown"
import { Recommendations } from "@/components/recommendations"
import { FormulaDisplay } from "@/components/formula-display"
import { TrendIntelligence } from "@/components/trend-intelligence"
import { ModeToggle } from "@/components/mode-toggle"
import { ConfidenceBadge } from "@/components/confidence-badge"
import { 
  predictQuality, 
  validateInputs,
  analyzeTrend,
  decodeStateFromURL,
  type PredictionInput, 
  type PredictionResult, 
  type HistoryEntry 
} from "@/lib/prediction"
import { Activity } from "lucide-react"

function DashboardContent() {
  const searchParams = useSearchParams()
  
  // Initialize from URL params if present
  const initialInput = React.useMemo(() => {
    const fromURL = decodeStateFromURL(searchParams)
    return fromURL ?? {
      commits: 200,
      bugs: 50,
      complexity: 5,
      developers: 5,
      coverage: 70,
    }
  }, [searchParams])

  const [inputValues, setInputValues] = React.useState<PredictionInput>(initialInput)
  const [result, setResult] = React.useState<PredictionResult | null>(null)
  const [history, setHistory] = React.useState<HistoryEntry[]>([])
  const [isLoading, setIsLoading] = React.useState(false)
  const [selectedIds, setSelectedIds] = React.useState<string[]>([])
  const [comparisonEntries, setComparisonEntries] = React.useState<[HistoryEntry, HistoryEntry] | null>(null)
  const [isAdvancedMode, setIsAdvancedMode] = React.useState(false)

  // Live "what-if" analysis - update score as inputs change
  const liveResult = React.useMemo(() => {
    return predictQuality(inputValues)
  }, [inputValues])

  // Input validation
  const validations = React.useMemo(() => {
    return validateInputs(inputValues)
  }, [inputValues])

  // Trend analysis
  const trend = React.useMemo(() => {
    return analyzeTrend(history)
  }, [history])

  const hasErrors = validations.some(v => v.type === "error")

  const handlePredict = () => {
    if (hasErrors) return
    
    setIsLoading(true)
    
    setTimeout(() => {
      const prediction = predictQuality(inputValues)
      setResult(prediction)
      
      const entry: HistoryEntry = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        ...inputValues,
        risk: prediction.risk,
        score: prediction.score,
      }
      
      setHistory(prev => [...prev, entry])
      setIsLoading(false)
    }, 400)
  }

  const handleClearHistory = () => {
    setHistory([])
    setSelectedIds([])
    setComparisonEntries(null)
  }

  const handleSelect = (id: string) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(i => i !== id)
      }
      if (prev.length >= 2) {
        return [prev[1], id]
      }
      return [...prev, id]
    })
  }

  const handleCompare = (ids: [string, string]) => {
    const [a, b] = ids.map(id => history.find(h => h.id === id)!)
    if (a && b) {
      setComparisonEntries([a, b])
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-foreground">
              <Activity className="h-5 w-5 text-background" />
            </div>
            <span className="text-lg font-semibold tracking-tight">Quality Predictor</span>
          </div>
          <div className="flex items-center gap-3">
            <ModeToggle isAdvanced={isAdvancedMode} onToggle={setIsAdvancedMode} />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10">
        {/* KPI Summary */}
        <div className="animate-fade-in">
          <KPICards history={history} />
        </div>

        {/* Trend Intelligence */}
        {history.length >= 2 && (
          <div className="mt-6 animate-fade-in">
            <TrendIntelligence trend={trend} />
          </div>
        )}

        {/* Main Grid */}
        <div className="mt-8 grid gap-8 lg:grid-cols-[380px_1fr]">
          {/* Left Column - Input */}
          <div className="space-y-6">
            <div className="animate-slide-up" style={{ animationDelay: "50ms" }}>
              <InputPanel
                values={inputValues}
                onChange={setInputValues}
                onPredict={handlePredict}
                isLoading={isLoading}
                disabled={hasErrors}
              />
            </div>

            {/* Validation Warnings */}
            {validations.length > 0 && (
              <div className="animate-fade-in">
                <ValidationWarnings validations={validations} />
              </div>
            )}
            
            {/* Live Preview */}
            <div 
              className="animate-slide-up rounded-xl border border-border/50 bg-muted/30 p-5"
              style={{ animationDelay: "100ms" }}
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Live Preview</p>
                <ConfidenceBadge 
                  confidence={liveResult.confidence} 
                  confidenceLevel={liveResult.confidenceLevel} 
                />
              </div>
              <div className="mt-4 flex items-end justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Predicted Score</p>
                  <p className="mt-1 text-4xl font-bold tabular-nums tracking-tight">{liveResult.score}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Risk Level</p>
                  <p className={`mt-1 text-lg font-semibold ${
                    liveResult.risk === "High" ? "text-red-500" : 
                    liveResult.risk === "Medium" ? "text-amber-500" : "text-emerald-500"
                  }`}>
                    {liveResult.risk}
                  </p>
                </div>
              </div>
            </div>

            {/* Export Panel */}
            <div className="animate-slide-up" style={{ animationDelay: "150ms" }}>
              <ExportPanel input={inputValues} result={result} />
            </div>

            {/* Formula Display (Advanced Mode) */}
            {isAdvancedMode && (
              <div className="animate-fade-in">
                <FormulaDisplay 
                  formulas={liveResult.formulas} 
                  breakdown={liveResult.breakdown} 
                />
              </div>
            )}
          </div>

          {/* Right Column - Results */}
          <div className="space-y-6 animate-slide-up" style={{ animationDelay: "150ms" }}>
            <ResultsCard result={result} />
            
            {/* Risk Breakdown (Advanced Mode) */}
            {result && isAdvancedMode && (
              <div className="animate-fade-in">
                <RiskBreakdown categories={result.riskCategories} />
              </div>
            )}
            
            {/* Score Breakdown */}
            {result && (
              <div className="animate-fade-in">
                <ScoreBreakdownCard breakdown={result.breakdown} />
              </div>
            )}

            {/* Smart Recommendations */}
            {result && (
              <div className="animate-fade-in">
                <Recommendations 
                  recommendations={result.recommendations} 
                  isAdvancedMode={isAdvancedMode}
                />
              </div>
            )}
            
            {result && isAdvancedMode && <MetricsChart result={result} />}
          </div>
        </div>

        {/* Trend Simulation */}
        <div className="mt-10 animate-fade-in">
          <TrendSimulation currentInput={inputValues} />
        </div>

        {/* Comparison Chart */}
        {comparisonEntries && (
          <div className="mt-10 animate-scale-in">
            <ComparisonChart 
              entries={comparisonEntries} 
              onClose={() => {
                setComparisonEntries(null)
                setSelectedIds([])
              }} 
            />
          </div>
        )}

        {/* Charts Grid */}
        {history.length >= 2 && (
          <div className="mt-10 grid gap-6 md:grid-cols-2 animate-fade-in">
            <TrendChart history={history} />
            <ScoreHistogram history={history} />
          </div>
        )}

        {/* History Table */}
        <div className="mt-10 animate-fade-in">
          <HistoryTable
            history={history}
            onClear={handleClearHistory}
            onCompare={handleCompare}
            selectedIds={selectedIds}
            onSelect={handleSelect}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8 mt-16">
        <div className="mx-auto max-w-7xl px-6 text-center text-sm text-muted-foreground">
          Built for engineering teams - {isAdvancedMode ? "Advanced" : "Simple"} Mode
        </div>
      </footer>
    </div>
  )
}

export default function Dashboard() {
  return (
    <React.Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    }>
      <DashboardContent />
    </React.Suspense>
  )
}
