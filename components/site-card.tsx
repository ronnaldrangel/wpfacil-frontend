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
import { ExternalLink, Settings, Trash2, MoreVertical, ArrowUpRight } from "lucide-react"
import Link from "next/link"
import { api } from "@/lib/api-client"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
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
  status: "provisioning" | "deploying" | "active" | "stopped" | "error"
  createdAt: string
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
      const notifs = JSON.parse(localStorage.getItem("wpfacil_notifications") || "[]")
      notifs.unshift({ id: Date.now(), text: `Sitio "${site.name}" eliminado`, time: new Date().toISOString() })
      localStorage.setItem("wpfacil_notifications", JSON.stringify(notifs.slice(0, 20)))
      toast.success("Sitio eliminado")
      if (onDelete) onDelete(site.id)
      router.refresh()
    } catch {
      toast.error("Error al eliminar el sitio")
    }
  }

  const domain = site.domain || `${site.subdomain}.${WILDCARD}`
  const isDeploying = site.status === "deploying" || site.status === "provisioning"

  return (
    <Card className="w-full overflow-hidden transition-all hover:shadow-md">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-24 w-32 shrink-0 items-center justify-center rounded-md bg-muted text-2xl font-bold text-muted-foreground">
              {site.name.charAt(0).toUpperCase()}
            </div>
            <div className="space-y-0">
              <a
                href={`https://${domain}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-base font-semibold text-primary hover:underline"
              >
                {domain}
                <ArrowUpRight className="ml-0.5 inline h-3 w-3" />
              </a>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-2xl">{site.name}</h3>
                <span className="inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium text-muted-foreground capitalize">
                  {site.plan}
                </span>
              </div>
              <SiteStatusBadge status={site.status} />
            </div>
          </div>
          <div className="flex items-center gap-1 pt-1">
            {isDeploying ? (
              <Button variant="outline" size="sm" disabled>
                <Settings className="mr-1 h-3.5 w-3.5" />
                Gestionar
              </Button>
            ) : (
              <Link href={`/dashboard/${site.id}`}>
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
              <a
                href={`https://${domain}/wp-admin`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" size="sm">
                  <ExternalLink className="mr-1 h-3.5 w-3.5" />
                  WP Admin
                </Button>
              </a>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => { }}>Editar</DropdownMenuItem>
                <DropdownMenuSeparator />
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-500">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Eliminar
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
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
