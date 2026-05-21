"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Lightbulb, ArrowRight, Target, TrendingUp, CheckCircle2, Sparkles, Zap } from "lucide-react"
import { RecommendationModal } from "@/components/recommendation-modal"
import { cn } from "@/lib/utils"
import type { Recommendation } from "@/lib/prediction"

interface RecommendationsProps {
  recommendations: Recommendation[]
  isAdvancedMode?: boolean
  repoUrl?: string
}

const priorityColors = {
  critical: {
    badge: "bg-red-700/20 text-red-700 dark:text-red-400 border-red-700/50",
    icon: "text-red-700",
    border: "border-l-red-700",
    glow: "shadow-red-700/20",
  },
  high: {
    badge: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30",
    icon: "text-red-500",
    border: "border-l-red-500",
    glow: "shadow-red-500/10",
  },
  medium: {
    badge: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
    icon: "text-amber-500",
    border: "border-l-amber-500",
    glow: "shadow-amber-500/10",
  },
  low: {
    badge: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30",
    icon: "text-blue-500",
    border: "border-l-blue-500",
    glow: "shadow-blue-500/10",
  },
}

export function Recommendations({ recommendations, isAdvancedMode = false, repoUrl }: RecommendationsProps) {
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null)
  const [animatedIn, setAnimatedIn] = React.useState(false)
  const [selectedRecommendation, setSelectedRecommendation] = React.useState<Recommendation | null>(null)
  const [modalOpen, setModalOpen] = React.useState(false)

  React.useEffect(() => {
    const timer = setTimeout(() => setAnimatedIn(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const handleRecommendationClick = (rec: Recommendation) => {
    setSelectedRecommendation(rec)
    setModalOpen(true)
  }

  if (recommendations.length === 0) {
    return (
      <Card className={cn(
        "border-emerald-500/20 bg-emerald-500/5 transition-all duration-500",
        animatedIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      )}>
        <CardContent className="flex items-center gap-3 py-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          </div>
          <div>
            <p className="font-medium text-emerald-600 dark:text-emerald-400">All Clear</p>
            <p className="text-sm text-muted-foreground">No critical recommendations at this time</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className={cn(
        "border-border/50 transition-all duration-500",
        animatedIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      )}>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10">
                  <Lightbulb className="h-4 w-4 text-amber-500" />
                </div>
                <div className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary">
                  <Sparkles className="h-2 w-2 text-primary-foreground" />
                </div>
              </div>
              <div>
                <CardTitle className="text-sm font-medium">Dynamic Recommendations</CardTitle>
                <p className="text-xs text-muted-foreground">
                  {recommendations.length} actionable suggestion{recommendations.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
            <Badge variant="outline" className="text-[10px] font-medium bg-primary/5 text-primary border-primary/20">
              AI-Generated
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {recommendations.map((rec, index) => {
            const colors = priorityColors[rec.priority]
            const isHovered = hoveredIndex === index

            return (
              <button
                key={index}
                onClick={() => handleRecommendationClick(rec)}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className={cn(
                  "w-full rounded-lg border border-border/50 bg-card p-4 border-l-4 transition-all duration-300 text-left",
                  colors.border,
                  isHovered && `shadow-lg ${colors.glow} scale-[1.01] cursor-pointer`,
                  "hover:bg-muted/50",
                  animatedIn ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
                )}
                style={{ transitionDelay: `${index * 75}ms` }}
                title="View analysis details"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className={cn("text-[10px] font-medium uppercase", colors.badge)}>
                        {rec.priority} priority
                      </Badge>
                      <span className="text-xs text-muted-foreground">{rec.metric}</span>
                      {rec.priority === "high" && (
                        <Zap className="h-3 w-3 text-amber-500" />
                      )}
                    </div>
                    <p className="text-sm font-medium">{rec.action}</p>
                    
                    {/* Show additional context for file-based recommendations */}
                    {rec.metric === "Complexity Hotspot" && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {rec.targetValue}
                      </p>
                    )}
                    
                    {/* Always show impact details with numbers */}
                    <div className="flex items-center gap-4 text-xs">
                      <div className={cn(
                        "flex items-center gap-1.5 px-2 py-1 rounded-md transition-colors",
                        "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      )}>
                        <TrendingUp className="h-3 w-3" />
                        <span className="font-semibold">{rec.impact}</span>
                      </div>
                      {isAdvancedMode && (
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Target className="h-3 w-3" />
                          <span>Target: <span className="font-semibold text-foreground">{rec.targetValue}</span></span>
                        </div>
                      )}
                    </div>
                  </div>
                  <ArrowRight className={cn(
                    "h-4 w-4 shrink-0 mt-1 transition-transform duration-300",
                    colors.icon,
                    isHovered && "translate-x-1"
                  )} />
                </div>
              </button>
            )
          })}
        </CardContent>
      </Card>

      <RecommendationModal
        recommendation={selectedRecommendation}
        open={modalOpen}
        onOpenChange={setModalOpen}
        repoUrl={repoUrl}
      />
    </>
  )
}
