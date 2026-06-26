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
import { Edit, Plus, Trash2, Loader2, CheckCircle2, XCircle } from "lucide-react"
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

function EditPlanDialog({ plan, onSave }: { plan: any; onSave: () => void }) {
  const [open, setOpen] = React.useState(false)
  const [saving, setSaving] = React.useState(false)
  const [name, setName] = React.useState(plan.name)
  const [description, setDescription] = React.useState(plan.description || "")
  const [monthlyPrice, setMonthlyPrice] = React.useState(Number(plan.monthlyPrice))
  const [annualPrice, setAnnualPrice] = React.useState(Number(plan.annualPrice))
  const [monthlyPriceId, setMonthlyPriceId] = React.useState(plan.monthlyPriceId || "")
  const [annualPriceId, setAnnualPriceId] = React.useState(plan.annualPriceId || "")
  const [maxStorage, setMaxStorage] = React.useState(plan.maxStorage)
  const [features, setFeatures] = React.useState((plan.features || []).join("\n"))
  const [isActive, setIsActive] = React.useState(plan.isActive)

  React.useEffect(() => {
    if (open) {
      setName(plan.name); setDescription(plan.description || "")
      setMonthlyPrice(Number(plan.monthlyPrice)); setAnnualPrice(Number(plan.annualPrice))
      setMonthlyPriceId(plan.monthlyPriceId || ""); setAnnualPriceId(plan.annualPriceId || "")
      setMaxStorage(plan.maxStorage); setFeatures((plan.features || []).join("\n")); setIsActive(plan.isActive)
    }
  }, [open, plan])

  async function handleSave() {
    setSaving(true)
    try {
      const featuresArr = features.split("\n").map((f: string) => f.trim()).filter((f: string) => f.length > 0)
      await api.patch(`/api/admin/plans/${plan.id}`, {
        name, description: description || null, monthlyPrice, annualPrice,
        monthlyPriceId: monthlyPriceId || null, annualPriceId: annualPriceId || null,
        maxStorage, features: featuresArr, isActive,
      })
      setOpen(false); onSave()
      toast.success("Plan actualizado")
    } catch (err: any) {
      toast.error(err?.message || "Error al actualizar")
    } finally { setSaving(false) }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon"><Edit className="size-4" /></Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Editar Plan</DialogTitle>
          <DialogDescription>Modifica los detalles del plan {plan.name}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Slug</Label>
              <Input value={plan.slug} disabled />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Descripción</Label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Breve descripción del plan" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3 rounded-lg border p-4">
              <h4 className="text-sm font-semibold">Mensual</h4>
              <div className="space-y-2">
                <Label className="text-xs">Precio ($)</Label>
                <Input type="number" step="0.01" value={monthlyPrice} onChange={(e) => setMonthlyPrice(parseFloat(e.target.value) || 0)} />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Stripe Price ID</Label>
                <Input placeholder="price_..." value={monthlyPriceId} onChange={(e) => setMonthlyPriceId(e.target.value)} />
              </div>
            </div>
            <div className="space-y-3 rounded-lg border p-4">
              <h4 className="text-sm font-semibold">Anual</h4>
              <div className="space-y-2">
                <Label className="text-xs">Precio ($)</Label>
                <Input type="number" step="0.01" value={annualPrice} onChange={(e) => setAnnualPrice(parseFloat(e.target.value) || 0)} />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Stripe Price ID</Label>
                <Input placeholder="price_..." value={annualPriceId} onChange={(e) => setAnnualPriceId(e.target.value)} />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Almacenamiento (GB)</Label>
            <Input type="number" value={maxStorage} onChange={(e) => setMaxStorage(parseInt(e.target.value) || 0)} />
          </div>
          <div className="space-y-2">
            <Label>Features (una por línea)</Label>
            <textarea value={features} onChange={(e) => setFeatures(e.target.value)} rows={4}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="plan-active" checked={isActive} onCheckedChange={(c) => setIsActive(c === true)} />
            <Label htmlFor="plan-active" className="text-sm font-normal">Plan activo (visible para clientes)</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function CreatePlanDialog({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = React.useState(false)
  const [saving, setSaving] = React.useState(false)
  const [name, setName] = React.useState("")
  const [slug, setSlug] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [monthlyPrice, setMonthlyPrice] = React.useState(0)
  const [annualPrice, setAnnualPrice] = React.useState(0)
  const [maxStorage, setMaxStorage] = React.useState(10240)
  const [features, setFeatures] = React.useState("")

  async function handleCreate() {
    if (!name || !slug) { toast.error("Nombre y slug son requeridos"); return }
    setSaving(true)
    try {
      const featuresArr = features.split("\n").map((f: string) => f.trim()).filter((f: string) => f.length > 0)
      await api.post("/api/admin/plans", { name, slug, description: description || null, monthlyPrice, annualPrice, maxStorage, features: featuresArr, isActive: true })
      toast.success("Plan creado")
      setOpen(false); setName(""); setSlug(""); setDescription(""); setMonthlyPrice(0); setAnnualPrice(0); setMaxStorage(10240); setFeatures("")
      onCreated()
    } catch (err: any) {
      toast.error(err?.message || "Error al crear plan")
    } finally { setSaving(false) }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><Plus className="mr-2 h-4 w-4" /> Nuevo Plan</Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Plan</DialogTitle>
          <DialogDescription>Crea un plan con precios mensual y anual</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Slug</Label>
              <Input value={slug} onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"))} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Descripción</Label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Breve descripción del plan" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 rounded-lg border p-4">
              <Label className="text-xs font-semibold">Precio Mensual ($)</Label>
              <Input type="number" step="0.01" value={monthlyPrice} onChange={(e) => setMonthlyPrice(parseFloat(e.target.value) || 0)} />
            </div>
            <div className="space-y-2 rounded-lg border p-4">
              <Label className="text-xs font-semibold">Precio Anual ($)</Label>
              <Input type="number" step="0.01" value={annualPrice} onChange={(e) => setAnnualPrice(parseFloat(e.target.value) || 0)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Almacenamiento (GB)</Label>
            <Input type="number" value={maxStorage} onChange={(e) => setMaxStorage(parseInt(e.target.value) || 0)} />
          </div>
          <div className="space-y-2">
            <Label>Features (una por línea)</Label>
            <textarea value={features} onChange={(e) => setFeatures(e.target.value)} rows={4}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={handleCreate} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Crear Plan
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
    } catch { toast.error("Error al cargar planes") }
    finally { setLoading(false) }
  }

  React.useEffect(() => { fetchPlans() }, [])

  async function handlePreload() {
    setPreloading(true)
    try {
      const res = await api.post<{ results: { action: string; slug: string }[] }>("/api/admin/plans/preload")
      const created = res.results.filter((r) => r.action === "created")
      toast.success(`${created.length} plan(es) creados`); await fetchPlans()
    } catch { toast.error("Error al precargar planes") }
    finally { setPreloading(false) }
  }

  async function handleSync() {
    setSyncing(true)
    try {
      const res = await api.post<{ synced: any[] }>("/api/admin/plans/sync-stripe")
      toast.success(`${res.synced.length} precio(s) sincronizados con Stripe`); await fetchPlans()
    } catch { toast.error("Error al sincronizar con Stripe") }
    finally { setSyncing(false) }
  }

  const columns = [
    { key: "name", label: "Nombre", render: (v: unknown) => <span className="font-medium">{v as string}</span> },
    {
      key: "monthlyPrice", label: "Mensual",
      render: (v: unknown) => `$${Number(v).toFixed(2)}`,
    },
    {
      key: "annualPrice", label: "Anual",
      render: (v: unknown) => `$${Number(v).toFixed(2)}`,
    },
    { key: "maxStorage", label: "Almacenamiento", className: "hidden md:table-cell", render: (v: unknown) => `${v} GB` },
    {
      key: "stripe", label: "Stripe", className: "hidden lg:table-cell",
      render: (_: unknown, row: Record<string, unknown>) => {
        const r = row as any
        const synced = r.monthlyPriceId && r.annualPriceId
        return synced ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-destructive" />
      },
    },
    {
      key: "isActive", label: "Activo",
      render: (v: unknown) => <Badge variant={v ? "default" : "secondary"}>{v ? "Sí" : "No"}</Badge>,
    },
    {
      key: "actions", label: "Acciones",
      render: (_: unknown, row: Record<string, unknown>) => {
        const r = row as any
        return (
          <div className="flex items-center gap-1">
            <EditPlanDialog plan={r} onSave={fetchPlans} />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Eliminar Plan</AlertDialogTitle>
                  <AlertDialogDescription>
                    ¿Estás seguro de eliminar <strong>{r.name}</strong>?
                    {(r.monthlyPriceId || r.annualPriceId) && " Se archivará el producto asociado en Stripe."}
                    Esta acción no se puede deshacer.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={async () => {
                      try {
                        await api.delete(`/api/admin/plans/${r.id}`)
                        toast.success("Plan eliminado"); fetchPlans()
                      } catch (err: any) { toast.error(err?.response?.data?.message || err?.message || "Error al eliminar") }
                    }}
                  >Eliminar</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )
      },
    },
  ]

  if (loading) return <PageLoader />

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader title="Planes" description="Gestiona los planes de suscripción" />
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button variant="outline" onClick={handlePreload} disabled={preloading}>
            {preloading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Precargar
          </Button>
          <Button variant="outline" onClick={handleSync} disabled={syncing}>
            {syncing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Sync Stripe
          </Button>
          <CreatePlanDialog onCreated={fetchPlans} />
        </div>
      </div>
      <AdminDataTable columns={columns} data={plans as unknown as Record<string, unknown>[]} searchKey="name" />
    </div>
  )
}
