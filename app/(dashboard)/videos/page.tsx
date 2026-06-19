"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { PageHeader } from "@/components/page-header"
import { PageLoader } from "@/components/page-loader"
import { UploadDialog } from "@/components/videos/upload-dialog"
import { DeleteVideoDialog } from "@/components/videos/delete-video-dialog"
import { EmbedDialog } from "@/components/videos/embed-dialog"
import { api, getToken, removeToken } from "@/lib/api-client"
import { Video as VideoType, formatDuration } from "@/lib/video-types"
import { toast } from "sonner"
import { Upload, Film, FileVideo, Loader2, MoreHorizontal, Trash2, BarChart3, Code2 } from "lucide-react"

export default function VideosPage() {
  const router = useRouter()
  const [loading, setLoading] = React.useState(true)
  const [videos, setVideos] = React.useState<VideoType[]>([])
  const [uploadOpen, setUploadOpen] = React.useState(false)
  const [deleteTarget, setDeleteTarget] = React.useState<VideoType | null>(null)

  const fetchVideos = React.useCallback(async () => {
    try {
      const data = await api.get<VideoType[]>("/api/videos")
      setVideos(data)
    } catch {
      // ignore polling errors
    }
  }, [])

  React.useEffect(() => {
    const token = getToken()
    if (!token) {
      router.push("/login")
      return
    }
    async function load() {
      try {
        await fetchVideos()
      } catch {
        removeToken()
        router.push("/login")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [router, fetchVideos])

  const hasInProgress = videos.some(
    (v) => v.status === "uploading" || v.status === "processing"
  )

  React.useEffect(() => {
    if (!hasInProgress) return
    const interval = setInterval(fetchVideos, 5000)
    return () => clearInterval(interval)
  }, [hasInProgress, fetchVideos])

  function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  if (loading) {
    return <PageLoader />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <PageHeader title="Videos" description="Tu biblioteca de videos" />
        <Button onClick={() => setUploadOpen(true)}>
          <Upload className="mr-2 h-4 w-4" />
          Subir video
        </Button>
      </div>

      {videos.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
          <Film className="h-12 w-12 text-muted-foreground/50" />
          <div className="space-y-1">
            <p className="text-sm font-medium">No tienes videos todavía</p>
            <p className="text-sm text-muted-foreground">Sube tu primer video para comenzar</p>
          </div>
          <Button onClick={() => setUploadOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Subir video
          </Button>
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Video</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Duración</TableHead>
                <TableHead>Vistas</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {videos.map((video) => {
                const processing = video.status === "uploading" || video.status === "processing"
                return (
                  <TableRow
                    key={video.id}
                    className="cursor-pointer"
                    onClick={() => router.push(`/videos/${video.id}`)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-16 shrink-0 overflow-hidden rounded bg-muted">
                          {video.thumbnailUrl ? (
                            <img
                              src={video.thumbnailUrl}
                              alt={video.title}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <FileVideo className="h-4 w-4 text-muted-foreground/50" />
                            </div>
                          )}
                          {processing && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                              <Loader2 className="h-4 w-4 animate-spin text-white" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 max-w-[280px]">
                          <p className="font-medium truncate">{video.title}</p>
                          {processing && (
                            <p className="text-xs text-muted-foreground">
                              {video.status === "uploading" ? "Subiendo…" : "Procesando…"}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {video.status === "ready" && <Badge variant="secondary">Listo</Badge>}
                      {video.status === "processing" && <Badge variant="secondary">Procesando</Badge>}
                      {video.status === "uploading" && <Badge variant="secondary">Subiendo</Badge>}
                      {video.status === "error" && <Badge variant="destructive">Error</Badge>}
                    </TableCell>
                    <TableCell>
                      {video.status === "ready" && video.duration ? formatDuration(video.duration) : "—"}
                    </TableCell>
                    <TableCell>
                      {video.status === "ready" && video.views > 0 ? video.views : "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(video.createdAt)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7"
                          onClick={() => router.push(`/videos/${video.id}`)}
                          title="Ver detalle y analítica"
                        >
                          <BarChart3 className="h-4 w-4" />
                        </Button>
                        {video.status === "ready" && (
                          <EmbedDialog embedId={video.embedId}>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-7"
                              title="Incrustar"
                            >
                              <Code2 className="h-4 w-4" />
                            </Button>
                          </EmbedDialog>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-7"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() => setDeleteTarget(video)}
                            >
                              <Trash2 />
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <UploadDialog
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        onUploaded={() => fetchVideos()}
      />

      <DeleteVideoDialog
        videoId={deleteTarget?.id}
        videoTitle={deleteTarget?.title}
        open={deleteTarget !== null}
        onOpenChange={(o) => { if (!o) setDeleteTarget(null) }}
        onDeleted={() => { setDeleteTarget(null); fetchVideos() }}
      />
    </div>
  )
}
