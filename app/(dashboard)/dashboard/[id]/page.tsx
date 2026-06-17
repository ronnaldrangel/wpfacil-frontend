"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PasswordInput } from "@/components/ui/password-input"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
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
import { api } from "@/lib/api-client"
import {
  Globe, ExternalLink, FolderOpen, Database, Trash2, ArrowLeft, Loader2,
  RotateCw, RefreshCw, Square,
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

const PMA_URL = process.env.NEXT_PUBLIC_PMA_URL || "https://db.wpfacil.net"
const WILDCARD = process.env.NEXT_PUBLIC_WILDCARD_DOMAIN || "wp.wpfacil.net"
const FILES_DOMAIN = process.env.NEXT_PUBLIC_FILES_DOMAIN || "data.wpfacil.net"

interface SiteStats {
  id: string
  status: string
  url: string
  filesUrl: string
  storageUsed: number
  storageLimit: number
  wpAdminUser: string
}

interface Site {
  id: string
  name: string
  subdomain: string
  customDomain: string | null
  plan: string
  status: string
  createdAt: string
  dbName: string
  dbUser: string
  dbPassword: string
  fbPassword?: string
}

export default function SiteDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [site, setSite] = React.useState<Site | null>(null)
  const [stats, setStats] = React.useState<SiteStats | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [customDomain, setCustomDomain] = React.useState("")

  async function fetchAll() {
    try {
      const [siteData, statsData] = await Promise.all([
        api.get<Site>(`/api/sites/${id}`),
        api.get<SiteStats>(`/api/sites/${id}/stats`).catch(() => null),
      ])
      setSite(siteData)
      setStats(statsData)
      if (siteData.customDomain) setCustomDomain(siteData.customDomain)
    } catch {
      toast.error("Error al cargar el sitio")
      router.push("/dashboard")
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => { fetchAll() }, [id])

  async function handleAction(action: string) {
    try {
      const res = await api.post<{ message: string }>(`/api/sites/${id}/${action}`)
      toast.success(res.message)
      fetchAll()
    } catch {
      toast.error(`Error al ejecutar ${action}`)
    }
  }

  async function handleConnectDomain() {
    if (!customDomain) return
    try {
      await api.patch(`/api/sites/${id}`, { customDomain })
      toast.success("Dominio conectado exitosamente")
    } catch {
      toast.error("Error al conectar el dominio")
    }
  }

  async function handleDelete() {
    try {
      await api.delete(`/api/sites/${id}`)
      toast.success("Sitio eliminado")
      router.push("/dashboard")
    } catch {
      toast.error("Error al eliminar el sitio")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!site) return null

  const domain = site.customDomain || `${site.subdomain}.${WILDCARD}`
  const isActive = site.status === "active"
  const storagePercent = stats ? Math.round((stats.storageUsed / stats.storageLimit) * 100) : 0
  const storageMB = stats ? Math.round(stats.storageUsed / 1024 / 1024) : 0
  const storageLimitMB = stats ? Math.round(stats.storageLimit / 1024 / 1024) : 5120

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">{site.name}</h1>
          <p className="text-sm text-muted-foreground">{domain}</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Badge variant="outline" className="capitalize">{site.plan}</Badge>
          <SiteStatusBadge status={site.status as any} />
        </div>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Almacenamiento</span>
            <span className="text-sm font-medium">{storageMB} MB / {storageLimitMB} MB</span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${Math.min(storagePercent, 100)}%` }}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Button onClick={() => handleAction("redeploy")} disabled={site.status === "deploying" || site.status === "provisioning"}>
          <RotateCw className="mr-2 h-4 w-4" />
          Redeploy
        </Button>
        <Button variant="secondary" onClick={() => handleAction("reload")} disabled={!isActive}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Reload
        </Button>
        <Button variant="outline" onClick={() => handleAction("stop")} disabled={!isActive}>
          <Square className="mr-2 h-4 w-4" />
          Stop
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Accesos</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <a href={`https://${domain}/wp-admin`} target="_blank" rel="noopener noreferrer">
            <Button><ExternalLink className="mr-2 h-4 w-4" />WP Admin</Button>
          </a>
          <a href={`https://${domain}`} target="_blank" rel="noopener noreferrer">
            <Button variant="outline"><Globe className="mr-2 h-4 w-4" />Ver Sitio</Button>
          </a>
          <Button variant="outline" onClick={async () => {
            try {
              const res = await api.post<{ token: string; url: string }>(`/api/auto-login/filebrowser/${site.id}`);
              window.open(res.url, "_blank");
            } catch {
              window.open(`https://${site.subdomain}.${FILES_DOMAIN}`, "_blank");
            }
          }}>
            <FolderOpen className="mr-2 h-4 w-4" />FileBrowser
          </Button>
          <a href={PMA_URL} target="_blank" rel="noopener noreferrer">
            <Button variant="outline"><Database className="mr-2 h-4 w-4" />phpMyAdmin</Button>
          </a>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Base de Datos</CardTitle>
          <CardDescription>Usa estas credenciales en phpMyAdmin</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Servidor</Label>
            <p className="font-mono text-sm">38.224.68.30:5121</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Base de datos</Label>
            <p className="font-mono text-sm">{site.dbName}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Usuario</Label>
            <p className="font-mono text-sm">{site.dbUser}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Contraseña</Label>
            <PasswordInput value={site.dbPassword} readOnly showToggle className="font-mono text-sm" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>FileBrowser</CardTitle>
          <CardDescription>Acceso a los archivos del sitio</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">URL</Label>
            <p className="font-mono text-sm">https://{site.subdomain}.{FILES_DOMAIN}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Usuario</Label>
            <p className="font-mono text-sm">admin</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Contraseña</Label>
            <PasswordInput value={site.fbPassword || "—"} readOnly showToggle className="font-mono text-sm" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Dominio Personalizado</CardTitle>
          <CardDescription>Conecta tu propio dominio a este sitio</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <div className="flex-1">
              <Label htmlFor="domain">Tu dominio</Label>
              <Input
                id="domain"
                placeholder="ejemplo.com"
                value={customDomain}
                onChange={(e) => setCustomDomain(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleConnectDomain}>Conectar</Button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Configura un registro CNAME apuntando a {domain}
          </p>
        </CardContent>
      </Card>

      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Zona de Peligro</CardTitle>
          <CardDescription>Eliminar este sitio es una acción irreversible</CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar Sitio
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción eliminará permanentemente el sitio {site.name} y todos sus datos.
                  No se puede deshacer.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={handleDelete}
                >
                  Eliminar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  )
}
