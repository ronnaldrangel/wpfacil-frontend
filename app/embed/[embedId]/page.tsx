"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import { VideoPlayer } from "@/components/videos/video-player"
import { EmbedData } from "@/lib/video-types"
import { Loader2 } from "lucide-react"

export default function EmbedPage() {
  const params = useParams()
  const embedId = params.embedId as string
  const [data, setData] = React.useState<EmbedData | null>(null)
  const [error, setError] = React.useState(false)

  React.useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"
    fetch(`${apiUrl}/api/videos/embed/${embedId}`)
      .then((r) => { if (!r.ok) throw new Error(); return r.json() })
      .then(setData)
      .catch(() => setError(true))
  }, [embedId])

  return (
    <>
      <style>{`a[aria-label="Contactar por WhatsApp"] { display: none !important; }`}</style>
      <div className="flex min-h-screen flex-col items-center justify-center bg-black p-4">
        {error ? (
          <p className="text-sm text-white/60">Video no disponible</p>
        ) : !data ? (
          <Loader2 className="h-8 w-8 animate-spin text-white/60" />
        ) : (
          <div className="w-full max-w-5xl space-y-3">
            <div className="overflow-hidden rounded-lg">
              <VideoPlayer
                hlsUrl={data.hlsUrl}
                thumbnailUrl={data.thumbnailUrl}
                title={data.title}
                embedId={embedId}
                variant="embed"
              />
            </div>
            <p className="text-center text-sm text-white/60">{data.title}</p>
          </div>
        )}
      </div>
    </>
  )
}
