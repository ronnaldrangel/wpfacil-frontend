"use client"

import * as React from "react"
import { AdminDataTable } from "@/components/admin-data-table"
import { Button } from "@/components/ui/button"
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
import { Edit, XCircle, Loader2, Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/page-header"
import { PageLoader } from "@/components/page-loader"
import { api } from "@/lib/api-client"
import { toast } from "sonner"

function ChangePlanDialog({ sub, onSave }: { sub: any; onSave: (plan: string) => Promise<void> }) {
  const [open, setOpen] = React.useState(false)
  const [saving, setSaving] = React.useState(false)
  const [plan, setPlan] = React.useState(sub.plan)
  const [plans, setPlans] = React.useState<any[]>([])

  React.useEffect(() => {
    if (open) {
      api.get<any[]>("/api/admin/plans").then(setPlans).catch(() => {})
    }
  }, [open])

  async function handleSave() {
    setSaving(true)
    try {
      await api.patch(`/api/admin/subscriptions/${sub.id}`, { plan })
      onSave(plan)
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
          <Edit className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cambiar Plan</DialogTitle>
          <DialogDescription>Cambia el plan de suscripciÃ³n para {sub.site?.name || "el sitio"}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Nuevo plan</Label>
            <div className="grid gap-2">
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
                    <p className="text-xs text-muted-foreground">${Number(p.price).toFixed(2)}/mes</p>
                  </div>
                  {plan === p.slug && (
                    <div className="h-2 w-2 rounded-full bg-primary" />
                  )}
                </div>
              ))}
            </div>
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
          <AlertDialogTitle>Cancelar SubscripciÃ³n</AlertDialogTitle>
          <AlertDialogDescription>
            Â¿EstÃ¡s seguro de cancelar la subscripciÃ³n de {siteName}? El usuario perderÃ¡ acceso al final del perÃ­odo actual.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={handleCancel} disabled={canceling}>
            {canceling && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Cancelar SubscripciÃ³n
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
      await api.post("/api/admin/subscriptions", { userId, plan })
      await onCreated()
      setOpen(false)
      toast.success("SubscripciÃ³n creada")
    } catch (err: any) {
      toast.error(err?.message || "Error al crear subscripciÃ³n")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Crear subscripciÃ³n
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear subscripciÃ³n manual</DialogTitle>
          <DialogDescription>
            Crea un slot de subscripciÃ³n para un usuario sin pasar por Stripe. SerÃ¡ perpetua hasta que la canceles manualmente.
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
                  {u.name || u.email} â€” {u.email}
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
                      ${Number(p.price).toFixed(2)} / {p.period === "annual" ? "aÃ±o" : "mes"} Â· {p.maxStorage / 1024} GB
                    </p>
                  </div>
                  {plan === p.slug && (
                    <div className="h-2 w-2 rounded-full bg-primary" />
                  )}
                </div>
              ))}
            </div>
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
      render: (v: unknown) => (v as any)?.name || "â€”",
    },
    {
      key: "user",
      label: "Usuario",
      className: "hidden md:table-cell",
      render: (v: unknown) => (v as any)?.name || (v as any)?.email || "â€”",
    },
    { key: "plan", label: "Plan", className: "hidden md:table-cell", render: (v: unknown) => String(v).charAt(0).toUpperCase() + String(v).slice(1) },
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
        <Badge
          variant={
            value === "active"
              ? "default"
              : value === "canceled"
              ? "destructive"
              : "secondary"
          }
        >
          {value === "active" ? "Activa" : value === "canceled" ? "Cancelada" : String(value)}
        </Badge>
      ),
    },
    {
      key: "currentPeriodEnd",
      label: "PrÃ³ximo Pago",
      className: "hidden lg:table-cell",
      render: (v: unknown) =>
        v
          ? new Date(v as string).toLocaleDateString("es-ES", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })
          : "â€”",
    },
    {
      key: "actions",
      label: "Acciones",
      render: (_: unknown, row: Record<string, unknown>) => (
        <div className="flex items-center gap-1">
          <ChangePlanDialog
            sub={row}
            onSave={async (plan) => {
              setSubscriptions(subscriptions.map((s) =>
                s.id === row.id ? { ...s, plan } : s
              ))
            }}
          />
          <CancelSubscriptionDialog
            subId={row.id as string}
            siteName={(row as any).site?.name || ""}
            onCancel={async () => {
              try {
                await api.patch(`/api/admin/subscriptions/${row.id}`, { status: "canceled" })
                setSubscriptions(subscriptions.map((s) =>
                  s.id === row.id ? { ...s, status: "canceled" } : s
                ))
                toast.success("SubscripciÃ³n cancelada")
              } catch (err: any) {
                toast.error(err?.message || "Error al cancelar")
              }
            }}
          />
        </div>
      ),
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
