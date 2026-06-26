"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/page-header"
import { PageLoader } from "@/components/page-loader"
import { Loader2, ExternalLink, Globe, Package } from "lucide-react"
import { api, getToken, removeToken } from "@/lib/api-client"
import { toast } from "sonner"
import Link from "next/link"

const WILDCARD = process.env.NEXT_PUBLIC_WILDCARD_DOMAIN || "wp.wpfacil.net"

interface Subscription {
  id: string
  plan: string
  status: string
  currentPeriodEnd: string | null
  site?: {
    id: string
    name: string
    subdomain: string
    customDomain: string | null
    domains?: { id: string; host: string; isPrimary: boolean }[]
  }
}

export default function BillingPage() {
  const router = useRouter()
  const [loading, setLoading] = React.useState(true)
  const [portalLoading, setPortalLoading] = React.useState(false)
  const [hasPortal, setHasPortal] = React.useState(false)
  const [subscriptions, setSubscriptions] = React.useState<Subscription[]>([])

  React.useEffect(() => {
    const token = getToken()
    if (!token) {
      router.push("/login")
      return
    }

    async function fetchBilling() {
      try {
        const [userData, subsData] = await Promise.all([
          api.get<{ stripeCustomerId: string | null }>("/api/users/me"),
          api.get<Subscription[]>("/api/users/me/subscriptions"),
        ])
        setHasPortal(!!userData.stripeCustomerId)
        setSubscriptions(subsData)
      } catch {
        removeToken()
        router.push("/login")
      } finally {
        setLoading(false)
      }
    }
    fetchBilling()
  }, [router])

  async function handleManageSubscription() {
    setPortalLoading(true)
    try {
      const res = await api.post<{ url: string }>("/api/stripe/portal")
      window.location.href = res.url
    } catch {
      toast.error("Error al abrir el portal de pago")
    } finally {
      setPortalLoading(false)
    }
  }

  function formatDate(dateString?: string | null) {
    if (!dateString) return "—"
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  function getDomain(sub: Subscription) {
    const primary = sub.site?.domains?.find((d) => d.isPrimary)
    return primary?.host || sub.site?.customDomain || `${sub.site?.subdomain}.${WILDCARD}`
  }

  if (loading) {
    return <PageLoader />
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Facturación" description="Gestiona tus suscripciones" />

      <Card>
        <CardHeader>
          <CardTitle>Suscripciones</CardTitle>
          <CardDescription>Gestiona tus suscripciones y slots disponibles</CardDescription>
        </CardHeader>
        <CardContent>
          {subscriptions.length === 0 ? (
            <div className="py-8 text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                No tienes suscripciones activas. Crea o configura un sitio para comenzar.
              </p>
              <Button variant="outline" onClick={() => router.push("/create")}>
                Crear un sitio
              </Button>
            </div>
          ) : (
            <div className="divide-y">
              {subscriptions.map((sub) => (
                <div
                  key={sub.id}
                  className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0 space-y-1">
                    {sub.site ? (
                      <>
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-muted-foreground" />
                          <Link
                            href={`/dashboard/${sub.site.id}`}
                            className="font-semibold hover:underline"
                          >
                            {sub.site.name}
                          </Link>
                        </div>
                        <a href={`https://${getDomain(sub)}`} target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:underline">{getDomain(sub)}</a>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          <span className="font-semibold">Slot libre</span>
                        </div>
                        <p className="text-sm text-muted-foreground">Sin sitio asignado</p>
                      </>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 sm:gap-6">
                    <div className="text-sm">
                      <span className="text-muted-foreground">Plan:</span>{" "}
                      <span className="font-medium capitalize">{sub.plan}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">Expira:</span>{" "}
                      <span className="font-medium">{formatDate(sub.currentPeriodEnd)}</span>
                    </div>
                    <Badge variant={sub.status === "active" ? "default" : "secondary"}>
                      {sub.status}
                    </Badge>
                    {!sub.site && (
                      <Button size="sm" asChild>
                        <Link href={`/create?slotId=${sub.id}&plan=${sub.plan}`}>Configurar</Link>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
        {hasPortal && (
          <CardFooter>
            <Button className="w-full" onClick={handleManageSubscription} disabled={portalLoading}>
              {portalLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <ExternalLink className="mr-2 h-4 w-4" />
              Ir al Portal de Stripe
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  )
}
