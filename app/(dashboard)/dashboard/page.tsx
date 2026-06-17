"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { SiteCard } from "@/components/site-card"
import { PageHeader } from "@/components/page-header"
import { PageLoader } from "@/components/page-loader"
import { addNotification } from "@/lib/notifications"
import { Plus, Globe } from "lucide-react"
import { api } from "@/lib/api-client"
import { toast } from "sonner"

interface Site {
  id: string
  name: string
  subdomain: string
  domain?: string
  plan: string
  status: "provisioning" | "deploying" | "active" | "stopped" | "error"
  createdAt: string
}

export default function DashboardPage() {
  return (
    <React.Suspense fallback={<PageLoader />}>
      <DashboardContent />
    </React.Suspense>
  )
}

function DashboardContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [sites, setSites] = React.useState<Site[]>([])
  const [loading, setLoading] = React.useState(true)

  function handleDeleteSite(id: string) {
    setSites((prev) => prev.filter((s) => s.id !== id))
  }

  async function fetchSites() {
    try {
      const data = await api.get<Site[]>("/api/sites")
      setSites(Array.isArray(data) ? data : [])
    } catch {
      setSites([])
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    fetchSites()
  }, [])

  React.useEffect(() => {
    const sessionId = searchParams.get("session_id")
    if (!sessionId) return
    const name = sessionStorage.getItem("wpfacil_create_name")
    const subdomain = sessionStorage.getItem("wpfacil_create_subdomain")
    const plan = sessionStorage.getItem("wpfacil_create_plan")
    if (!name || !subdomain || !plan) return

    api.get<{ paid: boolean }>(`/api/stripe/session/${sessionId}`).then(async (session) => {
      if (!session.paid) {
        toast.error("El pago no fue completado")
        return
      }
      const site = await api.post<{ id: string }>("/api/sites", { name, subdomain, plan })
      try {
        await api.post("/api/stripe/attach-subscription", { sessionId, siteId: site.id })
      } catch (err: any) {
        toast.error(err?.message || "Error al vincular la suscripción")
      }
      sessionStorage.removeItem("wpfacil_create_name")
      sessionStorage.removeItem("wpfacil_create_subdomain")
      sessionStorage.removeItem("wpfacil_create_plan")
      addNotification(`Sitio "${name}" creado exitosamente`)
      toast.success("Sitio creado. Desplegando...")
      router.replace("/dashboard")
      fetchSites()
    }).catch(() => {
      toast.error("Error al verificar el pago")
    })
  }, [searchParams])

  const hasDeploying = sites.some((s) => s.status === "deploying" || s.status === "provisioning")

  React.useEffect(() => {
    if (!hasDeploying) return
    const interval = setInterval(fetchSites, 5000)
    return () => clearInterval(interval)
  }, [hasDeploying])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <PageHeader title="Mis Sitios" />
          <Link href="/create">
            <Button className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Sitio
            </Button>
          </Link>
        </div>
        <PageLoader />
      </div>
    )
  }

  if (sites.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
          <Globe className="h-10 w-10 text-muted-foreground" />
        </div>
        <h2 className="mt-6 text-xl font-semibold">No tienes sitios aún</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Crea tu primer sitio WordPress en segundos
        </p>
        <Link href="/create" className="mt-6">
          <Button size="lg">
            <Plus className="mr-2 h-5 w-5" />
            Crea tu primer sitio
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader title="Mis Sitios" />
        <Link href="/create">
          <Button className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Sitio
          </Button>
        </Link>
      </div>
      <div className="flex flex-col gap-4">
        {sites.map((site) => (
          <SiteCard key={site.id} site={site} onDelete={handleDeleteSite} />
        ))}
      </div>
    </div>
  )
}
