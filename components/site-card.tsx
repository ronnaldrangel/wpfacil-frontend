"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
import { SiteStatusBadge } from "@/components/site-status-badge"
import { ExternalLink, Settings, Trash2, MoreVertical, ArrowUpRight, AlertTriangle, Clock } from "lucide-react"
import Link from "next/link"
import { api } from "@/lib/api-client"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { addNotification } from "@/lib/notifications"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const WILDCARD = process.env.NEXT_PUBLIC_WILDCARD_DOMAIN || "wp.wpfacil.net"

interface Site {
  id: string
  name: string
  subdomain: string
  domain?: string
  plan: string
  status: "provisioning" | "deploying" | "active" | "stopped" | "error" | "suspended"
  createdAt: string
  subscription?: {
    status: string
    daysUntilPayment: number | null
    daysUntilDeletion: number | null
  } | null
}

interface SiteCardProps {
  site: Site
  onDelete?: (id: string) => void
}

export function SiteCard({ site, onDelete }: SiteCardProps) {
  const router = useRouter()

  async function handleDelete() {
    try {
      await api.delete(`/api/sites/${site.id}`)
      addNotification(`Sitio "${site.name}" eliminado`)
      toast.success("Sitio eliminado")
      if (onDelete) onDelete(site.id)
      router.refresh()
    } catch {
      toast.error("Error al eliminar el sitio")
    }
  }

  async function openWpAdmin() {
    try {
      const res = await api.post<{ url: string }>(`/api/sites/${site.id}/wp-admin`)
      window.open(res.url, "_blank")
    } catch {
      window.open(`https://${domain}/wp-admin`, "_blank")
    }
  }

  const domain = site.domain || `${site.subdomain}.${WILDCARD}`
  const isDeploying = site.status === "deploying" || site.status === "provisioning"

  function ActionsMenu({ variant = "desktop" }: { variant?: "mobile" | "desktop" }) {
    const isMobile = variant === "mobile"
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          {isMobile ? (
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          ) : (
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => window.open(`https://${domain}/wp-login.php?action=lostpassword`, "_blank")}>
            <ExternalLink className="mr-2 h-4 w-4" />
            Reset WordPress password
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-500">
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar sitio
              </DropdownMenuItem>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Eliminar sitio</AlertDialogTitle>
                <AlertDialogDescription>
                  ¿Estás seguro? Se eliminarán el sitio, la base de datos, los archivos y el dominio.
                  Esta acción no se puede deshacer.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
                  Eliminar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <Card className="w-full overflow-hidden transition-all hover:shadow-md">
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-md bg-muted text-xl font-bold text-muted-foreground sm:flex sm:h-14 sm:w-14">
              {site.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <a
                href={`https://${domain}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-semibold text-primary hover:underline"
              >
                {domain}
                <ArrowUpRight className="ml-0.5 inline h-3 w-3" />
              </a>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-xl font-semibold sm:text-2xl">{site.name}</h3>
                <span className="inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium text-muted-foreground capitalize">
                  {site.plan}
                </span>
                <div className="ml-auto flex items-center gap-1 sm:hidden">
                  {isDeploying ? (
                    <Button variant="outline" size="icon" disabled>
                      <Settings className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Link href={`/dashboard/${site.id}`} className="contents">
                      <Button variant="outline" size="icon">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </Link>
                  )}
                  {isDeploying ? (
                    <Button variant="outline" size="icon" disabled>
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button variant="outline" size="icon" onClick={openWpAdmin}>
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  )}
                  <ActionsMenu variant="mobile" />
                </div>
              </div>
              <SiteStatusBadge status={site.status} />
              {site.subscription?.status === "grace" && site.subscription.daysUntilDeletion != null && (
                <div className="flex items-center gap-1.5 text-xs font-medium text-red-600">
                  <AlertTriangle className="size-3.5" />
                  Pago vencido. Se eliminará en {site.subscription.daysUntilDeletion} días.
                </div>
              )}
              {site.subscription?.status === "active" && site.subscription.daysUntilPayment != null && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="size-3.5" />
                  Próximo pago en {site.subscription.daysUntilPayment} días
                </div>
              )}
            </div>
          </div>

          <div className="hidden sm:flex sm:w-auto sm:items-center sm:gap-1">
            {isDeploying ? (
              <Button variant="outline" size="sm" disabled>
                <Settings className="mr-1 h-3.5 w-3.5" />
                Gestionar
              </Button>
            ) : (
              <Link href={`/dashboard/${site.id}`} className="contents">
                <Button variant="outline" size="sm">
                  <Settings className="mr-1 h-3.5 w-3.5" />
                  Gestionar
                </Button>
              </Link>
            )}
            {isDeploying ? (
              <Button variant="outline" size="sm" disabled>
                <ExternalLink className="mr-1 h-3.5 w-3.5" />
                WP Admin
              </Button>
            ) : (
              <Button variant="outline" size="sm" onClick={openWpAdmin}>
                <ExternalLink className="mr-1 h-3.5 w-3.5" />
                WP Admin
              </Button>
            )}
            <ActionsMenu variant="desktop" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
