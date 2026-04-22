"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { GraduationCap, Wrench } from "lucide-react"
import { cn } from "@/lib/utils"

interface ModeToggleProps {
  isAdvanced: boolean
  onToggle: (advanced: boolean) => void
}

export function ModeToggle({ isAdvanced, onToggle }: ModeToggleProps) {
  return (
    <div className="flex items-center gap-1 rounded-lg border border-border/50 bg-muted/30 p-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onToggle(false)}
        className={cn(
          "h-8 px-3 text-xs transition-all duration-200",
          !isAdvanced 
            ? "bg-background shadow-sm text-foreground" 
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <GraduationCap className="h-3.5 w-3.5 mr-1.5" />
        Simple
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onToggle(true)}
        className={cn(
          "h-8 px-3 text-xs transition-all duration-200",
          isAdvanced 
            ? "bg-background shadow-sm text-foreground" 
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <Wrench className="h-3.5 w-3.5 mr-1.5" />
        Advanced
      </Button>
    </div>
  )
}
