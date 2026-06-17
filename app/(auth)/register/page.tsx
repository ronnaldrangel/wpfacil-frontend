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
import { PasswordInput } from "@/components/ui/password-input"
import { Button } from "@/components/ui/button"
import { api } from "@/lib/api-client"
import { Loader2, MailCheck, Check, X } from "lucide-react"
import { toast } from "sonner"

const PASSWORD_RULES = [
  { label: "Una letra mayúscula", test: (p: string) => /[A-Z]/.test(p) },
  { label: "Una letra minúscula", test: (p: string) => /[a-z]/.test(p) },
  { label: "Un número", test: (p: string) => /\d/.test(p) },
  { label: "Un carácter especial (!?<>@#$%)", test: (p: string) => /[!?<>@#$%]/.test(p) },
  { label: "Mínimo 8 caracteres", test: (p: string) => p.length >= 8 },
]

export default function RegisterPage() {
  const [loading, setLoading] = React.useState(false)
  const [registered, setRegistered] = React.useState(false)
  const [form, setForm] = React.useState({ name: "", email: "", password: "" })

  const allValid = PASSWORD_RULES.every((r) => r.test(form.password))
  const canSubmit = form.name && form.email && form.password && allValid

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    setLoading(true)
    try {
      await api.post("/api/auth/register", {
        name: form.name,
        email: form.email,
        password: form.password,
      })
      setRegistered(true)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al crear la cuenta")
    } finally {
      setLoading(false)
    }
  }

  if (registered) {
    return (
      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <MailCheck className="size-12 text-primary" />
          </div>
          <CardTitle>Revisa tu email</CardTitle>
          <CardDescription>
            Te enviamos un enlace de verificación a <strong>{form.email}</strong>.
            Haz clic en el enlace para activar tu cuenta.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground text-center">
            ¿No recibiste el email? Revisa tu carpeta de spam o intenta de nuevo.
          </p>
          <Button variant="outline" className="w-full" onClick={() => setRegistered(false)}>
            Volver al registro
          </Button>
          <Link href="/login" className="text-center">
            <Button variant="link" className="w-full">Ir a iniciar sesión</Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Crear Cuenta</CardTitle>
        <CardDescription>Regístrate para empezar a crear sitios</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="name">Nombre completo</FieldLabel>
              <Input
                id="name"
                placeholder="Tu nombre"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="email">Correo electrónico</FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="tu@correo.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="password">Contraseña</FieldLabel>
              <PasswordInput
                id="password"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
              {form.password.length > 0 && (
                <div className="space-y-1 pt-1">
                  {PASSWORD_RULES.map((rule, i) => {
                    const valid = rule.test(form.password)
                    return (
                      <div key={i} className="flex items-center gap-2 text-xs">
                        {valid ? (
                          <Check className="size-3 text-green-500 shrink-0" />
                        ) : (
                          <X className="size-3 text-muted-foreground shrink-0" />
                        )}
                        <span className={valid ? "text-green-600" : "text-muted-foreground"}>
                          {rule.label}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </Field>
            <Field>
              <Button type="submit" className="w-full" disabled={loading || !canSubmit}>
                {loading && <Loader2 data-icon="inline-start" />}
                Crear cuenta
              </Button>
              <FieldDescription className="text-center">
                ¿Ya tienes cuenta?{" "}
                <Link href="/login">Iniciar sesión</Link>
              </FieldDescription>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
