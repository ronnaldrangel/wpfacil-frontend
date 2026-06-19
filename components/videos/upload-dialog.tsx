"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { presignUpload, putToR2, createVideo } from "@/lib/api-client"
import { addNotification } from "@/lib/notifications"
import { toast } from "sonner"
import { Upload, FileVideo, Loader2, X, CheckCircle2, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface UploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onUploaded: (videoId: string) => void
}

type Phase = "select" | "uploading" | "confirming" | "done" | "error"

const MAX_SIZE = 2 * 1024 * 1024 * 1024

export function UploadDialog({ open, onOpenChange, onUploaded }: UploadDialogProps) {
  const [phase, setPhase] = React.useState<Phase>("select")
  const [file, setFile] = React.useState<File | null>(null)
  const [progress, setProgress] = React.useState(0)
  const [loadedBytes, setLoadedBytes] = React.useState(0)
  const [error, setError] = React.useState("")
  const [dragOver, setDragOver] = React.useState(false)
  const abortRef = React.useRef<{ abort: () => void } | null>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    if (open) {
      setPhase("select")
      setFile(null)
      setProgress(0)
      setLoadedBytes(0)
      setError("")
    }
  }, [open])

  React.useEffect(() => {
    if (phase !== "uploading") return
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ""
    }
    window.addEventListener("beforeunload", handler)
    return () => window.removeEventListener("beforeunload", handler)
  }, [phase])

  function selectFile(f: File) {
    if (!f.type.startsWith("video/")) {
      toast.error("El archivo debe ser un video")
      return
    }
    if (f.size > MAX_SIZE) {
      toast.error("El video no puede superar los 2GB")
      return
    }
    setFile(f)
    setError("")
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files?.[0]
    if (f) selectFile(f)
  }

  async function handleUpload() {
    if (!file) return
    setPhase("uploading")
    setProgress(0)
    setError("")

    try {
      console.log("[upload] step 1: presign", { name: file.name, type: file.type, size: file.size })
      const { tempId, uploadUrl } = await presignUpload(file.name, file.type, file.size)
      console.log("[upload] step 1 OK: presign", { tempId, uploadUrlHost: (() => { try { return new URL(uploadUrl).host } catch { return "?" } })() })

      console.log("[upload] step 2: PUT to R2")
      const uploader = putToR2(uploadUrl, file, (pct, loaded) => {
        setProgress(pct)
        setLoadedBytes(loaded)
      })
      abortRef.current = uploader
      await uploader.promise
      console.log("[upload] step 2 OK: R2 upload complete")

      console.log("[upload] step 3: create video (verify + DB + queue)")
      setPhase("confirming")
      const { videoId } = await createVideo(tempId, file.name, file.size)
      console.log("[upload] step 3 OK: video created", { videoId })

      addNotification(`Tu video "${file.name.replace(/\.[^/.]+$/, "")}" se está procesando`)
      toast.success("Video subido", { description: "Se está procesando. Te avisaremos al terminar." })
      setPhase("done")
      onUploaded(videoId)
    } catch (err: any) {
      if (err?.message === "Subida cancelada") {
        console.log("[upload] cancelled by user")
        setPhase("select")
        return
      }
      console.error("[upload] failed:", err)
      setError(err?.message || "Error al subir el video")
      setPhase("error")
    }
  }

  function handleCancel() {
    if (abortRef.current) {
      abortRef.current.abort()
    }
    onOpenChange(false)
  }

  function handleRetry() {
    setPhase("select")
    setProgress(0)
    setError("")
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (phase !== "uploading") onOpenChange(v) }}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => { if (phase === "uploading") e.preventDefault() }}>
        <DialogHeader>
          <DialogTitle>Subir video</DialogTitle>
          <DialogDescription>
            {phase === "done" ? "Tu video se está procesando" : "Sube un video MP4 (máximo 2GB)"}
          </DialogDescription>
        </DialogHeader>

        {phase === "select" && (
          <div className="space-y-4">
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              className={cn(
                "flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-8 cursor-pointer transition-colors",
                dragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-muted-foreground/50"
              )}
            >
              <Upload className="h-8 w-8 text-muted-foreground" />
              <div className="text-center">
                <p className="text-sm font-medium">Arrastra tu video aquí</p>
                <p className="text-xs text-muted-foreground mt-1">o haz clic para seleccionar</p>
              </div>
              <input
                ref={inputRef}
                type="file"
                accept="video/*"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) selectFile(f) }}
              />
            </div>

            {file && (
              <div className="flex items-center gap-3 rounded-lg border p-3">
                <FileVideo className="h-5 w-5 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{(file.size / (1024 * 1024)).toFixed(1)} MB</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setFile(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
              <Button onClick={handleUpload} disabled={!file}>
                <Upload className="mr-2 h-4 w-4" />
                Subir
              </Button>
            </div>
          </div>
        )}

        {phase === "uploading" && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <FileVideo className="h-5 w-5 shrink-0 text-muted-foreground" />
              <p className="text-sm font-medium truncate flex-1">{file?.name}</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Subiendo…</span>
                <span className="font-medium">{progress}%</span>
              </div>
              <Progress value={progress} />
              <p className="text-xs text-muted-foreground">
                {(loadedBytes / (1024 * 1024)).toFixed(1)} MB / {(file?.size || 0 / (1024 * 1024)).toFixed(1)} MB
              </p>
            </div>
            <Button variant="outline" className="w-full" onClick={handleCancel}>
              <X className="mr-2 h-4 w-4" />
              Cancelar subida
            </Button>
          </div>
        )}

        {phase === "confirming" && (
          <div className="flex flex-col items-center gap-3 py-6">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Confirmando subida…</p>
          </div>
        )}

        {phase === "done" && (
          <div className="flex flex-col items-center gap-3 py-6">
            <CheckCircle2 className="h-10 w-10 text-green-500" />
            <p className="text-sm font-medium">¡Video subido!</p>
            <p className="text-xs text-muted-foreground text-center">
              Se está procesando. Te notificaremos cuando esté listo.
            </p>
            <Button onClick={() => onOpenChange(false)}>Cerrar</Button>
          </div>
        )}

        {phase === "error" && (
          <div className="flex flex-col items-center gap-3 py-6">
            <AlertCircle className="h-10 w-10 text-destructive" />
            <p className="text-sm font-medium">Error al subir</p>
            <p className="text-xs text-muted-foreground text-center">{error}</p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleRetry}>Reintentar</Button>
              <Button onClick={() => onOpenChange(false)}>Cerrar</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
