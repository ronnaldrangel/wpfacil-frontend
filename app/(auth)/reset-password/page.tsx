"use client"

import * as React from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { PasswordInput } from "@/components/ui/password-input"
import { Button } from "@/components/ui/button"
import { api } from "@/lib/api-client"
import { Loader2, CheckCircle } from "lucide-react"
import { toast } from "sonner"

function ResetForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [password, setPassword] = React.useState("")
  const [confirm, setConfirm] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [done, setDone] = React.useState(false)

  const token = searchParams.get("token")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!password || password.length < 6) { toast.error("La contraseña debe tener al menos 6 caracteres"); return }
    if (password !== confirm) { toast.error("Las contraseñas no coinciden"); return }
    setLoading(true)
    try {
      await api.post("/api/auth/reset-password", { token, password })
      setDone(true)
    } catch (err: any) {
      toast.error(err?.message || "Error al restablecer la contraseña")
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <p className="text-destructive font-medium">Enlace de restablecimiento inválido o expirado.</p>
          <Link href="/forgot-password"><Button variant="link">Solicitar nuevo enlace</Button></Link>
        </CardContent>
      </Card>
    )
  }

  if (done) {
    return (
      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <CheckCircle className="size-12 text-green-500" />
          </div>
          <CardTitle>Contraseña restablecida</CardTitle>
          <CardDescription>Tu contraseña ha sido actualizada exitosamente.</CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/login">
            <Button className="w-full">Iniciar sesión</Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Restablecer contraseña</CardTitle>
        <CardDescription>Ingresa tu nueva contraseña</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="password">Nueva contraseña</FieldLabel>
              <PasswordInput
                id="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="confirm">Confirmar contraseña</FieldLabel>
              <PasswordInput
                id="confirm"
                placeholder="••••••••"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
              />
            </Field>
            <Field>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 data-icon="inline-start" />}
                Restablecer contraseña
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}

export default function ResetPasswordPage() {
  return (
    <React.Suspense fallback={<div className="text-center py-8"><Loader2 className="size-8 animate-spin mx-auto" /></div>}>
      <ResetForm />
    </React.Suspense>
  )
}
