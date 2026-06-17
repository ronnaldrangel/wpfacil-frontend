"use client"

import * as React from "react"
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
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { api } from "@/lib/api-client"
import { Loader2, MailCheck } from "lucide-react"
import { toast } from "sonner"

export default function ForgotPasswordPage() {
  const [email, setEmail] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [sent, setSent] = React.useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) { toast.error("Ingresa tu correo"); return }
    setLoading(true)
    try {
      await api.post("/api/auth/forgot-password", { email })
      setSent(true)
    } catch {
      toast.error("Error al enviar el correo")
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <MailCheck className="size-12 text-primary" />
          </div>
          <CardTitle>Revisa tu email</CardTitle>
          <CardDescription>
            Si existe una cuenta con <strong>{email}</strong>, recibirás un enlace para restablecer tu contraseña.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/login">
            <Button variant="link" className="w-full">Volver a iniciar sesión</Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>¿Olvidaste tu contraseña?</CardTitle>
        <CardDescription>Ingresa tu correo y te enviaremos un enlace para restablecerla</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="email">Correo electrónico</FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="tu@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Field>
            <Field>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 data-icon="inline-start" />}
                Enviar enlace
              </Button>
              <FieldDescription className="text-center">
                <Link href="/login">Volver a iniciar sesión</Link>
              </FieldDescription>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
