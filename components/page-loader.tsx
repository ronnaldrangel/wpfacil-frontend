import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface PageLoaderProps {
  className?: string
}

export function PageLoader({ className }: PageLoaderProps) {
  return (
    <div className={cn("flex items-center justify-center py-20", className)}>
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  )
}
