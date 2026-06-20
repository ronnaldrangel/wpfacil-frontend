"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PasswordInput } from "@/components/ui/password-input"
import { Badge } from "@/components/ui/badge"
import { SiteStatusBadge } from "@/components/site-status-badge"
import { PageLoader } from "@/components/page-loader"
import { addNotification } from "@/lib/notifications"
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { api } from "@/lib/api-client"
import {
  ArrowLeft,
  ExternalLink,
  FolderOpen,
  Database,
  Trash2,
  RefreshCw,
  Square,
  Play,
  MoreVertical,
  Loader2,
  Info,
  Plus,
  Clock,
  Power,
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

const PMA_URL = process.env.NEXT_PUBLIC_PMA_URL || "https://db.wpfacil.net"
const WILDCARD = process.env.NEXT_PUBLIC_WILDCARD_DOMAIN || "wp.wpfacil.net"
const FILES_DOMAIN = process.env.NEXT_PUBLIC_FILES_DOMAIN || "data.wpfacil.net"
const SERVER_IP = process.env.NEXT_PUBLIC_SERVER_IP || "38.224.68.30"

interface SiteStats {
  id: string
  status: string
  url: string
  filesUrl: string
  storageUsed: number
  storageLimit: number
  wpAdminUser: string
  domains: any[]
  subscription: {
    plan: string
    status: string
    currentPeriodEnd: string
  } | null
}

interface Site {
  id: string
  name: string
  subdomain: string
  customDomain: string | null
  domain?: string
  plan: string
  status: string
  createdAt: string
  dbName: string
  dbUser: string
  dbPassword: string
  fbPassword?: string
  autologinSecret?: string
}

export default function SiteDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [site, setSite] = React.useState<Site | null>(null)
  const [stats, setStats] = React.useState<SiteStats | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [activeTab, setActiveTab] = React.useState("overview")
  const [addDomainOpen, setAddDomainOpen] = React.useState(false)
  const [newDomain, setNewDomain] = React.useState("")
  const [dnsGuideDomain, setDnsGuideDomain] = React.useState<string | null>(null)
  const [wpInfo, setWpInfo] = React.useState<any>(null)
  const [loadingWpInfo, setLoadingWpInfo] = React.useState(false)
  const [dbDomains, setDbDomains] = React.useState<any[]>([])
  const [fbStatus, setFbStatus] = React.useState<"active" | "stopped">("stopped")
  const [fbActiveUntil, setFbActiveUntil] = React.useState<string | null>(null)
  const [fbDuration, setFbDuration] = React.useState<number>(15)
  const [fbActivating, setFbActivating] = React.useState(false)
  const [fbDeactivating, setFbDeactivating] = React.useState(false)
  const [fbRemainingMs, setFbRemainingMs] = React.useState(0)

  async function fetchAll() {
    try {
      const [siteData, statsData, domainData] = await Promise.all([
        api.get<Site>(`/api/sites/${id}`),
        api.get<SiteStats>(`/api/sites/${id}/stats`).catch(() => null),
        api.get<any[]>(`/api/domains/data?siteId=${id}`).catch(() => []),
      ])
      setSite(siteData)
      setStats(statsData)
      setDbDomains(domainData)
    } catch {
      toast.error("Error al cargar el sitio")
      router.push("/dashboard")
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => { fetchAll(); fetchWordPressInfo() }, [id])

  React.useEffect(() => {
    fetchFilebrowserStatus()
    const interval = setInterval(fetchFilebrowserStatus, 30000)
    return () => clearInterval(interval)
  }, [id])

  async function fetchFilebrowserStatus() {
    try {
      const res = await api.get<{ status: "active" | "stopped"; activeUntil: string | null; remainingMs: number }>(`/api/sites/${id}/filebrowser/status`)
      setFbStatus(res.status)
      setFbActiveUntil(res.activeUntil)
      setFbRemainingMs(res.remainingMs)
    } catch {
      setFbStatus("stopped")
      setFbActiveUntil(null)
      setFbRemainingMs(0)
    }
  }

  React.useEffect(() => {
    if (fbStatus !== "active" || !fbActiveUntil) {
      setFbRemainingMs(0)
      return
    }
    const tick = () => {
      const remaining = new Date(fbActiveUntil).getTime() - Date.now()
      setFbRemainingMs(Math.max(remaining, 0))
      if (remaining <= 0) {
        setFbStatus("stopped")
        setFbActiveUntil(null)
      }
    }
    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [fbStatus, fbActiveUntil])

  async function fetchWordPressInfo() {
    setLoadingWpInfo(true)
    try {
      const res = await api.get<any>(`/api/sites/${id}/wp-info`)
      setWpInfo(res)
    } catch {
      setWpInfo(null)
    } finally {
      setLoadingWpInfo(false)
    }
  }

  async function handleAction(action: string) {
    try {
      const res = await api.post<{ message: string }>(`/api/sites/${id}/${action}`)
      toast.success(res.message)
      fetchAll()
    } catch {
      toast.error(`Error al ejecutar ${action}`)
    }
  }

  async function handleAddDomain() {
    if (!newDomain) return
    try {
      await api.post("/api/domains", { siteId: id, customDomain: newDomain })
      toast.success("Dominio agregado")
      setNewDomain("")
      setAddDomainOpen(false)
      fetchAll()
    } catch {
      toast.error("Error al agregar dominio")
    }
  }

  async function handleDeleteDomain(domainId: string) {
    try {
      await api.delete(`/api/domains/${domainId}?siteId=${id}`)
      toast.success("Dominio eliminado")
      fetchAll()
    } catch {
      toast.error("Error al eliminar dominio")
    }
  }

  async function handleSetPrimary(domainId: string) {
    try {
      const res = await api.put<{ message: string; host: string }>(`/api/domains/${domainId}/primary?siteId=${id}`)
      toast.success(`Dominio principal: ${res.host}`)
      fetchAll()
    } catch {
      toast.error("Error al establecer dominio principal")
    }
  }

  async function handleDelete() {
    try {
      await api.delete(`/api/sites/${id}`)
      addNotification(`Sitio "${site?.name}" eliminado`)
      toast.success("Sitio eliminado")
      router.push("/dashboard")
    } catch {
      toast.error("Error al eliminar el sitio")
    }
  }

  async function activateFilebrowser() {
    if (!site) return
    setFbActivating(true)
    try {
      const res = await api.post<{ activeUntil: string }>(
        `/api/sites/${site.id}/filebrowser/activate`,
        { durationMinutes: fbDuration },
      )
      setFbStatus("active")
      setFbActiveUntil(res.activeUntil)
      setFbRemainingMs(new Date(res.activeUntil).getTime() - Date.now())
      toast.success(`FileBrowser activo por ${formatDurationLabel(fbDuration)}`)
    } catch {
      toast.error("Error al activar FileBrowser")
    } finally {
      setFbActivating(false)
    }
  }

  async function openFileBrowser() {
    if (!site) return
    setFbActivating(true)
    try {
      const res = await api.post<{ token: string; url: string }>(
        `/api/auto-login/filebrowser/${site.id}`,
      )
      window.open(res.url, "_blank")
    } catch {
      toast.error("Error al abrir FileBrowser")
    } finally {
      setFbActivating(false)
    }
  }

  async function handleDeactivateFilebrowser() {
    if (!site) return
    setFbDeactivating(true)
    try {
      await api.post<{ message: string }>(`/api/sites/${site.id}/filebrowser/deactivate`)
      setFbStatus("stopped")
      setFbActiveUntil(null)
      setFbRemainingMs(0)
      toast.success("FileBrowser desactivado")
    } catch {
      toast.error("Error al desactivar FileBrowser")
    } finally {
      setFbDeactivating(false)
    }
  }

  function formatDurationLabel(minutes: number): string {
    if (minutes < 60) return `${minutes} min`
    if (minutes < 360) return `${Math.round(minutes / 60)} hora${minutes >= 120 ? "s" : ""}`
    return `${Math.round(minutes / 60)} horas`
  }

  function formatRemaining(ms: number): string {
    if (ms <= 0) return "0 min"
    const totalSec = Math.floor(ms / 1000)
    const h = Math.floor(totalSec / 3600)
    const m = Math.floor((totalSec % 3600) / 60)
    if (h > 0) return `${h}h ${m}m`
    return `${m}m`
  }

  async function openWpAdmin() {
    if (!site) return
    try {
      const res = await api.post<{ url: string }>(`/api/sites/${site.id}/wp-admin`)
      window.open(res.url, "_blank")
    } catch {
      window.open(`https://${domain}/wp-admin`, "_blank")
    }
  }

  if (loading) {
    return <PageLoader />
  }

  if (!site) return null

  const domain = site.domain || site.customDomain || `${site.subdomain}.${WILDCARD}`
  const isActive = site.status === "active"
  const isStopped = site.status === "stopped"
  const storagePercent = stats ? Math.round((stats.storageUsed / stats.storageLimit) * 100) : 0
  const storageMB = stats ? Math.round(stats.storageUsed / 1024 / 1024) : 0
  const storageLimitMB = stats ? Math.round(stats.storageLimit / 1024 / 1024) : 5120
  const storageAvailableMB = Math.max(storageLimitMB - storageMB, 0)

  function formatDate(dateString?: string) {
    if (!dateString) return "—"
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  function formatRelativeTime(dateString?: string) {
    if (!dateString) return "—"
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    if (diffHours < 1) return "hace menos de 1 hora"
    if (diffHours === 1) return "hace 1 hora"
    if (diffHours < 24) return `hace ${diffHours} horas`
    const diffDays = Math.floor(diffHours / 24)
    if (diffDays === 1) return "hace 1 día"
    return `hace ${diffDays} días`
  }

  function InfoRow({
    label,
    value,
    action,
    actionLabel = "Change",
  }: {
    label: string
    value: React.ReactNode
    action?: () => void
    actionLabel?: string
  }) {
    return (
      <div className="flex items-center justify-between border-b py-3 last:border-0">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">{value}</span>
          {action && (
            <button
              onClick={action}
              className="text-sm font-medium text-primary hover:underline"
            >
              {actionLabel}
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => router.push("/dashboard")}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Volver
      </Button>

      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-primary text-2xl font-bold text-primary-foreground">
                {site.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 space-y-1">
                <a
                  href={`https://${domain}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-semibold text-primary hover:underline"
                >
                  {domain}
                  <ExternalLink className="ml-0.5 inline h-3 w-3" />
                </a>
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  {site.name}
                </h1>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                onClick={() => handleAction("redeploy")}
                disabled={!isActive}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Redeploy
              </Button>
              {isStopped ? (
                <Button onClick={() => handleAction("start")}>
                  <Play className="mr-2 h-4 w-4" />
                  Iniciar
                </Button>
              ) : (
                <Button variant="outline" onClick={() => handleAction("stop")} disabled={!isActive}>
                  <Square className="mr-2 h-4 w-4" />
                  Stop
                </Button>
              )}
              <Button variant="outline" onClick={openWpAdmin}>
                <ExternalLink className="mr-2 h-4 w-4" />
                WP Admin
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => window.open(`https://${domain}/wp-login.php?action=lostpassword`, "_blank")}>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Reset WordPress password
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <DropdownMenuItem
                        onSelect={(e) => e.preventDefault()}
                        className="text-red-500"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar sitio
                      </DropdownMenuItem>
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
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="h-auto w-full overflow-x-auto flex-nowrap justify-start scrollbar-none">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="wordpress">WordPress</TabsTrigger>
          <TabsTrigger value="dominio">Dominio</TabsTrigger>
          <TabsTrigger value="files">File & Database</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <p className="text-sm font-medium">WordPress version</p>
                  <p className="text-4xl font-bold">
                    {loadingWpInfo ? "—" : wpInfo?.wordpressVersion || "No disponible"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {wpInfo?.wordpressVersion ? "Instalado" : loadingWpInfo ? "Verificando..." : "Sin instalar"}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Storage</p>
                    <p className="text-sm text-muted-foreground">
                      {storageAvailableMB} MB available
                    </p>
                  </div>
                  <Progress value={Math.min(storagePercent, 100)} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    {storageMB} MB used of {storageLimitMB} MB
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Website</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <InfoRow label="Title" value={site.name} />
              <InfoRow
                label="Domain"
                value={<a href={`https://${domain}`} target="_blank" rel="noopener noreferrer" className="hover:underline">{domain}</a>}
                action={() => setActiveTab("dominio")}
              />
              <InfoRow
                label="Status"
                value={<SiteStatusBadge status={site.status as any} />}
              />
              {site.autologinSecret && (
                <InfoRow
                  label="Auto-login Token"
                  value={
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(site.autologinSecret || "")
                        toast.success("Token copiado")
                      }}
                      className="font-mono text-xs text-muted-foreground hover:text-primary hover:underline max-w-[200px] truncate inline-block"
                      title={site.autologinSecret}
                    >
                      {site.autologinSecret?.substring(0, 16)}...
                    </button>
                  }
                />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Subscription</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <InfoRow
                label="Plan"
                value={<span className="capitalize">{stats?.subscription?.plan || site.plan}</span>}
              />
              <InfoRow label="Billing" value="Monthly" />
              <InfoRow
                label="Next Payment"
                value={formatDate(stats?.subscription?.currentPeriodEnd)}
                action={() => router.push("/billing")}
                actionLabel="Manage"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="wordpress" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Estado de WordPress</CardTitle>
              <CardDescription>Información de actualizaciones y versión</CardDescription>
            </CardHeader>
            <CardContent className="space-y-1">
              {loadingWpInfo ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : !wpInfo ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  No se pudo obtener la información de WordPress.
                </div>
              ) : (
                <>
                  <InfoRow
                    label="Automatic updates"
                    value={wpInfo.automaticUpdates ? "Activated" : "Deactivated"}
                  />
                  <InfoRow
                    label="Last update"
                    value={formatRelativeTime(wpInfo.lastUpdate)}
                  />
                  <InfoRow
                    label="WordPress version"
                    value={wpInfo.wordpressVersion || "—"}
                  />
                  <InfoRow
                    label="Plugins"
                    value={
                      wpInfo.plugins?.updates
                        ? `${wpInfo.plugins.updates} updates available`
                        : "No updates"
                    }
                  />
                  <InfoRow
                    label="Theme"
                    value={
                      wpInfo.themes?.updates
                        ? `${wpInfo.themes.updates} updates available`
                        : "No updates"
                    }
                  />
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dominio" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>Dominios configurados</CardTitle>
                <CardDescription>Dominios gestionados por Dokploy para este sitio</CardDescription>
              </div>
              <Dialog open={addDomainOpen} onOpenChange={setAddDomainOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Agregar dominio
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Agregar nuevo dominio</DialogTitle>
                    <DialogDescription>
                      Ingresa el dominio que quieres conectar a este sitio.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="new-domain">Dominio</Label>
                      <Input
                        id="new-domain"
                        placeholder="ejemplo.com"
                        value={newDomain}
                        onChange={(e) => setNewDomain(e.target.value)}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setAddDomainOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleAddDomain} disabled={!newDomain}>
                      Agregar
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (stats?.domains || []).filter((d: any) => d.serviceName === "wordpress").length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  No hay dominios de WordPress configurados en Dokploy.
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {(stats?.domains || [])
                    .filter((d: any) => d.serviceName === "wordpress")
                    .map((d: any) => {
                      const isOriginalDomain = d.host === `${site.subdomain}.${WILDCARD}`
                      const dbDomain = dbDomains.find((dd: any) => dd.host === d.host)
                      const isPrimary = dbDomain?.isPrimary
                      return (
                        <Card key={d.domainId || d.id || d.host}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0 space-y-1">
                                <div className="flex items-center gap-2">
                                  <a href={`https://${d.host}`} target="_blank" rel="noopener noreferrer" className="truncate font-semibold hover:underline">{d.host}</a>
                                  {isOriginalDomain && (
                                    <Badge variant="outline" className="text-xs">Wildcard</Badge>
                                  )}
                                  {isPrimary && (
                                    <Badge className="bg-green-600 text-xs">Principal</Badge>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  Certificado: {d.certificateType || "—"}
                                </p>
                                <Badge variant={d.https ? "default" : "secondary"}>
                                  {d.https ? "HTTPS" : "HTTP"}
                                </Badge>
                              </div>
                              <div className="flex shrink-0 gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setDnsGuideDomain(d.host)}
                                >
                                  <Info className="h-4 w-4" />
                                </Button>
                                {!isOriginalDomain && !isPrimary && dbDomain && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleSetPrimary(dbDomain.id)}
                                  >
                                    Establecer como principal
                                  </Button>
                                )}
                                {!isOriginalDomain && (
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button variant="ghost" size="icon" className="text-red-500">
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Eliminar dominio</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          ¿Estás seguro de eliminar el dominio {d.host}? Esta acción no se puede deshacer.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                        <AlertDialogAction
                                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                          onClick={() => handleDeleteDomain(d.domainId || d.id)}
                                        >
                                          Eliminar
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                </div>
              )}
            </CardContent>
          </Card>

          <Dialog open={!!dnsGuideDomain} onOpenChange={(open) => !open && setDnsGuideDomain(null)}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Guía de configuración DNS</DialogTitle>
                <DialogDescription>
                  Sigue estos pasos para configurar los registros DNS de {dnsGuideDomain}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 text-sm">
                <p className="text-muted-foreground">
                  Para que tu dominio sea accesible, debes configurar los registros DNS con tu proveedor de dominio (por ejemplo, Cloudflare, GoDaddy, NameCheap).
                </p>
                <div>
                  <p className="font-semibold">1. Añade un registro A</p>
                  <p className="text-muted-foreground">
                    Crea un registro A que apunte tu dominio a la dirección IP del servidor:
                  </p>
                  <div className="mt-2 rounded-md bg-muted p-3 font-mono text-xs">
                    Tipo: A<br />
                    Nombre: @ o {dnsGuideDomain ? dnsGuideDomain.split(".")[0] : "@"}<br />
                    Valor: {SERVER_IP}
                  </div>
                </div>
                <div>
                  <p className="font-semibold">2. Verifica la configuración</p>
                  <p className="text-muted-foreground">
                    Después de configurar los registros DNS:
                  </p>
                  <ul className="mt-1 list-disc space-y-1 pl-5 text-muted-foreground">
                    <li>Espera la propagación DNS (normalmente 15-30 minutos)</li>
                    <li>
                      Prueba tu dominio visitando:{" "}
                      <a
                        href={`https://${dnsGuideDomain}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        https://{dnsGuideDomain}/
                      </a>
                    </li>
                    <li>Usa una herramienta de consulta DNS para verificar tus registros</li>
                  </ul>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={() => setDnsGuideDomain(null)}>Cerrar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="files" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>FileBrowser</CardTitle>
              <CardDescription>Acceso a los archivos del sitio</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {fbStatus === "stopped" ? (
                <>
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Duración de la sesión</Label>
                      <div className="flex gap-2">
                        {[
                          { value: 15, label: "15 min" },
                          { value: 60, label: "1 hora" },
                          { value: 360, label: "6 horas" },
                        ].map((opt) => (
                          <Button
                            key={opt.value}
                            variant={fbDuration === opt.value ? "default" : "outline"}
                            size="sm"
                            disabled={fbActivating || !isActive}
                            onClick={() => setFbDuration(opt.value)}
                          >
                            {opt.label}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    FileBrowser se detiene automáticamente al expirar el tiempo seleccionado para ahorrar recursos.
                  </p>
                  <Button onClick={activateFilebrowser} disabled={fbActivating || !isActive}>
                    {fbActivating ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <FolderOpen className="mr-2 h-4 w-4" />
                    )}
                    {fbActivating ? "Activando..." : "Activar"}
                  </Button>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 rounded-md bg-muted px-3 py-2 text-sm">
                    <Clock className="h-4 w-4 text-primary" />
                    <span className="font-medium">FileBrowser activo</span>
                    <span className="text-muted-foreground">· expira en {formatRemaining(fbRemainingMs)}</span>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Button onClick={openFileBrowser} disabled={fbActivating}>
                      {fbActivating ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <FolderOpen className="mr-2 h-4 w-4" />
                      )}
                      Abrir FileBrowser
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleDeactivateFilebrowser}
                      disabled={fbDeactivating}
                      className="text-red-500 hover:text-red-600"
                    >
                      {fbDeactivating ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Power className="mr-2 h-4 w-4" />
                      )}
                      Desactivar
                    </Button>
                  </div>
                  <div className="divide-y border-t pt-2">
                    <div className="flex items-center justify-between py-3">
                      <Label className="text-xs text-muted-foreground">URL</Label>
                      <a href={`https://${site.subdomain}.${FILES_DOMAIN}`} target="_blank" rel="noopener noreferrer" className="font-mono text-sm hover:underline">https://{site.subdomain}.{FILES_DOMAIN}</a>
                    </div>
                    <div className="flex items-center justify-between py-3">
                      <Label className="text-xs text-muted-foreground">Usuario</Label>
                      <p className="font-mono text-sm">admin</p>
                    </div>
                    <div className="space-y-2 py-3">
                      <Label className="text-xs text-muted-foreground">Contraseña</Label>
                      <PasswordInput value={site.fbPassword || "—"} readOnly showToggle className="font-mono text-sm" />
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Base de Datos</CardTitle>
              <CardDescription>Usa estas credenciales en phpMyAdmin</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" onClick={() => window.open(PMA_URL, "_blank")}>
                <Database className="mr-2 h-4 w-4" />
                Abrir phpMyAdmin
              </Button>
              <div className="divide-y border-t pt-2">
                <div className="flex items-center justify-between py-3">
                  <Label className="text-xs text-muted-foreground">Servidor</Label>
                  <a href={PMA_URL} target="_blank" rel="noopener noreferrer" className="font-mono text-sm hover:underline">{PMA_URL.replace(/^https?:\/\//, "")}</a>
                </div>
                <div className="flex items-center justify-between py-3">
                  <Label className="text-xs text-muted-foreground">Base de datos</Label>
                  <p className="font-mono text-sm">{site.dbName}</p>
                </div>
                <div className="flex items-center justify-between py-3">
                  <Label className="text-xs text-muted-foreground">Usuario</Label>
                  <p className="font-mono text-sm">{site.dbUser}</p>
                </div>
                <div className="space-y-2 py-3">
                  <Label className="text-xs text-muted-foreground">Contraseña</Label>
                  <PasswordInput value={site.dbPassword} readOnly showToggle className="font-mono text-sm" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
