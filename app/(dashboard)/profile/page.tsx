"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { PageHeader } from "@/components/page-header"
import { PageLoader } from "@/components/page-loader"
import { api, getToken, removeToken } from "@/lib/api-client"
import { Loader2, Save } from "lucide-react"
import { toast } from "sonner"

export default function ProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [name, setName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [avatar, setAvatar] = React.useState("")

  React.useEffect(() => {
    const token = getToken()
    if (!token) {
      router.push("/login")
      return
    }

    async function fetchUser() {
      try {
        const data = await api.get<{ name: string; email: string; image?: string }>("/api/users/me")
        setName(data.name)
        setEmail(data.email)
        setAvatar(data.image || "")
      } catch {
        removeToken()
        router.push("/login")
      } finally {
        setLoading(false)
      }
    }
    fetchUser()
  }, [router])

  async function handleSave() {
    if (!name.trim()) {
      toast.error("El nombre no puede estar vacío")
      return
    }
    setSaving(true)
    try {
      await api.patch("/api/users/me", { name })
      toast.success("Perfil actualizado")
    } catch (err: any) {
      toast.error(err?.message || "Error al guardar")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <PageLoader />
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Perfil" description="Gestiona tu información personal" />

      <Card>
        <CardHeader>
          <CardTitle>Información Personal</CardTitle>
          <CardDescription>Actualiza tu nombre y foto de perfil</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="size-16">
              <AvatarImage src={avatar} alt={name} />
              <AvatarFallback>{name.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <p className="text-sm font-medium">{name}</p>
              <p className="text-sm text-muted-foreground">{email}</p>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Nombre</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Correo electrónico</Label>
            <Input id="email" value={email} disabled className="bg-muted" />
            <p className="text-xs text-muted-foreground">El correo no se puede cambiar</p>
          </div>
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Save className="mr-2 h-4 w-4" />
            Guardar cambios
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
