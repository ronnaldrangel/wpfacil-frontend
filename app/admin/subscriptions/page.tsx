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
import { Edit, XCircle, Loader2 } from "lucide-react"
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
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cambiar Plan</DialogTitle>
          <DialogDescription>Cambia el plan de suscripción para {sub.site?.name || "el sitio"}</DialogDescription>
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
          <AlertDialogTitle>Cancelar Subscripción</AlertDialogTitle>
          <AlertDialogDescription>
            ¿Estás seguro de cancelar la subscripción de {siteName}? El usuario perderá acceso al final del período actual.
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
      render: (v: unknown) => (v as any)?.user?.name || "—",
    },
    { key: "plan", label: "Plan", render: (v: unknown) => String(v).charAt(0).toUpperCase() + String(v).slice(1) },
    {
      key: "status",
      label: "Estado",
      render: (value: unknown) => (
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
            value === "active"
              ? "bg-green-100 text-green-800"
              : value === "canceled"
              ? "bg-red-100 text-red-800"
              : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {value === "active" ? "Activa" : value === "canceled" ? "Cancelada" : String(value)}
        </span>
      ),
    },
    {
      key: "currentPeriodEnd",
      label: "Próximo Pago",
      render: (v: unknown) =>
        v
          ? new Date(v as string).toLocaleDateString("es-ES", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })
          : "—",
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
                toast.success("Subscripción cancelada")
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
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Subscripciones</h1>
        <p className="text-sm text-muted-foreground">Gestiona las subscripciones de los sitios</p>
      </div>
      <AdminDataTable columns={columns} data={subscriptions as unknown as Record<string, unknown>[]} searchKey="plan" />
    </div>
  )
}
