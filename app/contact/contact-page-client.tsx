"use client"

import * as React from "react"
import { MarketingLayout } from "@/components/marketing-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Field, FieldLabel, FieldGroup } from "@/components/ui/field"
import { Mail, MapPin, Loader2, CheckCircle2 } from "lucide-react"
import { api } from "@/lib/api-client"
import { toast } from "sonner"
import { Turnstile } from "@marsidev/react-turnstile"

const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ""

export function ContactPageClient() {
  const [form, setForm] = React.useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    message: "",
  })
  const [token, setToken] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [sent, setSent] = React.useState(false)

  function handleChange(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!token) {
      toast.error("Por favor completa la verificación de seguridad")
      return
    }
    setLoading(true)
    try {
      await api.post("/api/contacts", { ...form, turnstileToken: token })
      setSent(true)
      setForm({ firstName: "", lastName: "", email: "", phone: "", message: "" })
      setToken("")
    } catch (err: any) {
      toast.error(err?.message || "Error al enviar el mensaje")
    } finally {
      setLoading(false)
    }
  }

  return (
    <MarketingLayout>
      <main className="py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold md:text-4xl">Contáctanos</h1>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
              ¿Tienes preguntas sobre WPFacil? Escríbenos y nuestro equipo te responderá lo antes posible.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Envía un mensaje</CardTitle>
                <CardDescription>Completa el formulario y te responderemos por email.</CardDescription>
              </CardHeader>
              <CardContent>
                {sent ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="flex size-14 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                      <CheckCircle2 className="size-7 text-green-600" />
                    </div>
                    <h3 className="mt-4 text-xl font-semibold">¡Mensaje enviado!</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Gracias por contactarnos. Hemos recibido tu mensaje y te responderemos pronto.
                    </p>
                    <Button className="mt-6" variant="outline" onClick={() => setSent(false)}>
                      Enviar otro mensaje
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <div className="grid gap-5 sm:grid-cols-2">
                      <Field>
                        <FieldLabel htmlFor="firstName">Nombre *</FieldLabel>
                        <Input
                          id="firstName"
                          required
                          value={form.firstName}
                          onChange={(e) => handleChange("firstName", e.target.value)}
                          maxLength={100}
                        />
                      </Field>
                      <Field>
                        <FieldLabel htmlFor="lastName">Apellido *</FieldLabel>
                        <Input
                          id="lastName"
                          required
                          value={form.lastName}
                          onChange={(e) => handleChange("lastName", e.target.value)}
                          maxLength={100}
                        />
                      </Field>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                      <Field>
                        <FieldLabel htmlFor="email">Correo electrónico *</FieldLabel>
                        <Input
                          id="email"
                          type="email"
                          required
                          value={form.email}
                          onChange={(e) => handleChange("email", e.target.value)}
                          maxLength={255}
                        />
                      </Field>
                      <Field>
                        <FieldLabel htmlFor="phone">Teléfono</FieldLabel>
                        <Input
                          id="phone"
                          type="tel"
                          value={form.phone}
                          onChange={(e) => handleChange("phone", e.target.value)}
                          maxLength={30}
                        />
                      </Field>
                    </div>

                    <Field>
                      <FieldLabel htmlFor="message">Mensaje *</FieldLabel>
                      <Textarea
                        id="message"
                        required
                        rows={5}
                        value={form.message}
                        onChange={(e) => handleChange("message", e.target.value)}
                        maxLength={2000}
                      />
                      <p className="text-xs text-muted-foreground">{form.message.length}/2000</p>
                    </Field>

                    {siteKey && (
                      <div className="pt-2">
                        <Turnstile
                          siteKey={siteKey}
                          onSuccess={setToken}
                          onError={() => {
                            setToken("")
                            toast.error("Error en la verificación de seguridad")
                          }}
                          onExpire={() => setToken("")}
                          options={{
                            theme: "auto",
                            size: "normal",
                          }}
                        />
                      </div>
                    )}

                    <Button type="submit" disabled={loading || !token} className="w-full sm:w-auto">
                      {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
                      Enviar mensaje
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Información de contacto</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Mail className="size-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Email</p>
                      <p className="text-sm text-muted-foreground">soporte@wpfacil.com</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="size-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Oficina</p>
                      <p className="text-sm text-muted-foreground">NEOPATRON LTD</p>
                      <p className="text-sm text-muted-foreground">Unit 82a James Carter Road, Mildenhall, Bury St. Edmunds, England, IP28 7DE</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </MarketingLayout>
  )
}
