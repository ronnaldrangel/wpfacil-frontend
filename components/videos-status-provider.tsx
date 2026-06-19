"use client"

import * as React from "react"
import { toast } from "sonner"
import { api, getToken } from "@/lib/api-client"
import { addNotification } from "@/lib/notifications"

interface InProgressVideo {
  id: string
  title: string
  status: string
}

export function VideosStatusProvider({ children }: { children: React.ReactNode }) {
  const prevStatusRef = React.useRef<Record<string, string>>({})

  React.useEffect(() => {
    let interval: ReturnType<typeof setInterval>

    async function check() {
      if (!getToken()) return
      try {
        const videos = await api.get<InProgressVideo[]>("/api/videos/in-progress")
        const prev = prevStatusRef.current
        const next: Record<string, string> = {}

        for (const v of videos) {
          next[v.id] = v.status
          const wasProcessing = prev[v.id] === "uploading" || prev[v.id] === "processing"
          if (wasProcessing && (v.status === "ready" || v.status === "error")) {
            if (v.status === "ready") {
              toast.success(`"${v.title}" está listo`, { description: "Tu video ya está disponible" })
              addNotification(`Tu video "${v.title}" ya está disponible`)
            } else {
              toast.error(`Error procesando "${v.title}"`)
              addNotification(`Hubo un error al procesar tu video "${v.title}"`)
            }
          }
        }

        prevStatusRef.current = next
      } catch {
        // ignore polling errors
      }
    }

    interval = setInterval(check, 10000)
    check()

    return () => clearInterval(interval)
  }, [])

  return <>{children}</>
}
