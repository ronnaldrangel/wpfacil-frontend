"use client"

import { cn } from "@/lib/utils"

interface SiteStatusBadgeProps {
  status: "provisioning" | "deploying" | "active" | "stopped" | "error" | "suspended"
}

export function SiteStatusBadge({ status }: SiteStatusBadgeProps) {
  const config: Record<string, { label: string; class: string; animate: boolean }> = {
    provisioning: {
      label: "Provisionando",
      class: "text-yellow-600 dark:text-yellow-400",
      animate: true,
    },
    deploying: {
      label: "Desplegando",
      class: "text-yellow-600 dark:text-yellow-400",
      animate: true,
    },
    active: {
      label: "Activo",
      class: "text-green-600 dark:text-green-400",
      animate: false,
    },
    stopped: {
      label: "Detenido",
      class: "text-gray-500 dark:text-gray-400",
      animate: false,
    },
    error: {
      label: "Error",
      class: "text-red-600 dark:text-red-400",
      animate: false,
    },
    suspended: {
      label: "Suspendido",
      class: "text-orange-600 dark:text-orange-400",
      animate: false,
    },
  }

  const { label, class: colorClass, animate } = config[status] || config.deploying

  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs font-medium", colorClass)}>
      {animate && (
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-yellow-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-yellow-500" />
        </span>
      )}
      {!animate && (
        <span
          className={cn(
            "inline-block h-2 w-2 rounded-full",
            status === "active" && "bg-green-500",
            status === "error" && "bg-red-500",
            status === "stopped" && "bg-gray-400",
            status === "suspended" && "bg-orange-500"
          )}
        />
      )}
      {label}
    </span>
  )
}
