"use client"

import { cn } from "@/lib/utils"

const DEFAULT_STEPS = [
  { number: 1, label: "Nombre" },
  { number: 2, label: "Dominio" },
  { number: 3, label: "Plan" },
]

interface CreateSiteStepsProps {
  currentStep: number
  totalSteps?: number
}

export function CreateSiteSteps({ currentStep, totalSteps }: CreateSiteStepsProps) {
  const steps = totalSteps ? DEFAULT_STEPS.slice(0, totalSteps) : DEFAULT_STEPS

  return (
    <div className="flex items-center justify-center gap-4">
      {steps.map((step, index) => (
        <div key={step.number} className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors",
                currentStep === step.number
                  ? "bg-primary text-primary-foreground"
                  : currentStep > step.number
                  ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-100"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {currentStep > step.number ? "✓" : step.number}
            </div>
            <span
              className={cn(
                "text-sm font-medium",
                currentStep === step.number
                  ? "text-foreground"
                  : "text-muted-foreground"
              )}
            >
              {step.label}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div
              className={cn(
                "h-0.5 w-12 rounded",
                currentStep > step.number ? "bg-green-500" : "bg-muted"
              )}
            />
          )}
        </div>
      ))}
    </div>
  )
}
