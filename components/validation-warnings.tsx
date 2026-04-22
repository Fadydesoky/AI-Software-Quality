"use client"

import * as React from "react"
import { AlertCircle, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"
import type { InputValidation } from "@/lib/prediction"

interface ValidationWarningsProps {
  validations: InputValidation[]
}

export function ValidationWarnings({ validations }: ValidationWarningsProps) {
  if (validations.length === 0) return null

  const errors = validations.filter(v => v.type === "error")
  const warnings = validations.filter(v => v.type === "warning")

  return (
    <div className="space-y-2 animate-fade-in">
      {errors.map((validation, index) => (
        <div
          key={`error-${index}`}
          className={cn(
            "flex items-start gap-2.5 rounded-lg border px-3 py-2.5",
            "border-red-500/30 bg-red-500/10"
          )}
        >
          <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-medium text-red-600 dark:text-red-400">
              {validation.field.charAt(0).toUpperCase() + validation.field.slice(1)}
            </p>
            <p className="text-xs text-red-600/80 dark:text-red-400/80">
              {validation.message}
            </p>
          </div>
        </div>
      ))}

      {warnings.map((validation, index) => (
        <div
          key={`warning-${index}`}
          className={cn(
            "flex items-start gap-2.5 rounded-lg border px-3 py-2.5",
            "border-amber-500/30 bg-amber-500/10"
          )}
        >
          <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-medium text-amber-600 dark:text-amber-400">
              {validation.field.charAt(0).toUpperCase() + validation.field.slice(1)}
            </p>
            <p className="text-xs text-amber-600/80 dark:text-amber-400/80">
              {validation.message}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
