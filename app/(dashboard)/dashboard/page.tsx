"use client"

import * as React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { SiteCard } from "@/components/site-card"
import { DeployingSkeleton } from "@/components/deploying-skeleton"
import { Plus, Globe } from "lucide-react"
import { api } from "@/lib/api-client"

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

  const hasDeploying = sites.some((s) => s.status === "deploying")

  React.useEffect(() => {
    if (!hasDeploying) return
    const interval = setInterval(fetchSites, 5000)
    return () => clearInterval(interval)
  }, [hasDeploying])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Mis Sitios</h1>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <DeployingSkeleton key={i} />
          ))}
        </div>
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Mis Sitios</h1>
        <Link href="/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Sitio
          </Button>
        </Link>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sites.map((site) => (
          <SiteCard key={site.id} site={site} onDelete={handleDeleteSite} />
        ))}
      </div>
    </div>
  )
}
