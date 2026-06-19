"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { api } from "@/lib/api-client"
import { toast } from "sonner"
import { Trash2, Loader2 } from "lucide-react"

interface DeleteVideoDialogProps {
  videoId: string | undefined
  videoTitle: string | undefined
  open: boolean
  onOpenChange: (open: boolean) => void
  onDeleted: () => void
  children?: React.ReactNode
}

export function DeleteVideoDialog({
  videoId,
  videoTitle,
  open,
  onOpenChange,
  onDeleted,
  children,
}: DeleteVideoDialogProps) {
  const [confirmText, setConfirmText] = React.useState("")
  const [deleting, setDeleting] = React.useState(false)

  React.useEffect(() => {
    if (!open) {
      setConfirmText("")
      setDeleting(false)
    }
  }, [open])

  async function handleDelete() {
    if (!videoId) return
    setDeleting(true)
    try {
      await api.delete(`/api/videos/${videoId}`)
      toast.success("Video eliminado")
      onOpenChange(false)
      onDeleted()
    } catch (err: any) {
      toast.error(err?.message || "Error al eliminar")
      setDeleting(false)
    }
  }

  if (children) {
    return (
      <>
        {children}
        <DeleteDialogInner
          open={open}
          onOpenChange={onOpenChange}
          videoTitle={videoTitle}
          confirmText={confirmText}
          setConfirmText={setConfirmText}
          deleting={deleting}
          handleDelete={handleDelete}
        />
      </>
    )
  }

  return (
    <DeleteDialogInner
      open={open}
      onOpenChange={onOpenChange}
      videoTitle={videoTitle}
      confirmText={confirmText}
      setConfirmText={setConfirmText}
      deleting={deleting}
      handleDelete={handleDelete}
    />
  )
}

function DeleteDialogInner({
  open,
  onOpenChange,
  videoTitle,
  confirmText,
  setConfirmText,
  deleting,
  handleDelete,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  videoTitle: string | undefined
  confirmText: string
  setConfirmText: (v: string) => void
  deleting: boolean
  handleDelete: () => void
}) {
  const canDelete = confirmText === "DELETE"
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Eliminar video</DialogTitle>
          <DialogDescription>
            Esta acción no se puede deshacer. El video y todas sus reproducciones se eliminarán permanentemente.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {videoTitle && (
            <p className="text-sm text-muted-foreground">
              Video: <span className="font-medium text-foreground">{videoTitle}</span>
            </p>
          )}
          <div className="space-y-2">
            <p className="text-sm">
              Para confirmar, escribe <span className="font-mono font-bold text-destructive">DELETE</span>
            </p>
            <Input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="DELETE"
              autoFocus
              className="font-mono"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={deleting}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={!canDelete || deleting}
            >
              {deleting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              Eliminar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
