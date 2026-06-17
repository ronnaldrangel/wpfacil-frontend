"use client"

import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, TrendingDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface AdminMetricCardProps {
  label: string
  value: string
  change: number
  icon: React.ReactNode
}

export function AdminMetricCard({ label, value, change, icon }: AdminMetricCardProps) {
  const isPositive = change >= 0
  const TrendIcon = isPositive ? TrendingUp : TrendingDown

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            {icon}
          </div>
        </div>
        <div className="mt-4 flex items-center gap-1.5 text-sm">
          <TrendIcon
            className={cn(
              "h-4 w-4",
              isPositive ? "text-green-600" : "text-red-600"
            )}
          />
          <span
            className={cn(
              "font-medium",
              isPositive ? "text-green-600" : "text-red-600"
            )}
          >
            {isPositive ? "+" : ""}{change}%
          </span>
          <span className="text-muted-foreground">vs mes anterior</span>
        </div>
      </CardContent>
    </Card>
  )
}
