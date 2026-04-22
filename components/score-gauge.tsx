"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { 
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Info, TrendingUp, TrendingDown, Minus } from "lucide-react"

interface ScoreGaugeProps {
  score: number
  previousScore?: number
  risk: "High" | "Medium" | "Low"
  confidence: number
  confidenceLevel: "Low" | "Medium" | "High"
  size?: "sm" | "md" | "lg"
  showLabels?: boolean
}

export function ScoreGauge({ 
  score, 
  previousScore,
  risk, 
  confidence, 
  confidenceLevel,
  size = "md",
  showLabels = true,
}: ScoreGaugeProps) {
  const [animatedScore, setAnimatedScore] = React.useState(0)
  const [isVisible, setIsVisible] = React.useState(false)
  
  const sizeConfig = {
    sm: { width: 120, stroke: 8, fontSize: "text-2xl", labelSize: "text-[10px]" },
    md: { width: 180, stroke: 12, fontSize: "text-4xl", labelSize: "text-xs" },
    lg: { width: 240, stroke: 16, fontSize: "text-5xl", labelSize: "text-sm" },
  }

  const config = sizeConfig[size]
  const radius = (config.width - config.stroke) / 2
  const circumference = 2 * Math.PI * radius
  const arcLength = circumference * 0.75 // 270 degrees
  const progress = (animatedScore / 100) * arcLength

  // Animate on mount
  React.useEffect(() => {
    setIsVisible(true)
    const timer = setTimeout(() => {
      const duration = 1000
      const startTime = Date.now()
      const startScore = 0
      
      const animate = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)
        // Easing function for smooth animation
        const easeOutQuart = 1 - Math.pow(1 - progress, 4)
        const currentScore = Math.round(startScore + (score - startScore) * easeOutQuart)
        
        setAnimatedScore(currentScore)
        
        if (progress < 1) {
          requestAnimationFrame(animate)
        }
      }
      
      requestAnimationFrame(animate)
    }, 200)

    return () => clearTimeout(timer)
  }, [score])

  // Get gradient colors based on score
  const getGradientColors = () => {
    if (score >= 75) {
      return { start: "#10b981", end: "#059669" } // emerald
    } else if (score >= 50) {
      return { start: "#f59e0b", end: "#d97706" } // amber
    } else {
      return { start: "#ef4444", end: "#dc2626" } // red
    }
  }

  const gradientColors = getGradientColors()
  const gradientId = `score-gradient-${size}`
  const bgGradientId = `bg-gradient-${size}`

  const scoreDiff = previousScore !== undefined ? score - previousScore : null

  const getRiskStyles = () => {
    switch (risk) {
      case "Low":
        return "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/30"
      case "Medium":
        return "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/30"
      case "High":
        return "text-red-600 dark:text-red-400 bg-red-500/10 border-red-500/30"
    }
  }

  const getConfidenceStyles = () => {
    switch (confidenceLevel) {
      case "High":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
      case "Medium":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400"
      case "Low":
        return "bg-red-500/10 text-red-600 dark:text-red-400"
    }
  }

  return (
    <div className={cn(
      "flex flex-col items-center gap-4 transition-all duration-500",
      isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
    )}>
      {/* SVG Gauge */}
      <div className="relative" style={{ width: config.width, height: config.width }}>
        <svg
          width={config.width}
          height={config.width}
          className="transform -rotate-[135deg]"
        >
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={gradientColors.start} />
              <stop offset="100%" stopColor={gradientColors.end} />
            </linearGradient>
            <linearGradient id={bgGradientId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(var(--muted))" stopOpacity="0.3" />
              <stop offset="100%" stopColor="hsl(var(--muted))" stopOpacity="0.1" />
            </linearGradient>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Background arc */}
          <circle
            cx={config.width / 2}
            cy={config.width / 2}
            r={radius}
            fill="none"
            stroke={`url(#${bgGradientId})`}
            strokeWidth={config.stroke}
            strokeLinecap="round"
            strokeDasharray={`${arcLength} ${circumference}`}
          />

          {/* Animated progress arc */}
          <circle
            cx={config.width / 2}
            cy={config.width / 2}
            r={radius}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth={config.stroke}
            strokeLinecap="round"
            strokeDasharray={`${progress} ${circumference}`}
            style={{
              transition: "stroke-dasharray 1s ease-out",
            }}
            filter="url(#glow)"
          />

          {/* Tick marks */}
          {[0, 25, 50, 75, 100].map((tick) => {
            const tickAngle = (tick / 100) * 270 - 45
            const tickRadius = radius + config.stroke / 2 + 8
            const x = config.width / 2 + tickRadius * Math.cos((tickAngle * Math.PI) / 180)
            const y = config.width / 2 + tickRadius * Math.sin((tickAngle * Math.PI) / 180)
            
            return (
              <g key={tick} className="transform rotate-[135deg]" style={{ transformOrigin: `${config.width / 2}px ${config.width / 2}px` }}>
                <text
                  x={x}
                  y={y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-muted-foreground"
                  style={{ fontSize: size === "sm" ? 8 : size === "md" ? 10 : 12 }}
                >
                  {tick}
                </text>
              </g>
            )
          })}
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className={cn(
            "font-bold tabular-nums transition-all duration-300",
            config.fontSize
          )}>
            {animatedScore}
          </div>
          {showLabels && (
            <span className={cn("text-muted-foreground mt-1", config.labelSize)}>
              Quality Score
            </span>
          )}
          {scoreDiff !== null && scoreDiff !== 0 && (
            <div className={cn(
              "flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full text-xs font-medium",
              scoreDiff > 0 ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-red-500/10 text-red-600 dark:text-red-400"
            )}>
              {scoreDiff > 0 ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {scoreDiff > 0 ? "+" : ""}{scoreDiff}
            </div>
          )}
        </div>
      </div>

      {/* Badges */}
      {showLabels && (
        <div className="flex items-center gap-2">
          <Badge 
            variant="outline" 
            className={cn("font-semibold", getRiskStyles())}
          >
            {risk} Risk
          </Badge>
          
          <Tooltip>
            <TooltipTrigger
                className={cn(
                  "inline-flex items-center gap-1 cursor-help font-medium rounded-md border px-2.5 py-0.5 text-xs",
                  getConfidenceStyles()
                )}
              >
                {confidence}% Confidence
                <Info className="h-3 w-3 ml-1 opacity-60" />
              </TooltipTrigger>
            <TooltipContent className="max-w-[200px] text-xs">
              {confidenceLevel === "High" 
                ? "High confidence - score is well away from risk thresholds"
                : confidenceLevel === "Medium"
                ? "Medium confidence - score is near a risk threshold"
                : "Low confidence - borderline score, may shift with small changes"}
            </TooltipContent>
          </Tooltip>
        </div>
      )}

      {/* Score zones legend */}
      {showLabels && size !== "sm" && (
        <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-red-500" />
            <span>0-49 High Risk</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-amber-500" />
            <span>50-74 Medium</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>75-100 Low Risk</span>
          </div>
        </div>
      )}
    </div>
  )
}
