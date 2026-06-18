"use client"

import * as React from "react"
import { AdminDataTable } from "@/components/admin-data-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Edit, Plus, Trash2, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/page-header"
import { PageLoader } from "@/components/page-loader"
import { api } from "@/lib/api-client"
import { toast } from "sonner"
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

function EditPlanDialog({ plan, onSave }: { plan: any; onSave: (data: any) => Promise<void> }) {
  const [open, setOpen] = React.useState(false)
  const [saving, setSaving] = React.useState(false)
  const [form, setForm] = React.useState({
    name: plan.name,
    group: plan.group || "basic",
    period: plan.period || "monthly",
    price: Number(plan.price),
    priceId: plan.priceId || "",
    maxStorage: plan.maxStorage,
    features: (plan.features || []).join("\n"),
    isActive: plan.isActive,
  })

  React.useEffect(() => {
    setForm({
      name: plan.name,
      group: plan.group || "basic",
      period: plan.period || "monthly",
      price: Number(plan.price),
      priceId: plan.priceId || "",
      maxStorage: plan.maxStorage,
      features: (plan.features || []).join("\n"),
      isActive: plan.isActive,
    })
  }, [plan])

  async function handleSave() {
    setSaving(true)
    try {
      const features = form.features
        .split("\n")
        .map((f: string) => f.trim())
        .filter((f: string) => f.length > 0)
      const payload: any = {
        name: form.name,
        group: form.group,
        period: form.period,
        price: form.price,
        maxStorage: form.maxStorage,
        features,
        isActive: form.isActive,
      }
      if (form.priceId) payload.priceId = form.priceId

      await api.patch(`/api/admin/plans/${plan.id}`, payload)
      onSave({ ...plan, ...payload })
      setOpen(false)
      toast.success("Plan actualizado")
    } catch (err: any) {
      toast.error(err?.message || "Error al actualizar")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Plan</DialogTitle>
          <DialogDescription>Modifica los detalles del plan {plan.name}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="plan-name">Nombre</Label>
              <Input id="plan-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="plan-slug">Slug</Label>
              <Input id="plan-slug" value={plan.slug} disabled />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="plan-group">Grupo</Label>
              <select
                id="plan-group"
                value={form.group}
                onChange={(e) => setForm({ ...form, group: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="basic">Básico</option>
                <option value="pro">Pro</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="plan-period">Periodo</Label>
              <select
                id="plan-period"
                value={form.period}
                onChange={(e) => setForm({ ...form, period: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="monthly">Mensual</option>
                <option value="annual">Anual</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="plan-price">Precio ($)</Label>
            <Input id="plan-price" type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="plan-priceId">Stripe Price ID</Label>
            <Input id="plan-priceId" placeholder="price_..." value={form.priceId} onChange={(e) => setForm({ ...form, priceId: e.target.value })} />
            <p className="text-xs text-muted-foreground">Crea el producto y precio en Stripe y pega el Price ID aquí</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="plan-storage">Almacenamiento (GB)</Label>
            <Input id="plan-storage" type="number" value={form.maxStorage} onChange={(e) => setForm({ ...form, maxStorage: parseInt(e.target.value) || 0 })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="plan-features">Features (una por línea)</Label>
            <textarea
              id="plan-features"
              value={form.features}
              onChange={(e) => setForm({ ...form, features: e.target.value })}
              rows={5}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="plan-active"
              checked={form.isActive}
              onCheckedChange={(checked) =>
                setForm({ ...form, isActive: checked === true })
              }
            />
            <Label htmlFor="plan-active" className="text-sm font-normal">Plan activo</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function CreatePlanDialog({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = React.useState(false)
  const [saving, setSaving] = React.useState(false)
  const [form, setForm] = React.useState({
    name: "",
    slug: "",
    group: "basic",
    period: "monthly",
    price: 0,
    priceId: "",
    maxStorage: 10,
    features: "",
    isActive: true,
  })

  async function handleCreate() {
    if (!form.name || !form.slug) {
      toast.error("Nombre y slug son requeridos")
      return
    }
    setSaving(true)
    try {
      const features = form.features
        .split("\n")
        .map((f: string) => f.trim())
        .filter((f: string) => f.length > 0)
      const payload: any = {
        name: form.name,
        slug: form.slug,
        group: form.group,
        period: form.period,
        price: form.price,
        maxStorage: form.maxStorage,
        features,
        isActive: form.isActive,
      }
      if (form.priceId) payload.priceId = form.priceId

      await api.post("/api/admin/plans", payload)
      toast.success("Plan creado")
      setOpen(false)
      setForm({ name: "", slug: "", group: "basic", period: "monthly", price: 0, priceId: "", maxStorage: 10, features: "", isActive: true })
      onCreated()
    } catch (err: any) {
      toast.error(err?.message || "Error al crear plan")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Plan
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear Nuevo Plan</DialogTitle>
          <DialogDescription>Crea un plan de suscripción en Stripe y luego ingresa los datos aquí</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="create-name">Nombre</Label>
              <Input id="create-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-slug">Slug</Label>
              <Input
                id="create-slug"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") })}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="create-group">Grupo</Label>
              <select
                id="create-group"
                value={form.group}
                onChange={(e) => setForm({ ...form, group: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="basic">Básico</option>
                <option value="pro">Pro</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-period">Periodo</Label>
              <select
                id="create-period"
                value={form.period}
                onChange={(e) => setForm({ ...form, period: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="monthly">Mensual</option>
                <option value="annual">Anual</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="create-price">Precio ($)</Label>
            <Input id="create-price" type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="create-priceId">Stripe Price ID</Label>
            <Input id="create-priceId" placeholder="price_..." value={form.priceId} onChange={(e) => setForm({ ...form, priceId: e.target.value })} />
            <p className="text-xs text-muted-foreground">Crea el producto y precio en Stripe y pega el Price ID aquí</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="create-storage">Almacenamiento (GB)</Label>
            <Input id="create-storage" type="number" value={form.maxStorage} onChange={(e) => setForm({ ...form, maxStorage: parseInt(e.target.value) || 0 })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="create-features">Features (una por línea)</Label>
            <textarea
              id="create-features"
              value={form.features}
              onChange={(e) => setForm({ ...form, features: e.target.value })}
              rows={5}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="create-active"
              checked={form.isActive}
              onCheckedChange={(checked) =>
                setForm({ ...form, isActive: checked === true })
              }
            />
            <Label htmlFor="create-active" className="text-sm font-normal">Plan activo</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={handleCreate} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Crear Plan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function AdminPlansPage() {
  const [loading, setLoading] = React.useState(true)
  const [plans, setPlans] = React.useState<any[]>([])
  const [preloading, setPreloading] = React.useState(false)
  const [syncing, setSyncing] = React.useState(false)

  async function fetchPlans() {
    try {
      const data = await api.get<any[]>("/api/admin/plans")
      setPlans(data)
    } catch {
      toast.error("Error al cargar planes")
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => { fetchPlans() }, [])

  async function handlePreload() {
    setPreloading(true)
    try {
      const res = await api.post<{ results: { action: string; slug: string }[] }>("/api/admin/plans/preload")
      const created = res.results.filter((r) => r.action === "created")
      toast.success(`${created.length} plan(es) creados`)
      await fetchPlans()
    } catch {
      toast.error("Error al precargar planes")
    } finally {
      setPreloading(false)
    }
  }

  async function handleSync() {
    setSyncing(true)
    try {
      const res = await api.post<{ synced: { slug: string; priceId: string }[] }>("/api/admin/plans/sync-stripe")
      toast.success(`${res.synced.length} plan(es) sincronizados con Stripe`)
      await fetchPlans()
    } catch {
      toast.error("Error al sincronizar con Stripe")
    } finally {
      setSyncing(false)
    }
  }

  const columns = [
    { key: "name", label: "Nombre" },
    { key: "slug", label: "Slug", className: "hidden md:table-cell" },
    { key: "group", label: "Grupo", className: "hidden md:table-cell" },
    { key: "period", label: "Periodo", className: "hidden md:table-cell" },
    {
      key: "price",
      label: "Precio",
      render: (v: unknown) => `$${Number(v).toFixed(2)}`,
    },
    {
      key: "priceId",
      label: "Stripe Price ID",
      className: "hidden lg:table-cell",
      render: (v: unknown) => (v ? String(v) : "—"),
    },
    {
      key: "maxStorage",
      label: "Almacenamiento (GB)",
      className: "hidden md:table-cell",
      render: (v: unknown) => String(v),
    },
    {
      key: "isActive",
      label: "Activo",
      render: (v: unknown) => (
        <Badge variant={v ? "default" : "secondary"}>
          {v ? "Sí" : "No"}
        </Badge>
      ),
    },
    {
      key: "actions",
      label: "Acciones",
      render: (_: unknown, row: Record<string, unknown>) => (
        <div className="flex items-center gap-1">
          <EditPlanDialog
            plan={row}
            onSave={async (updated) => {
              setPlans(plans.map((p) => (p.id === updated.id ? { ...p, ...updated } : p)))
            }}
          />
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon">
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Eliminar Plan</AlertDialogTitle>
                <AlertDialogDescription>
                  ¿Estás seguro de eliminar el plan <strong>{(row as any).name}</strong>?
                  {(row as any).priceId && " También se archivará el producto asociado en Stripe."}
                  Esta acción no se puede deshacer.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={async () => {
                    try {
                      await api.delete(`/api/admin/plans/${row.id}`)
                      setPlans(plans.filter((p) => p.id !== row.id))
                      toast.success("Plan eliminado")
                    } catch (err: any) {
                      toast.error(err?.message || "Error al eliminar plan")
                    }
                  }}
                >
                  Eliminar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      ),
    },
  ]

  if (loading) {
    return <PageLoader />
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader title="Planes" description="Gestiona los planes de suscripción" />
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button variant="outline" onClick={handlePreload} disabled={preloading}>
            {preloading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Precargar planes
          </Button>
          <Button variant="outline" onClick={handleSync} disabled={syncing}>
            {syncing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Sync Stripe
          </Button>
          <CreatePlanDialog onCreated={fetchPlans} />
        </div>
      </div>
      <AdminDataTable columns={columns} data={plans as unknown as Record<string, unknown>[]} searchKey="name" />
    </div>
  )
}
