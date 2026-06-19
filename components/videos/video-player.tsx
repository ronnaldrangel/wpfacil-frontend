"use client"

import * as React from "react"
import "@videojs/react/video/skin.css"
import { createPlayer, usePlayer, selectPlayback, selectTime } from "@videojs/react"
import { VideoSkin, videoFeatures } from "@videojs/react/video"
import { HlsVideo } from "@videojs/react/media/hls-video"
import { api } from "@/lib/api-client"

const Player = createPlayer({ features: videoFeatures })

interface VideoPlayerProps {
  hlsUrl: string
  thumbnailUrl?: string | null
  title?: string
  embedId?: string
  variant?: "dashboard" | "embed"
}

export function VideoPlayer({
  hlsUrl,
  thumbnailUrl,
  title,
  embedId,
  variant = "dashboard",
}: VideoPlayerProps) {
  const [aspectRatio, setAspectRatio] = React.useState<string>("16 / 9")

  return (
    <Player.Provider>
      <VideoSkin
        poster={thumbnailUrl || undefined}
        style={{
          aspectRatio,
          width: "100%",
          margin: variant === "dashboard" ? "0 auto" : undefined,
          "--media-object-fit": "contain",
        } as React.CSSProperties}
      >
        <HlsVideo
          src={hlsUrl}
          playsInline
          title={title}
          onLoadedMetadata={(e: React.SyntheticEvent<HTMLVideoElement>) => {
            const v = e.currentTarget
            if (v.videoWidth && v.videoHeight) {
              setAspectRatio(`${v.videoWidth} / ${v.videoHeight}`)
            }
          }}
        />
      </VideoSkin>
      {variant === "embed" && embedId && <Telemetry embedId={embedId} />}
    </Player.Provider>
  )
}

function Telemetry({ embedId }: { embedId: string }) {
  const playback = usePlayer(selectPlayback)
  const time = usePlayer(selectTime)
  const viewIdRef = React.useRef<string | null>(null)
  const watchTimeMsRef = React.useRef(0)
  const lastPositionRef = React.useRef(0)
  const firstPlayRef = React.useRef(false)
  const lastTickRef = React.useRef(0)
  const lastHeartbeatRef = React.useRef(0)
  const durationRef = React.useRef(0)
  const endedRef = React.useRef(false)

  React.useEffect(() => {
    api
      .post<{ viewId: string }>(`/api/videos/embed/${embedId}/view`)
      .then((res) => { viewIdRef.current = res.viewId })
      .catch(() => {})
  }, [embedId])

  const sendHeartbeat = React.useCallback((completed = false, firstPlay = false) => {
    const viewId = viewIdRef.current
    if (!viewId) return
    const body: any = {
      lastPosition: Math.round(lastPositionRef.current),
      watchTimeMs: Math.round(watchTimeMsRef.current),
    }
    if (completed) body.completed = true
    if (firstPlay) body.firstPlay = true
    fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/videos/embed/${embedId}/view/${viewId}/heartbeat`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        keepalive: true,
      }
    ).catch(() => {})
  }, [embedId])

  React.useEffect(() => {
    if (time?.duration) durationRef.current = time.duration
  }, [time?.duration])

  React.useEffect(() => {
    if (!playback) return
    if (!firstPlayRef.current && playback.paused === false && !playback.ended) {
      firstPlayRef.current = true
      sendHeartbeat(false, true)
    }
  }, [playback?.paused, playback?.ended, sendHeartbeat])

  React.useEffect(() => {
    if (time?.currentTime != null) {
      lastPositionRef.current = time.currentTime
    }
  }, [time?.currentTime])

  React.useEffect(() => {
    if (!playback) return
    const interval = setInterval(() => {
      if (!playback.paused && !playback.ended) {
        const now = Date.now()
        if (lastTickRef.current === 0) lastTickRef.current = now
        const dt = now - lastTickRef.current
        if (dt >= 1000) {
          watchTimeMsRef.current += dt
          lastTickRef.current = now
          if (watchTimeMsRef.current >= 5000) {
            sendHeartbeat()
            watchTimeMsRef.current = 0
          }
        }
      } else {
        lastTickRef.current = 0
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [playback?.paused, playback?.ended, sendHeartbeat])

  React.useEffect(() => {
    if (playback?.ended && !endedRef.current) {
      endedRef.current = true
      lastPositionRef.current = durationRef.current
      sendHeartbeat(true)
      watchTimeMsRef.current = 0
    }
  }, [playback?.ended, sendHeartbeat])

  React.useEffect(() => {
    const flush = () => {
      if (viewIdRef.current) {
        const body = JSON.stringify({
          lastPosition: Math.round(lastPositionRef.current),
          watchTimeMs: Math.round(watchTimeMsRef.current),
        })
        try {
          navigator.sendBeacon(
            `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/videos/embed/${embedId}/view/${viewIdRef.current}/heartbeat`,
            new Blob([body], { type: "application/json" })
          )
        } catch {}
      }
    }
    window.addEventListener("pagehide", flush)
    return () => window.removeEventListener("pagehide", flush)
  }, [embedId])

  return null
}
