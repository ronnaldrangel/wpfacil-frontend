export interface Video {
  id: string
  title: string
  description: string | null
  status: "uploading" | "processing" | "ready" | "error"
  duration: number | null
  sizeBytes: number | null
  errorMessage: string | null
  embedId: string
  views: number
  plays: number
  createdAt: string
  updatedAt: string
  thumbnailUrl: string | null
  hlsUrl: string | null
}

export interface InProgressVideo {
  id: string
  title: string
  status: string
}

export interface VideoAnalytics {
  totalViews: number
  totalPlays: number
  completionRate: number
  avgWatchTimeMs: number
  viewsByDay: { date: string; views: number }[]
  watchTimeBuckets: { bucket: string; count: number }[]
}

export interface EmbedData {
  title: string
  hlsUrl: string
  thumbnailUrl: string | null
  duration: number | null
}

export function formatDuration(seconds: number | null): string {
  if (!seconds || seconds <= 0) return "0:00"
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, "0")}`
}

export function formatBytes(bytes: number | null): string {
  if (!bytes) return "—"
  const units = ["B", "KB", "MB", "GB"]
  let val = bytes
  let i = 0
  while (val >= 1024 && i < units.length - 1) {
    val /= 1024
    i++
  }
  return `${val.toFixed(i === 0 ? 0 : 1)} ${units[i]}`
}

export function formatWatchTime(ms: number): string {
  const s = Math.round(ms / 1000)
  const m = Math.floor(s / 60)
  const rs = s % 60
  return `${m}:${rs.toString().padStart(2, "0")}`
}
