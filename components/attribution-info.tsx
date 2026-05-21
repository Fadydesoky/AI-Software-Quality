"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ShieldCheck, Database, Beaker, TrendingUp, AlertCircle, Info } from "lucide-react"
import { cn } from "@/lib/utils"
import type { PredictionAttribution } from "@/lib/attribution"
import {
  getConfidenceDescription,
  getConfidenceStyle,
  formatConfidenceScore,
} from "@/lib/attribution"

interface AttributionInfoProps {
  attribution: PredictionAttribution
  showDetailedBreakdown?: boolean
}

export function AttributionInfo({ attribution, showDetailedBreakdown = false }: AttributionInfoProps) {
  const [expandedSource, setExpandedSource] = React.useState<string | null>(null)
  const confidenceStyle = getConfidenceStyle(attribution.overallConfidence)
  const { value: scoreValue, visual: scoreVisual } = formatConfidenceScore(attribution.confidenceFactors.modelAccuracy)

  return (
    <div className="space-y-4">
      {/* Main Confidence Card */}
      <Card className={cn("border-border/50", confidenceStyle.badge)}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className={cn(
                "flex h-10 w-10 items-center justify-center rounded-lg",
                confidenceStyle.badge
              )}>
                <ShieldCheck className={cn("h-5 w-5", confidenceStyle.icon)} />
              </div>
              <div>
                <CardTitle className="text-base font-semibold">Prediction Confidence</CardTitle>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {getConfidenceDescription(attribution.overallConfidence)}
                </p>
              </div>
            </div>
            <Badge className={cn("text-sm font-semibold", confidenceStyle.badge)}>
              {attribution.overallConfidence.replace("-", " ").toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Confidence Score Visual */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-muted-foreground">Overall Confidence</p>
                <span className="text-sm font-bold">{scoreValue}</span>
              </div>
              <div className="flex h-6 items-center rounded-lg bg-muted/30 px-2 font-mono text-[10px] text-muted-foreground overflow-x-auto">
                <span className={cn("font-bold", confidenceStyle.icon)}>{scoreVisual}</span>
              </div>
            </div>

            {/* Confidence Factors */}
            {showDetailedBreakdown && (
              <div className="space-y-2 border-t border-border/50 pt-3">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Confidence Breakdown</p>
                <div className="grid gap-2">
                  {[
                    { label: "Data Quality", value: attribution.confidenceFactors.dataQuality, icon: Database },
                    { label: "Model Accuracy", value: attribution.confidenceFactors.modelAccuracy, icon: Beaker },
                    { label: "Data Freshness", value: attribution.confidenceFactors.dataFreshness, icon: TrendingUp },
                    { label: "Sample Size", value: attribution.confidenceFactors.sampleSize, icon: TrendingUp },
                  ].map(({ label, value, icon: Icon }) => (
                    <div key={label} className="flex items-center gap-2">
                      <Icon className="h-3 w-3 text-muted-foreground shrink-0" />
                      <span className="text-xs text-muted-foreground">{label}</span>
                      <div className="flex-1 h-1.5 bg-muted/30 rounded-full overflow-hidden">
                        <div
                          className={cn("h-full transition-all", confidenceStyle.bar)}
                          style={{ width: `${value}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold min-w-[2.5rem] text-right">{value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Data Sources */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Database className="h-4 w-4" />
            Data Sources
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {Array.from(attribution.sources.values()).map((source) => (
            <div
              key={source.name}
              className="cursor-pointer rounded-lg border border-border/50 bg-muted/20 p-3 transition-colors hover:bg-muted/40"
              onClick={() => setExpandedSource(expandedSource === source.name ? null : source.name)}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{source.name}</p>
                  {expandedSource === source.name && (
                    <>
                      <p className="mt-2 text-xs text-muted-foreground text-pretty">{source.description}</p>
                      {source.version && (
                        <p className="mt-1 text-xs text-muted-foreground">Version: {source.version}</p>
                      )}
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-xs font-medium text-muted-foreground">Reliability:</span>
                        <div className="flex-1 h-1.5 bg-muted/50 rounded-full overflow-hidden max-w-xs">
                          <div
                            className="h-full bg-emerald-500"
                            style={{ width: `${source.reliability}%` }}
                          />
                        </div>
                        <span className="text-xs font-semibold">{source.reliability}%</span>
                      </div>
                    </>
                  )}
                </div>
                <Badge variant="outline" className="text-[10px] shrink-0">
                  {source.reliability >= 80 ? "Reliable" : "Fair"}
                </Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Caveats/Notes */}
      {attribution.notes.length > 0 && (
        <Card className="border-amber-200/50 dark:border-amber-800/50 bg-amber-500/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-amber-900 dark:text-amber-100">
              <AlertCircle className="h-4 w-4" />
              Important Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {attribution.notes.map((note, idx) => (
                <li key={idx} className="flex gap-2 text-xs text-amber-900 dark:text-amber-100">
                  <span className="font-bold shrink-0">•</span>
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Timestamp */}
      <div className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/30 px-3 py-2">
        <p className="text-xs text-muted-foreground">Analysis timestamp</p>
        <p className="text-xs font-mono text-foreground">
          {attribution.timestamp.toLocaleString([], {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </div>
  )
}
