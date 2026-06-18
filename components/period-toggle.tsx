"use client"

import { cn } from "@/lib/utils"

interface PeriodToggleProps {
  value: "monthly" | "annual"
  onChange: (value: "monthly" | "annual") => void
  labels?: { monthly: string; annual: string }
  className?: string
}

export function PeriodToggle({
  value,
  onChange,
  labels = { monthly: "Mensual", annual: "Anual" },
  className,
}: PeriodToggleProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-lg bg-muted p-1",
        className
      )}
    >
      <button
        type="button"
        onClick={() => onChange("monthly")}
        className={cn(
          "rounded-md px-4 py-2 text-sm font-medium transition-all",
          value === "monthly"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        {labels.monthly}
      </button>
      <button
        type="button"
        onClick={() => onChange("annual")}
        className={cn(
          "rounded-md px-4 py-2 text-sm font-medium transition-all",
          value === "annual"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        {labels.annual}
      </button>
    </div>
  )
}
