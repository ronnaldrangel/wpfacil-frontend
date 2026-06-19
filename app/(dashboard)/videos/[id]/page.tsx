"use client"

import * as React from "react"
import { useRouter, useParams } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { PageLoader } from "@/components/page-loader"
import { VideoPlayer } from "@/components/videos/video-player"
import { EmbedDialog } from "@/components/videos/embed-dialog"
import { DeleteVideoDialog } from "@/components/videos/delete-video-dialog"
import { api, getToken, removeToken } from "@/lib/api-client"
import { Video, VideoAnalytics, formatDuration, formatBytes, formatWatchTime } from "@/lib/video-types"
import { toast } from "sonner"
import {
  ArrowLeft, Download, Trash2, Loader2, Eye, Play, CheckCircle2, Clock,
  AlertCircle, BarChart3,
} from "lucide-react"
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts"
import Link from "next/link"

export default function VideoDetailPage() {
  const router = useRouter()
  const params = useParams()
  const videoId = params.id as string
  const [loading, setLoading] = React.useState(true)
  const [video, setVideo] = React.useState<Video | null>(null)
  const [analytics, setAnalytics] = React.useState<VideoAnalytics | null>(null)
  const [editingTitle, setEditingTitle] = React.useState(false)
  const [titleValue, setTitleValue] = React.useState("")
  const [savingTitle, setSavingTitle] = React.useState(false)
  const [deleting, setDeleting] = React.useState(false)
  const playerWrapperRef = React.useRef<HTMLDivElement>(null)

  const fetchData = React.useCallback(async () => {
    try {
      const v = await api.get<Video>(`/api/videos/${videoId}`)
      setVideo(v)
      if (v.status === "ready") {
        const a = await api.get<VideoAnalytics>(`/api/videos/${videoId}/analytics`)
        setAnalytics(a)
      }
    } catch {
      removeToken()
      router.push("/videos")
    } finally {
      setLoading(false)
    }
  }, [videoId, router])

  React.useEffect(() => {
    const token = getToken()
    if (!token) {
      router.push("/login")
      return
    }
    fetchData()
  }, [router, fetchData])

  const isProcessing = video?.status === "processing" || video?.status === "uploading"

  React.useEffect(() => {
    if (!isProcessing) return
    const interval = setInterval(fetchData, 5000)
    return () => clearInterval(interval)
  }, [isProcessing, fetchData])

  React.useEffect(() => {
    if (video?.status !== "ready") return

    const resizePlayer = () => {
      const wrapper = playerWrapperRef.current
      const videoEl = wrapper?.querySelector("video") as HTMLVideoElement | null
      if (!wrapper || !videoEl || !videoEl.videoWidth || !videoEl.videoHeight) return

      const vw = videoEl.videoWidth
      const vh = videoEl.videoHeight
      const maxHeight = window.innerHeight * 0.7
      const aspect = vw / vh
      const parentWidth = wrapper.parentElement?.clientWidth || window.innerWidth
      const naturalHeight = parentWidth / aspect

      if (naturalHeight <= maxHeight) {
        wrapper.style.width = `${parentWidth}px`
        wrapper.style.height = `${naturalHeight}px`
      } else {
        wrapper.style.width = `${maxHeight * aspect}px`
        wrapper.style.height = `${maxHeight}px`
      }
    }

    let videoEl: HTMLVideoElement | null = null

    const poll = setInterval(() => {
      videoEl = playerWrapperRef.current?.querySelector("video") as HTMLVideoElement | null
      if (videoEl) {
        clearInterval(poll)
        videoEl.addEventListener("loadedmetadata", resizePlayer)
        if (videoEl.videoWidth) resizePlayer()
      }
    }, 100)

    window.addEventListener("resize", resizePlayer)

    return () => {
      clearInterval(poll)
      window.removeEventListener("resize", resizePlayer)
      if (videoEl) videoEl.removeEventListener("loadedmetadata", resizePlayer)
    }
  }, [video?.status])

  async function saveTitle() {
    if (!video) return
    const trimmed = titleValue.trim()
    if (!trimmed) {
      toast.error("El título no puede estar vacío")
      return
    }
    if (trimmed === video.title) {
      setEditingTitle(false)
      return
    }
    setSavingTitle(true)
    try {
      const v = await api.patch<Video>(`/api/videos/${videoId}`, { title: trimmed })
      setVideo(v)
      toast.success("Título actualizado")
    } catch (err: any) {
      toast.error(err?.message || "Error al guardar")
    } finally {
      setSavingTitle(false)
      setEditingTitle(false)
    }
  }

  function startEditing() {
    if (!video) return
    setTitleValue(video.title)
    setEditingTitle(true)
  }

  async function handleDownload() {
    try {
      const { url } = await api.get<{ url: string }>(`/api/videos/${videoId}/download`)
      window.location.href = url
    } catch (err: any) {
      toast.error(err?.message || "Error al descargar")
    }
  }

  if (loading) {
    return <PageLoader />
  }

  if (!video) return null

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/videos">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1 min-w-0">
          {editingTitle ? (
            <div className="flex items-center gap-2">
              <Input
                value={titleValue}
                onChange={(e) => setTitleValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveTitle()
                  if (e.key === "Escape") setEditingTitle(false)
                }}
                onBlur={saveTitle}
                autoFocus
                maxLength={200}
                className="text-xl font-bold h-9 max-w-md"
                disabled={savingTitle}
              />
              {savingTitle && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
            </div>
          ) : (
            <h1
              onClick={startEditing}
              className="text-xl font-bold truncate cursor-text hover:bg-muted/50 rounded px-1 -mx-1 transition-colors"
              title="Haz clic para editar"
            >
              {video.title}
            </h1>
          )}
          <div className="flex items-center gap-2 mt-1">
            {video.status === "ready" && <Badge variant="secondary">Listo</Badge>}
            {video.status === "processing" && <Badge variant="secondary" className="bg-amber-500/15 text-amber-700 dark:text-amber-400">Procesando</Badge>}
            {video.status === "uploading" && <Badge variant="secondary" className="bg-blue-500/15 text-blue-700 dark:text-blue-400">Subiendo</Badge>}
            {video.status === "error" && <Badge variant="destructive">Error</Badge>}
            {video.duration && <span className="text-sm text-muted-foreground">{formatDuration(video.duration)}</span>}
            {video.sizeBytes && <span className="text-sm text-muted-foreground">· {formatBytes(video.sizeBytes)}</span>}
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          {video.status === "ready" && (
            <TabsTrigger value="analytics">
              <BarChart3 className="mr-1.5 h-3.5 w-3.5" />
              Analítica
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Player / status */}
          <div>
            <Card className="overflow-hidden">
              <div className="bg-black max-h-[70vh]">
                {video.status === "ready" && video.hlsUrl ? (
                  <VideoPlayer
                    hlsUrl={video.hlsUrl}
                    thumbnailUrl={video.thumbnailUrl}
                    title={video.title}
                    variant="dashboard"
                  />
                ) : (
                  <div className="flex aspect-video h-full w-full flex-col items-center justify-center gap-3 text-white">
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-10 w-10 animate-spin" />
                        <p className="text-sm">{video.status === "uploading" ? "Subiendo video…" : "Procesando video…"}</p>
                        <p className="text-xs text-white/60">Te avisaremos cuando esté listo</p>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-10 w-10 text-destructive" />
                        <p className="text-sm">Error al procesar el video</p>
                        {video.errorMessage && <p className="text-xs text-white/60 max-w-md text-center">{video.errorMessage}</p>}
                      </>
                    )}
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Actions */}
          {video.status === "ready" && (
            <div className="flex flex-wrap gap-2">
              <EmbedDialog embedId={video.embedId} />
              <Button variant="outline" onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" />
                Descargar original
              </Button>
              <DeleteVideoDialog
                videoId={video.id}
                videoTitle={video.title}
                open={deleting}
                onOpenChange={setDeleting}
                onDeleted={() => router.push("/videos")}
              >
                <Button variant="outline" className="text-destructive hover:text-destructive" onClick={() => setDeleting(true)}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Eliminar
                </Button>
              </DeleteVideoDialog>
            </div>
          )}
        </TabsContent>

        {video.status === "ready" && (
          <TabsContent value="analytics" className="space-y-4">
            {analytics && (
              <>
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                  <StatCard icon={<Eye className="h-4 w-4" />} label="Vistas" value={analytics.totalViews} />
                  <StatCard icon={<Play className="h-4 w-4" />} label="Reproducciones" value={analytics.totalPlays} />
                  <StatCard icon={<CheckCircle2 className="h-4 w-4" />} label="Completion rate" value={`${analytics.completionRate}%`} />
                  <StatCard icon={<Clock className="h-4 w-4" />} label="Watch time prom." value={formatWatchTime(analytics.avgWatchTimeMs)} />
                </div>

                <Card className="p-4 space-y-2">
                  <p className="text-sm font-medium">Vistas (últimos 30 días)</p>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={analytics.viewsByDay}>
                        <defs>
                          <linearGradient id="viewsGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis
                          dataKey="date"
                          tickFormatter={(d) => d.slice(5)}
                          fontSize={11}
                          className="text-muted-foreground"
                        />
                        <YAxis allowDecimals={false} fontSize={11} className="text-muted-foreground" />
                        <Tooltip
                          contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }}
                          labelFormatter={() => `Vistas`}
                          formatter={(v: any) => [v, "Vistas"]}
                        />
                        <Area type="monotone" dataKey="views" stroke="hsl(var(--primary))" fill="url(#viewsGrad)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                <Card className="p-4 space-y-2">
                  <p className="text-sm font-medium">Distribución de visualización</p>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analytics.watchTimeBuckets}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="bucket" fontSize={11} className="text-muted-foreground" />
                        <YAxis allowDecimals={false} fontSize={11} className="text-muted-foreground" />
                        <Tooltip
                          contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }}
                          formatter={(v: any) => [v, "Vistas"]}
                        />
                        <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </>
            )}
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="rounded-lg border p-3 space-y-1">
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <p className="text-xl font-bold">{value}</p>
    </div>
  )
}
