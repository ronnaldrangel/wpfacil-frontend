"use client"

import * as React from "react"
import { AdminDataTable } from "@/components/admin-data-table"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog"
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
import { Edit, XCircle, Loader2, Plus, Trash2, RotateCcw } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/page-header"
import { PageLoader } from "@/components/page-loader"
import { api } from "@/lib/api-client"
import { toast } from "sonner"

function EditSubscriptionDialog({ sub, onSave }: { sub: any; onSave: () => Promise<void> }) {
  const [open, setOpen] = React.useState(false)
  const [saving, setSaving] = React.useState(false)
  const [plan, setPlan] = React.useState(sub.plan)
  const [plans, setPlans] = React.useState<any[]>([])
  const [expirationDate, setExpirationDate] = React.useState(
    sub.currentPeriodEnd ? new Date(sub.currentPeriodEnd).toISOString().split("T")[0] : "",
  )

  React.useEffect(() => {
    if (open) {
      api.get<any[]>("/api/admin/plans").then(setPlans).catch(() => {})
      setPlan(sub.plan)
      setExpirationDate(sub.currentPeriodEnd ? new Date(sub.currentPeriodEnd).toISOString().split("T")[0] : "")
    }
  }, [open, sub])

  async function handleSave() {
    setSaving(true)
    try {
      const payload: any = { plan }
      if (sub.source === "manual") {
        payload.currentPeriodEnd = expirationDate ? new Date(expirationDate).toISOString() : null
      }
      await api.patch(`/api/admin/subscriptions/${sub.id}`, payload)
      await onSave()
      setOpen(false)
      toast.success("Subscripción actualizada")
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
          <Edit className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Subscripción</DialogTitle>
          <DialogDescription>
            {sub.site?.name ? `Sitio: ${sub.site.name}` : "Slot sin sitio asignado"}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Plan</Label>
            <div className="grid gap-2 max-h-60 overflow-y-auto">
              {plans.map((p: any) => (
                <div
                  key={p.id}
                  className={`flex cursor-pointer items-center justify-between rounded-lg border p-3 transition-colors hover:bg-accent ${
                    plan === p.slug ? "border-primary bg-accent" : ""
                  }`}
                  onClick={() => setPlan(p.slug)}
                >
                  <div>
                    <p className="text-sm font-medium">{p.name}</p>
                    <p className="text-xs text-muted-foreground">
                      ${Number(p.price).toFixed(2)} / {p.period === "annual" ? "año" : "mes"}
                    </p>
                  </div>
                  {plan === p.slug && <div className="h-2 w-2 rounded-full bg-primary" />}
                </div>
              ))}
            </div>
          </div>

          {sub.source === "manual" && (
            <div className="space-y-2">
              <Label>Fecha de expiración (opcional)</Label>
              <Input
                type="date"
                value={expirationDate}
                onChange={(e) => setExpirationDate(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Si no pones fecha, la subscripción será perpetua hasta que la canceles manualmente.
              </p>
            </div>
          )}

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Badge variant="outline">{sub.source === "manual" ? "Manual" : "Stripe"}</Badge>
            <span>Estado: <Badge variant={sub.status === "active" ? "default" : "destructive"}>{sub.status}</Badge></span>
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

function CancelSubscriptionDialog({ subId, siteName, onCancel }: { subId: string; siteName: string; onCancel: () => Promise<void> }) {
  const [canceling, setCanceling] = React.useState(false)

  async function handleCancel() {
    setCanceling(true)
    await onCancel()
    setCanceling(false)
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <XCircle className="h-4 w-4 text-destructive" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancelar Subscripción</AlertDialogTitle>
          <AlertDialogDescription>
            ¿Estás seguro de cancelar la subscripción de {siteName}? El usuario perderá acceso.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={handleCancel} disabled={canceling}>
            {canceling && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Cancelar Subscripción
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

function ReactivateSubscriptionDialog({ subId, onReactivate }: { subId: string; onReactivate: () => Promise<void> }) {
  const [open, setOpen] = React.useState(false)
  const [saving, setSaving] = React.useState(false)
  const [expirationDate, setExpirationDate] = React.useState("")

  async function handleReactivate() {
    setSaving(true)
    try {
      const payload: any = {}
      if (expirationDate) payload.currentPeriodEnd = new Date(expirationDate).toISOString()
      await api.post(`/api/admin/subscriptions/${subId}/reactivate`, payload)
      await onReactivate()
      setOpen(false)
      toast.success("Subscripción reactivada")
    } catch (err: any) {
      toast.error(err?.message || "Error al reactivar")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <RotateCcw className="h-4 w-4 text-green-500" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reactivar Subscripción</DialogTitle>
          <DialogDescription>La subscripción volverá a estar activa y el sitio se reanudará.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Nueva fecha de expiración (opcional)</Label>
            <Input type="date" value={expirationDate} onChange={(e) => setExpirationDate(e.target.value)} />
            <p className="text-xs text-muted-foreground">Si no pones fecha, será perpetua.</p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={handleReactivate} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Reactivar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function DeleteSubscriptionDialog({ subId, siteName, onDelete }: { subId: string; siteName: string; onDelete: () => Promise<void> }) {
  const [deleting, setDeleting] = React.useState(false)

  async function handleDelete() {
    setDeleting(true)
    await onDelete()
    setDeleting(false)
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Eliminar Subscripción</AlertDialogTitle>
          <AlertDialogDescription>
            ¿Estás seguro de eliminar completamente la subscripción de {siteName}?
            Esta acción no se puede deshacer y eliminará todos los registros.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={handleDelete} disabled={deleting}>
            {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

function CreateSubscriptionDialog({ onCreated }: { onCreated: () => Promise<void> }) {
  const [open, setOpen] = React.useState(false)
  const [saving, setSaving] = React.useState(false)
  const [users, setUsers] = React.useState<any[]>([])
  const [plans, setPlans] = React.useState<any[]>([])
  const [userId, setUserId] = React.useState("")
  const [plan, setPlan] = React.useState("")
  const [expirationDate, setExpirationDate] = React.useState("")

  React.useEffect(() => {
    if (open) {
      Promise.all([
        api.get<any>("/api/admin/users?page=1&limit=100"),
        api.get<any[]>("/api/admin/plans"),
      ])
        .then(([usersRes, plansRes]) => {
          setUsers(usersRes.users || [])
          setPlans(plansRes)
          if (plansRes.length > 0 && !plan) setPlan(plansRes[0].slug)
          if (usersRes.users?.length > 0 && !userId) setUserId(usersRes.users[0].id)
        })
        .catch(() => {})
    }
  }, [open])

  async function handleCreate() {
    if (!userId || !plan) return
    setSaving(true)
    try {
      const payload: any = { userId, plan }
      if (expirationDate) payload.currentPeriodEnd = new Date(expirationDate).toISOString()
      await api.post("/api/admin/subscriptions", payload)
      await onCreated()
      setOpen(false)
      toast.success("Subscripción manual creada")
    } catch (err: any) {
      toast.error(err?.message || "Error al crear subscripción")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Crear subscripción
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear subscripción manual</DialogTitle>
          <DialogDescription>
            Crea un slot de subscripción para un usuario. Opcionalmente puedes asignar una fecha de expiración.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Usuario</Label>
            <select
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
            >
              {users.map((u: any) => (
                <option key={u.id} value={u.id}>
                  {u.name || u.email} — {u.email}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label>Plan</Label>
            <div className="grid gap-2 max-h-60 overflow-y-auto">
              {plans.map((p: any) => (
                <div
                  key={p.id}
                  className={`flex cursor-pointer items-center justify-between rounded-lg border p-3 transition-colors hover:bg-accent ${
                    plan === p.slug ? "border-primary bg-accent" : ""
                  }`}
                  onClick={() => setPlan(p.slug)}
                >
                  <div>
                    <p className="text-sm font-medium">{p.name}</p>
                    <p className="text-xs text-muted-foreground">
                      ${Number(p.price).toFixed(2)} / {p.period === "annual" ? "año" : "mes"} · {Math.round(p.maxStorage / 1024)} GB
                    </p>
                  </div>
                  {plan === p.slug && <div className="h-2 w-2 rounded-full bg-primary" />}
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Fecha de expiración (opcional)</Label>
            <Input
              type="date"
              value={expirationDate}
              onChange={(e) => setExpirationDate(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Si no pones fecha, la subscripción será perpetua hasta que la canceles manualmente.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={handleCreate} disabled={saving || !userId || !plan}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Crear
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function AdminSubscriptionsPage() {
  const [loading, setLoading] = React.useState(true)
  const [subscriptions, setSubscriptions] = React.useState<any[]>([])

  async function fetchSubscriptions() {
    try {
      const res = await api.get<any>("/api/admin/subscriptions?page=1&limit=100")
      setSubscriptions(res.subscriptions)
    } catch {
      toast.error("Error al cargar subscripciones")
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => { fetchSubscriptions() }, [])

  const columns = [
    {
      key: "site",
      label: "Sitio",
      render: (v: unknown) => (v as any)?.name || "—",
    },
    {
      key: "user",
      label: "Usuario",
      className: "hidden md:table-cell",
      render: (v: unknown) => (v as any)?.name || (v as any)?.email || "—",
    },
    {
      key: "plan",
      label: "Plan",
      className: "hidden md:table-cell",
      render: (v: unknown) => String(v).charAt(0).toUpperCase() + String(v).slice(1),
    },
    {
      key: "source",
      label: "Origen",
      className: "hidden lg:table-cell",
      render: (v: unknown) =>
        v === "manual" ? (
          <Badge variant="outline">Manual</Badge>
        ) : (
          <Badge variant="secondary">Stripe</Badge>
        ),
    },
    {
      key: "status",
      label: "Estado",
      render: (value: unknown) => (
        <Badge variant={value === "active" ? "default" : value === "canceled" ? "destructive" : "secondary"}>
          {value === "active" ? "Activa" : value === "canceled" ? "Cancelada" : value === "expired" ? "Expirada" : String(value)}
        </Badge>
      ),
    },
    {
      key: "currentPeriodEnd",
      label: "Expira",
      className: "hidden lg:table-cell",
      render: (v: unknown, row: Record<string, unknown>) => {
        const r = row as any
        if (!v && r.source === "manual") return <span className="text-muted-foreground">— (perpetua)</span>
        return v
          ? new Date(v as string).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })
          : "—"
      },
    },
    {
      key: "actions",
      label: "Acciones",
      render: (_: unknown, row: Record<string, unknown>) => {
        const r = row as any
        const isManual = r.source === "manual"
        const isActive = r.status === "active"
        return (
          <div className="flex items-center gap-1">
            <EditSubscriptionDialog sub={row} onSave={fetchSubscriptions} />
            {isManual && !isActive && (
              <ReactivateSubscriptionDialog subId={r.id} onReactivate={fetchSubscriptions} />
            )}
            {isActive && (
              <CancelSubscriptionDialog
                subId={r.id}
                siteName={r.site?.name || ""}
                onCancel={async () => {
                  try {
                    await api.patch(`/api/admin/subscriptions/${r.id}`, { status: "canceled" })
                    await fetchSubscriptions()
                    toast.success("Subscripción cancelada")
                  } catch (err: any) {
                    toast.error(err?.message || "Error al cancelar")
                  }
                }}
              />
            )}
            <DeleteSubscriptionDialog
              subId={r.id}
              siteName={r.site?.name || ""}
              onDelete={async () => {
                try {
                  await api.delete(`/api/admin/subscriptions/${r.id}`)
                  await fetchSubscriptions()
                  toast.success("Subscripción eliminada")
                } catch (err: any) {
                  toast.error(err?.message || "Error al eliminar")
                }
              }}
            />
          </div>
        )
      },
    },
  ]

  if (loading) {
    return <PageLoader />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader title="Subscripciones" description="Gestiona las subscripciones de los sitios" />
        <CreateSubscriptionDialog onCreated={fetchSubscriptions} />
      </div>
      <AdminDataTable columns={columns} data={subscriptions as unknown as Record<string, unknown>[]} searchKey="plan" />
    </div>
  )
}
