"use client"

import * as React from "react"
import { AdminDataTable } from "@/components/admin-data-table"
import { Button } from "@/components/ui/button"
import { SiteStatusBadge } from "@/components/site-status-badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Trash2, RefreshCw, Loader2, ExternalLink } from "lucide-react"
import { api } from "@/lib/api-client"
import { toast } from "sonner"

function DeleteSiteDialog({ siteName, onDelete }: { siteName: string; onDelete: () => Promise<void> }) {
  const [deleting, setDeleting] = React.useState(false)

  async function handleDelete() {
    setDeleting(true)
    await onDelete()
    setDeleting(false)
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Eliminar Sitio</AlertDialogTitle>
          <AlertDialogDescription>
            ¿Estás seguro de eliminar {siteName}? Esta acción no se puede deshacer y eliminará todos los datos.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={handleDelete} disabled={deleting}>
            {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

function RedeployDialog({ siteName, siteId }: { siteName: string; siteId: string }) {
  const [loading, setLoading] = React.useState(false)
  const [open, setOpen] = React.useState(false)

  async function handleRedeploy() {
    setLoading(true)
    try {
      await api.post(`/api/admin/sites/${siteId}/redeploy`)
      toast.success("Re-despliegue iniciado")
      setOpen(false)
    } catch (err: any) {
      toast.error(err?.message || "Error al re-desplegar")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Redeploy Sitio</DialogTitle>
          <DialogDescription>
            ¿Re-desplegar {siteName}? Esto reiniciará el sitio con la configuración actual.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={handleRedeploy} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Redeploy
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function AdminSitesPage() {
  const [loading, setLoading] = React.useState(true)
  const [sites, setSites] = React.useState<any[]>([])

  async function fetchSites() {
    try {
      const res = await api.get<any>("/api/admin/sites?page=1&limit=100")
      setSites(res.sites)
    } catch {
      toast.error("Error al cargar sitios")
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => { fetchSites() }, [])

  const wildcard = process.env.NEXT_PUBLIC_WILDCARD_DOMAIN || "wp.wpfacil.net"

  const columns = [
    { key: "name", label: "Nombre" },
    {
      key: "user",
      label: "Usuario",
      render: (v: unknown) => (v as any)?.name || "—",
    },
    {
      key: "subdomain",
      label: "Dominio",
      render: (v: unknown, row: Record<string, unknown>) => (
        <a
          href={`https://${(row.customDomain as string) || `${v}.${wildcard}`}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
        >
          {(row.customDomain as string) || `${v}.${wildcard}`}
          <ExternalLink className="h-3 w-3" />
        </a>
      ),
    },
    { key: "plan", label: "Plan", render: (v: unknown) => String(v).charAt(0).toUpperCase() + String(v).slice(1) },
    {
      key: "status",
      label: "Estado",
      render: (v: unknown) => <SiteStatusBadge status={v as any} />,
    },
    {
      key: "createdAt",
      label: "Creado",
      render: (v: unknown) =>
        new Date(v as string).toLocaleDateString("es-ES", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
    },
    {
      key: "actions",
      label: "Acciones",
      render: (_: unknown, row: Record<string, unknown>) => (
        <div className="flex items-center gap-1">
          <DeleteSiteDialog
            siteName={row.name as string}
            onDelete={async () => {
              try {
                await api.delete(`/api/admin/sites/${row.id}`)
                setSites(sites.filter((s) => s.id !== row.id))
                toast.success("Sitio eliminado")
              } catch (err: any) {
                toast.error(err?.message || "Error al eliminar")
              }
            }}
          />
          <RedeployDialog siteName={row.name as string} siteId={row.id as string} />
        </div>
      ),
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Sitios</h1>
        <p className="text-sm text-muted-foreground">Gestiona todos los sitios de la plataforma</p>
      </div>
      <AdminDataTable columns={columns} data={sites as unknown as Record<string, unknown>[]} searchKey="name" />
    </div>
  )
}
