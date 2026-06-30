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
import { api, setToken } from "@/lib/api-client"
import { PageHeader } from "@/components/page-header"
import { PageLoader } from "@/components/page-loader"
import { Edit, Trash2, Eye, ShieldCheck, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

function EditUserDialog({ user, onSave }: { user: any; onSave: (data: any) => Promise<void> }) {
  const [open, setOpen] = React.useState(false)
  const [saving, setSaving] = React.useState(false)
  const [form, setForm] = React.useState({ name: user.name || "", isAdmin: user.isAdmin })

  React.useEffect(() => {
    setForm({ name: user.name || "", isAdmin: user.isAdmin })
  }, [user])

  async function handleSave() {
    setSaving(true)
    try {
      await api.patch(`/api/admin/users/${user.id}`, form)
      onSave({ ...user, ...form })
      setOpen(false)
      toast.success("Usuario actualizado")
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
          <DialogTitle>Editar Usuario</DialogTitle>
          <DialogDescription>Modifica los datos del usuario</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Nombre</Label>
            <Input id="edit-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-email">Email</Label>
            <Input id="edit-email" type="email" value={user.email} disabled className="bg-muted" />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="edit-isAdmin"
              checked={form.isAdmin}
              onCheckedChange={(checked) =>
                setForm({ ...form, isAdmin: checked === true })
              }
            />
            <Label htmlFor="edit-isAdmin" className="text-sm font-normal">Administrador</Label>
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

function DeleteUserDialog({ userName, onDelete }: { userName: string; onDelete: () => Promise<void> }) {
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
          <AlertDialogTitle>Eliminar Usuario</AlertDialogTitle>
          <AlertDialogDescription>
            ¿Estás seguro de eliminar a {userName}? Esta acción no se puede deshacer.
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

export default function AdminUsersPage() {
  const router = useRouter()
  const [loading, setLoading] = React.useState(true)
  const [users, setUsers] = React.useState<any[]>([])
  const [pagination, setPagination] = React.useState({ page: 1, total: 0, totalPages: 1 })

  async function fetchUsers(page = 1) {
    try {
      const res = await api.get<any>(`/api/admin/users?page=${page}&limit=20`)
      setUsers(res.users)
      setPagination({ page: res.page, total: res.total, totalPages: res.totalPages })
    } catch {
      toast.error("Error al cargar usuarios")
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => { fetchUsers() }, [])

  async function handleImpersonate(userId: string) {
    try {
      const currentToken = localStorage.getItem("wpfacil_token")
      const res = await api.post<{ token: string; adminToken?: string }>(`/api/auth/impersonate/${userId}`)
      setToken(res.token)
      localStorage.setItem("wpfacil_impersonating", userId)
      localStorage.setItem("wpfacil_impersonate_token", res.token)
      if (res.adminToken) {
        localStorage.setItem("wpfacil_admin_token", res.adminToken)
      } else if (currentToken) {
        localStorage.setItem("wpfacil_admin_token", currentToken)
      }
      toast.success("Impersonando usuario")
      router.push("/dashboard")
    } catch {
      toast.error("Error al impersonar")
    }
  }

  const columns = [
    { key: "name", label: "Nombre", render: (v: unknown) => String(v || "—") },
    { key: "email", label: "Email" },
    { key: "_count", label: "Sitios", className: "hidden md:table-cell", render: (v: unknown) => String((v as any)?.sites || 0) },
    {
      key: "isAdmin",
      label: "Admin",
      className: "hidden md:table-cell",
      render: (v: unknown) => (v ? "Sí" : "No"),
    },
    {
      key: "emailVerified",
      label: "Verificado",
      className: "hidden md:table-cell",
      render: (v: unknown, row: Record<string, unknown>) => (
        <div className="flex items-center gap-2">
          <span className={v ? "text-green-600" : "text-muted-foreground"}>
            {v ? "Sí" : "No"}
          </span>
          {!v && (
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={async () => {
                try {
                  await api.post(`/api/admin/users/${row.id}/verify-email`)
                  setUsers(users.map((u) => (u.id === row.id ? { ...u, emailVerified: new Date().toISOString() } : u)))
                  toast.success("Email verificado")
                } catch {
                  toast.error("Error al verificar email")
                }
              }}
            >
              <ShieldCheck className="size-4" />
            </Button>
          )}
        </div>
      ),
    },
    {
      key: "createdAt",
      label: "Creado",
      className: "hidden lg:table-cell",
      render: (v: unknown) =>
        new Date(v as string).toLocaleDateString("es-ES", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
    },
    {
      key: "actions",
      label: "Acciones",
      render: (_: unknown, row: Record<string, unknown>) => (
        <div className="flex items-center gap-1">
          <EditUserDialog
            user={row}
            onSave={async (updated) => {
              setUsers(users.map((u) => (u.id === updated.id ? updated : u)))
            }}
          />
          <DeleteUserDialog
            userName={(row.name as string) || ""}
            onDelete={async () => {
              try {
                await api.delete(`/api/admin/users/${row.id}`)
                setUsers(users.filter((u) => u.id !== row.id))
                toast.success("Usuario eliminado")
              } catch (err: any) {
                toast.error(err?.message || "Error al eliminar")
              }
            }}
          />
          <Button variant="ghost" size="icon" onClick={() => handleImpersonate(row.id as string)}>
            <Eye className="size-4" />
          </Button>
        </div>
      ),
    },
  ]

  if (loading) {
    return <PageLoader />
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Usuarios" description="Gestiona los usuarios de la plataforma" />
      <AdminDataTable columns={columns} data={users as unknown as Record<string, unknown>[]} searchKey="name" />
    </div>
  )
}
