"use client"

import * as React from "react"
import { api } from "@/lib/api-client"
import { toast } from "sonner"
import { PageHeader } from "@/components/page-header"
import { PageLoader } from "@/components/page-loader"
import { AdminDataTable } from "@/components/admin-data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import { Eye, Trash2, Mail, Phone, Loader2, CheckCircle2, MessageSquare } from "lucide-react"

interface ContactMessage {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string | null
  message: string
  read: boolean
  createdAt: string
}

export default function AdminContactsPage() {
  const [messages, setMessages] = React.useState<ContactMessage[]>([])
  const [loading, setLoading] = React.useState(true)
  const [selected, setSelected] = React.useState<ContactMessage | null>(null)

  async function fetchMessages() {
    try {
      const res = await api.get<{ data: ContactMessage[] }>("/api/contacts/admin")
      setMessages(res.data)
    } catch {
      toast.error("Error al cargar mensajes")
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    fetchMessages()
  }, [])

  async function handleToggleRead(id: string) {
    try {
      const updated = await api.patch<ContactMessage>(`/api/contacts/admin/${id}/read`)
      setMessages((prev) => prev.map((m) => (m.id === id ? updated : m)))
      toast.success(updated.read ? "Marcado como leído" : "Marcado como no leído")
    } catch {
      toast.error("Error al actualizar")
    }
  }

  async function handleDelete(id: string) {
    try {
      await api.delete(`/api/contacts/admin/${id}`)
      setMessages((prev) => prev.filter((m) => m.id !== id))
      toast.success("Mensaje eliminado")
    } catch {
      toast.error("Error al eliminar")
    }
  }

  async function openDetail(message: ContactMessage) {
    setSelected(message)
    if (!message.read) {
      try {
        const updated = await api.get<ContactMessage>(`/api/contacts/admin/${message.id}`)
        setMessages((prev) => prev.map((m) => (m.id === message.id ? updated : m)))
      } catch {
        // ignore
      }
    }
  }

  const columns = [
    {
      key: "read",
      label: "Estado",
      className: "w-16",
      render: (_v: unknown, row: ContactMessage) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleToggleRead(row.id)}
          title={row.read ? "Marcar como no leído" : "Marcar como leído"}
        >
          {row.read ? (
            <CheckCircle2 className="size-4 text-green-600" />
          ) : (
            <MessageSquare className="size-4 text-primary" />
          )}
        </Button>
      ),
    },
    {
      key: "name",
      label: "Nombre",
      render: (_v: unknown, row: ContactMessage) => (
        <span className="font-medium">
          {row.firstName} {row.lastName}
          {!row.read && <Badge variant="default" className="ml-2">Nuevo</Badge>}
        </span>
      ),
    },
    {
      key: "email",
      label: "Email",
      className: "hidden md:table-cell",
      render: (_v: unknown, row: ContactMessage) => (
        <a href={`mailto:${row.email}`} className="text-primary hover:underline">
          {row.email}
        </a>
      ),
    },
    {
      key: "phone",
      label: "Teléfono",
      className: "hidden md:table-cell",
      render: (_v: unknown, row: ContactMessage) =>
        row.phone ? (
          <a href={`tel:${row.phone}`} className="text-primary hover:underline">
            {row.phone}
          </a>
        ) : (
          "—"
        ),
    },
    {
      key: "createdAt",
      label: "Fecha",
      className: "hidden lg:table-cell",
      render: (_v: unknown, row: ContactMessage) =>
        new Date(row.createdAt).toLocaleDateString("es-ES", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
    },
    {
      key: "actions",
      label: "Acciones",
      className: "text-right",
      render: (_v: unknown, row: ContactMessage) => (
        <div className="flex items-center justify-end gap-1">
          <Button variant="ghost" size="icon" onClick={() => openDetail(row)}>
            <Eye className="size-4" />
          </Button>
          <DeleteDialog
            name={`${row.firstName} ${row.lastName}`}
            onDelete={async () => handleDelete(row.id)}
          />
        </div>
      ),
    },
  ]

  if (loading) return <PageLoader />

  const unreadCount = messages.filter((m) => !m.read).length

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mensajes de contacto"
        description={`${messages.length} mensaje${messages.length !== 1 ? "s" : ""} · ${unreadCount} sin leer`}
      />

      <AdminDataTable
        columns={columns as any}
        data={messages as any}
        searchKey="firstName"
      />

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-2xl">
          {selected && (
            <>
              <DialogHeader className="flex flex-row items-start gap-4">
                <Avatar className="size-14">
                  <AvatarFallback className="text-lg font-semibold bg-primary text-primary-foreground">
                    {selected.firstName.charAt(0)}{selected.lastName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <DialogTitle className="text-xl">
                      {selected.firstName} {selected.lastName}
                    </DialogTitle>
                    <Badge variant={selected.read ? "secondary" : "default"}>
                      {selected.read ? "Leído" : "Nuevo"}
                    </Badge>
                  </div>
                  <DialogDescription>
                    Recibido el{" "}
                    {new Date(selected.createdAt).toLocaleString("es-ES", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </DialogDescription>
                </div>
              </DialogHeader>

              <div className="flex flex-col gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Información de contacto</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                      <Mail className="size-5 text-primary" />
                      <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground">Correo electrónico</span>
                        <a href={`mailto:${selected.email}`} className="text-sm font-medium text-foreground hover:text-primary hover:underline">
                          {selected.email}
                        </a>
                      </div>
                    </div>
                    {selected.phone && (
                      <div className="flex items-center gap-3">
                        <Phone className="size-5 text-primary" />
                        <div className="flex flex-col">
                          <span className="text-xs text-muted-foreground">Teléfono</span>
                          <a href={`tel:${selected.phone}`} className="text-sm font-medium text-foreground hover:text-primary hover:underline">
                            {selected.phone}
                          </a>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Mensaje</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="max-h-[320px] overflow-y-auto rounded-md bg-muted/60 p-4 text-base leading-relaxed whitespace-pre-wrap">
                      {selected.message}
                    </div>
                  </CardContent>
                </Card>

                <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-2 pt-2">
                  <Button variant="outline" onClick={() => setSelected(null)}>
                    Cerrar
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="outline" asChild>
                      <a href={`mailto:${selected.email}`}>
                        <Mail className="mr-2 size-4" />
                        Responder
                      </a>
                    </Button>
                    <Button
                      variant={selected.read ? "outline" : "default"}
                      onClick={() => {
                        handleToggleRead(selected.id)
                        setSelected({ ...selected, read: !selected.read })
                      }}
                    >
                      {selected.read ? (
                        <MessageSquare className="mr-2 size-4" />
                      ) : (
                        <CheckCircle2 className="mr-2 size-4" />
                      )}
                      {selected.read ? "Marcar como no leído" : "Marcar como leído"}
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function DeleteDialog({ name, onDelete }: { name: string; onDelete: () => Promise<void> }) {
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
          <Trash2 className="size-4 text-destructive" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Eliminar mensaje</AlertDialogTitle>
          <AlertDialogDescription>
            ¿Estás seguro de eliminar el mensaje de {name}? Esta acción no se puede deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting && <Loader2 className="mr-2 size-4 animate-spin" />}
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
