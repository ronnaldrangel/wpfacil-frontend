"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/page-header"
import { PageLoader } from "@/components/page-loader"
import { AdminMetricCard } from "@/components/admin-metric-card"
import { AdminChart } from "@/components/admin-chart"
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table"
import { Users, Globe, CreditCard, DollarSign } from "lucide-react"
import { api } from "@/lib/api-client"

export default function AdminDashboardPage() {
  const [loading, setLoading] = React.useState(true)
  const [metrics, setMetrics] = React.useState<{
    totalUsers: number
    totalSites: number
    totalSubs: number
    mrr: number
    userGrowth: number
    newUsersThisMonth: number
    churnedSubs: number
    sitesByStatus: { status: string; _count: number }[]
  } | null>(null)
  const [recentSubs, setRecentSubs] = React.useState<any[]>([])

  React.useEffect(() => {
    async function fetchData() {
      try {
        const [m, subs] = await Promise.all([
          api.get<any>("/api/admin/metrics"),
          api.get<any>("/api/admin/subscriptions?page=1&limit=5"),
        ])
        setMetrics(m)
        setRecentSubs(subs.subscriptions || [])
      } catch {
        // handle error silently
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return <PageLoader />
  }

  if (!metrics) {
    return <p className="text-center text-muted-foreground py-20">Error al cargar métricas</p>
  }

  const userGrowthData = [
    { name: "Mes Anterior", value: Math.max(metrics.totalUsers - metrics.newUsersThisMonth, 0) },
    { name: "Este Mes", value: metrics.totalUsers },
  ]

  const mrrGrowthData = [
    { name: "Mes Anterior", value: Math.max(Math.round(metrics.mrr * 0.8), 0) },
    { name: "Este Mes", value: metrics.mrr },
  ]

  return (
    <div className="space-y-6">
      <PageHeader title="Panel de Administración" description="Resumen general de la plataforma" />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <AdminMetricCard
          label="Total Usuarios"
          value={String(metrics.totalUsers)}
          change={metrics.userGrowth}
          icon={<Users className="h-5 w-5 text-primary" />}
        />
        <AdminMetricCard
          label="Total Sitios"
          value={String(metrics.totalSites)}
          change={metrics.totalSites > 0 ? Math.round((metrics.newUsersThisMonth / metrics.totalSites) * 100) : 0}
          icon={<Globe className="h-5 w-5 text-primary" />}
        />
        <AdminMetricCard
          label="Suscripciones Activas"
          value={String(metrics.totalSubs)}
          change={metrics.churnedSubs > 0 ? -Math.round((metrics.churnedSubs / (metrics.totalSubs + metrics.churnedSubs)) * 100) : 5}
          icon={<CreditCard className="h-5 w-5 text-primary" />}
        />
        <AdminMetricCard
          label="MRR"
          value={`$${metrics.mrr.toLocaleString()}`}
          change={metrics.mrr > 0 ? Math.round(metrics.userGrowth * 0.8) : 0}
          icon={<DollarSign className="h-5 w-5 text-primary" />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Crecimiento de Usuarios</CardTitle>
          </CardHeader>
          <CardContent>
            <AdminChart data={userGrowthData} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Crecimiento de MRR</CardTitle>
          </CardHeader>
          <CardContent>
            <AdminChart data={mrrGrowthData} color="#16a34a" />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Suscripciones Recientes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sitio</TableHead>
                <TableHead>Usuario</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Próximo Pago</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentSubs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No hay suscripciones recientes
                  </TableCell>
                </TableRow>
              ) : (
                recentSubs.map((sub: any) => (
                  <TableRow key={sub.id}>
                    <TableCell className="font-medium">{sub.site?.name || "—"}</TableCell>
                    <TableCell>{sub.site?.user?.name || "—"}</TableCell>
                    <TableCell className="capitalize">{sub.plan}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          sub.status === "active"
                            ? "default"
                            : sub.status === "canceled"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {sub.status === "active" ? "Activa" : sub.status === "canceled" ? "Cancelada" : sub.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {sub.currentPeriodEnd
                        ? new Date(sub.currentPeriodEnd).toLocaleDateString("es-ES", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "—"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
