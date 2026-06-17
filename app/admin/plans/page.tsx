"use client"

import * as React from "react"
import { AdminDataTable } from "@/components/admin-data-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
    price: Number(plan.price),
    priceId: plan.priceId || "",
    maxStorage: plan.maxStorage,
    isActive: plan.isActive,
  })

  React.useEffect(() => {
    setForm({
      name: plan.name,
      price: Number(plan.price),
      priceId: plan.priceId || "",
      maxStorage: plan.maxStorage,
      isActive: plan.isActive,
    })
  }, [plan])

  async function handleSave() {
    setSaving(true)
    try {
      const payload: any = {
        name: form.name,
        price: form.price,
        maxStorage: form.maxStorage,
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
          <div className="space-y-2">
            <Label htmlFor="plan-name">Nombre</Label>
            <Input id="plan-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
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
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="plan-active"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              className="h-4 w-4 rounded border-gray-300"
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
    price: 0,
    priceId: "",
    maxStorage: 10,
    isActive: true,
  })

  async function handleCreate() {
    if (!form.name || !form.slug) {
      toast.error("Nombre y slug son requeridos")
      return
    }
    setSaving(true)
    try {
      const payload: any = {
        name: form.name,
        slug: form.slug,
        price: form.price,
        maxStorage: form.maxStorage,
        isActive: form.isActive,
      }
      if (form.priceId) payload.priceId = form.priceId

      await api.post("/api/admin/plans", payload)
      toast.success("Plan creado")
      setOpen(false)
      setForm({ name: "", slug: "", price: 0, priceId: "", maxStorage: 10, isActive: true })
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
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="create-active"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              className="h-4 w-4 rounded border-gray-300"
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
    { key: "slug", label: "Slug" },
    {
      key: "price",
      label: "Precio",
      render: (v: unknown) => `$${Number(v).toFixed(2)}`,
    },
    {
      key: "priceId",
      label: "Stripe Price ID",
      render: (v: unknown) => (v ? String(v) : "—"),
    },
    {
      key: "maxStorage",
      label: "Almacenamiento (GB)",
      render: (v: unknown) => String(v),
    },
    {
      key: "isActive",
      label: "Activo",
      render: (v: unknown) => (
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
            v ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
          }`}
        >
          {v ? "Sí" : "No"}
        </span>
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
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Planes</h1>
          <p className="text-sm text-muted-foreground">Gestiona los planes de suscripción</p>
        </div>
        <div className="flex items-center gap-2">
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
