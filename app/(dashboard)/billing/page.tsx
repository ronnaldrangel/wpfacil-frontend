"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/page-header"
import { PageLoader } from "@/components/page-loader"
import { Loader2, CreditCard, ExternalLink } from "lucide-react"
import { api, getToken, removeToken } from "@/lib/api-client"
import { toast } from "sonner"

export default function BillingPage() {
  const router = useRouter()
  const [loading, setLoading] = React.useState(true)
  const [portalLoading, setPortalLoading] = React.useState(false)
  const [hasPortal, setHasPortal] = React.useState(false)

  React.useEffect(() => {
    const token = getToken()
    if (!token) {
      router.push("/login")
      return
    }

    async function fetchBilling() {
      try {
        const data = await api.get<{ stripeCustomerId: string | null }>("/api/users/me")
        setHasPortal(!!data.stripeCustomerId)
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

  if (loading) {
    return <PageLoader />
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Facturación" description="Gestiona tus suscripciones y facturas" />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Suscripciones</CardTitle>
            <CardDescription>Cada sitio tiene su propia suscripción</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {hasPortal ? (
              <>
                <p className="text-sm text-muted-foreground">
                  Administra todas las suscripciones de tus sitios desde el portal de Stripe.
                </p>
                <Button className="w-full" onClick={handleManageSubscription} disabled={portalLoading}>
                  {portalLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Ir al Portal de Stripe
                </Button>
              </>
            ) : (
              <div className="py-6 text-center space-y-4">
                <p className="text-sm text-muted-foreground">
                  No tienes métodos de pago registrados. Crea un sitio para comenzar.
                </p>
                <Button variant="outline" onClick={() => router.push("/create")}>
                  Crear un sitio
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Método de Pago</CardTitle>
            <CardDescription>Administra tus tarjetas</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <CreditCard className="h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-sm text-muted-foreground text-center">
              Gestiona tus métodos de pago desde el portal de Stripe
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={handleManageSubscription}
              disabled={portalLoading || !hasPortal}
            >
              Ir al portal de pago
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historial de Facturas</CardTitle>
          <CardDescription>Todas tus facturas están disponibles en Stripe</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <p className="text-sm text-muted-foreground text-center mb-4">
            Descarga tus facturas desde el portal de Stripe
          </p>
          <Button
            variant="outline"
            onClick={handleManageSubscription}
            disabled={portalLoading || !hasPortal}
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            Ver facturas en Stripe
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
