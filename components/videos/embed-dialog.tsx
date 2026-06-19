"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Code2, Copy, Check } from "lucide-react"

interface EmbedDialogProps {
  embedId: string
  children?: React.ReactNode
}

const SIZES: Record<string, { w: number; h: number; label: string }> = {
  "16:9": { w: 1280, h: 720, label: "16:9 (1280×720)" },
  "4:3": { w: 1024, h: 768, label: "4:3 (1024×768)" },
  "1:1": { w: 720, h: 720, label: "1:1 (720×720)" },
  "9:16": { w: 405, h: 720, label: "9:16 vertical (405×720)" },
}

export function EmbedDialog({ embedId, children }: EmbedDialogProps) {
  const [open, setOpen] = React.useState(false)
  const [size, setSize] = React.useState("16:9")
  const [copied, setCopied] = React.useState(false)

  const embedUrl = typeof window !== "undefined" ? `${window.location.origin}/embed/${embedId}` : `/embed/${embedId}`
  const { w, h } = SIZES[size]
  const code = `<iframe src="${embedUrl}" width="${w}" height="${h}" frameborder="0" allowfullscreen allow="autoplay; fullscreen; picture-in-picture"></iframe>`

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      toast.success("Código copiado")
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("No se pudo copiar")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button>
            <Code2 className="mr-2 h-4 w-4" />
            Embed
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Código de embed</DialogTitle>
          <DialogDescription>Copia este código para embeber el video en cualquier sitio</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Tamaño</Label>
            <Select value={size} onValueChange={setSize}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(SIZES).map(([key, val]) => (
                  <SelectItem key={key} value={key}>{val.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Código HTML</Label>
            <textarea
              readOnly
              value={code}
              rows={5}
              onFocus={(e) => e.target.select()}
              className="flex w-full rounded-md border border-input bg-muted/50 px-3 py-2 font-mono text-xs ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
            />
            <Button onClick={copyCode} className="w-full">
              {copied ? <Check className="mr-2 h-4 w-4 text-green-500" /> : <Copy className="mr-2 h-4 w-4" />}
              Copiar código
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
