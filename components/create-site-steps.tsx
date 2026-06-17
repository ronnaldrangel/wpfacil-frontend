"use client"

interface CreateSiteStepsProps {
  currentStep: number
  totalSteps?: number
}

export function CreateSiteSteps({
  currentStep,
  totalSteps = 4,
}: CreateSiteStepsProps) {
  const progress = Math.min(
    Math.max((currentStep / totalSteps) * 100, 0),
    100
  )

  return (
    <div className="flex w-full items-center gap-4">
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full bg-primary transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
        {currentStep} / {totalSteps}
      </span>
    </div>
  )
}
