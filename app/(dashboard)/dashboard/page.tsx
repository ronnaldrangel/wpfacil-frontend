"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { SiteCard } from "@/components/site-card"
import { PageHeader } from "@/components/page-header"
import { PageLoader } from "@/components/page-loader"
import { addNotification } from "@/lib/notifications"
import { Plus, Globe, ChevronDown, Package } from "lucide-react"
import { cn } from "@/lib/utils"
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

function AvailableSlotsAccordion({ slots }: { slots: any[] }) {
  const [open, setOpen] = React.useState(true)
  const count = slots.length
  return (
    <Card className="border-primary bg-primary/5">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-4 p-4 text-left"
      >
        <p className="text-sm font-medium">
          Tienes {count} sitio web disponible{count > 1 ? "s" : ""} para configurar.
        </p>
        <ChevronDown className={cn("h-4 w-4 shrink-0 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <CardContent className="space-y-3 border-t pt-4">
          {slots.map((slot) => {
            const storageLabel = slot.maxStorage >= 1024
              ? `${(slot.maxStorage / 1024).toFixed(0)} GB`
              : `${slot.maxStorage} MB`
            return (
              <div
                key={slot.id}
                className="flex flex-col gap-3 rounded-lg border bg-background p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
                    <Package className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">{slot.planName}</p>
                    <p className="text-xs text-muted-foreground">
                      ${Number(slot.planPrice).toFixed(2)}/mes · {storageLabel}
                    </p>
                  </div>
                </div>
                <Button asChild>
                  <Link href={`/create?slotId=${slot.id}&plan=${slot.plan}`}>Configurar</Link>
                </Button>
              </div>
            )
          })}
        </CardContent>
      )}
    </Card>
  )
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
  const [processingPayment, setProcessingPayment] = React.useState(false)
  const [availableSlots, setAvailableSlots] = React.useState<any[]>([])
  const processedRef = React.useRef(false)

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

  async function fetchAvailableSlots() {
    try {
      const data = await api.get<any[]>("/api/subscriptions/available-slots")
      setAvailableSlots(Array.isArray(data) ? data : [])
    } catch {
      setAvailableSlots([])
    }
  }

  React.useEffect(() => {
    fetchSites()
    fetchAvailableSlots()
  }, [])

  React.useEffect(() => {
    const sessionId = searchParams.get("session_id")
    if (!sessionId) return
    if (processedRef.current) return

    const name = sessionStorage.getItem("wpfacil_create_name")
    const subdomain = sessionStorage.getItem("wpfacil_create_subdomain")
    const plan = sessionStorage.getItem("wpfacil_create_plan")
    const wpTitle = sessionStorage.getItem("wpfacil_create_wpTitle") || name || ""
    const wpAdminUser = sessionStorage.getItem("wpfacil_create_wpAdminUser") || ""
    const wpAdminEmail = sessionStorage.getItem("wpfacil_create_wpAdminEmail") || ""
    const wpAdminPassword = sessionStorage.getItem("wpfacil_create_wpAdminPassword") || ""
    if (!name || !subdomain || !plan) return

    processedRef.current = true
    setProcessingPayment(true)

    ;(async () => {
      try {
        const session = await api.get<{ paid: boolean }>(`/api/stripe/session/${sessionId}`)
        if (!session.paid) {
          toast.error("El pago no fue completado")
          return
        }
        const site = await api.post<{ id: string }>("/api/sites", {
          name,
          subdomain,
          plan,
          wpTitle,
          wpAdminUser,
          wpAdminEmail,
          wpAdminPassword,
        })
        try {
          await api.post("/api/stripe/attach-subscription", { sessionId, siteId: site.id })
        } catch (err: any) {
          console.error("attach-subscription error", err)
          toast.error(err?.message || "Error al vincular la suscripción")
        }
        sessionStorage.removeItem("wpfacil_create_name")
        sessionStorage.removeItem("wpfacil_create_subdomain")
        sessionStorage.removeItem("wpfacil_create_plan")
        sessionStorage.removeItem("wpfacil_create_wpTitle")
        sessionStorage.removeItem("wpfacil_create_wpAdminUser")
        sessionStorage.removeItem("wpfacil_create_wpAdminEmail")
        sessionStorage.removeItem("wpfacil_create_wpAdminPassword")
        addNotification(`Sitio "${name}" creado exitosamente`)
        toast.success("Sitio creado. Desplegando...")
        router.replace("/dashboard")
        fetchSites()
      } catch (err: any) {
        console.error("post-payment error", err)
        toast.error(err?.message || "Error al verificar el pago")
      } finally {
        setProcessingPayment(false)
      }
    })()
  }, [searchParams])

  const hasDeploying = sites.some((s) => s.status === "deploying" || s.status === "provisioning")

  React.useEffect(() => {
    if (!hasDeploying) return
    const interval = setInterval(fetchSites, 5000)
    return () => clearInterval(interval)
  }, [hasDeploying])

  if (processingPayment) {
    return (
      <div className="space-y-6">
        <PageHeader title="Procesando pago" />
        <PageLoader />
        <p className="text-center text-sm text-muted-foreground">Creando tu sitio, por favor espera...</p>
      </div>
    )
  }

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
        {availableSlots.length > 0 && <AvailableSlotsAccordion slots={availableSlots} />}
        <div className="flex flex-col items-center justify-center py-20">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            <Globe className="h-10 w-10 text-muted-foreground" />
          </div>
          <h2 className="mt-6 text-xl font-semibold">No tienes sitios aún</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Crea tu primer sitio WordPress en segundos
          </p>

        </div>
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
      {availableSlots.length > 0 && <AvailableSlotsAccordion slots={availableSlots} />}

      <div className="flex flex-col gap-4">
        {sites.map((site) => (
          <SiteCard key={site.id} site={site} onDelete={handleDeleteSite} />
        ))}
      </div>
    </div>
  )
}
