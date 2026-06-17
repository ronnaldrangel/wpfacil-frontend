"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CreateSiteSteps } from "@/components/create-site-steps"
import { api } from "@/lib/api-client"
import { ArrowLeft, Loader2, X, Check } from "lucide-react"
import { toast } from "sonner"

export default function CreateSitePage() {
  const router = useRouter()
  const [step, setStep] = React.useState(1)
  const [loading, setLoading] = React.useState(false)
  const [plans, setPlans] = React.useState<any[]>([])
  const [loadingPlans, setLoadingPlans] = React.useState(true)
  const [selectedPlan, setSelectedPlan] = React.useState("")
  const [form, setForm] = React.useState({
    name: "",
    subdomain: "",
    useCustomDomain: false,
  })

  React.useEffect(() => {
    api.get<any[]>("/api/plans").then((data) => {
      setPlans(data)
      if (data.length > 0) setSelectedPlan(data[0].slug)
    }).catch(() => {}).finally(() => setLoadingPlans(false))
  }, [])

  function slugify(text: string) {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_]+/g, "-")
      .replace(/^-+|-+$/g, "")
  }

  function handleNameChange(name: string) {
    setForm((prev) => ({
      ...prev,
      name,
      subdomain: slugify(name),
    }))
  }

  async function handleCreate() {
    if (!form.name || !form.subdomain || !selectedPlan) {
      toast.error("Completa todos los campos")
      return
    }
    const plan = plans.find((p) => p.slug === selectedPlan)
    if (!plan) { toast.error("Plan no encontrado"); return }
    if (!plan.priceId) {
      toast.error("Este plan no tiene un precio configurado en Stripe")
      return
    }
    setLoading(true)
    try {
      sessionStorage.setItem("wpfacil_create_name", form.name)
      sessionStorage.setItem("wpfacil_create_subdomain", form.subdomain)
      sessionStorage.setItem("wpfacil_create_plan", selectedPlan)
      const res = await api.post<{ url: string }>("/api/stripe/checkout", { planId: plan.id })
      window.location.href = res.url
    } catch (err: any) {
      toast.error(err?.message || "Error al iniciar el pago")
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-8">
        <div className="relative text-center">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0"
            onClick={() => router.push("/dashboard")}
          >
            <X className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Crear Nuevo Sitio</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Configura tu sitio WordPress en pocos pasos
          </p>
        </div>

        <CreateSiteSteps currentStep={step} totalSteps={3} />

        <Card>
          <CardHeader>
            <CardTitle>
              {step === 1 ? "Nombre del Sitio" : step === 2 ? "Configurar Dominio" : "Elegir Plan"}
            </CardTitle>
            <CardDescription>
              {step === 1
                ? "¿Cómo se llamará tu sitio web?"
                : step === 2
                ? "Elige un subdominio para tu sitio"
                : "Selecciona el plan para este sitio"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {step === 1 && (
              <div className="space-y-2">
                <Label htmlFor="site-name">Nombre del sitio</Label>
                <Input
                  id="site-name"
                  placeholder="Mi sitio WordPress"
                  value={form.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                />
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="subdomain">Subdominio</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="subdomain"
                      value={form.subdomain}
                      onChange={(e) =>
                        setForm({ ...form, subdomain: slugify(e.target.value) })
                      }
                      className="flex-1"
                    />
                    <span className="text-sm text-muted-foreground whitespace-nowrap">
                      .wpfacil.com
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="custom-domain"
                    checked={form.useCustomDomain}
                    onChange={(e) =>
                      setForm({ ...form, useCustomDomain: e.target.checked })
                    }
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <Label htmlFor="custom-domain" className="text-sm font-normal">
                    Tengo mi propio dominio
                  </Label>
                </div>
                {form.useCustomDomain && (
                  <p className="text-sm text-muted-foreground">
                    Podrás conectarlo después de crear tu sitio
                  </p>
                )}
              </div>
            )}

            {step === 3 && (
              <div>
                {loadingPlans ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="size-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-3">
                    {plans.map((plan) => (
                      <div
                        key={plan.slug}
                        className={`relative rounded-lg border-2 p-6 cursor-pointer transition-all hover:shadow-lg ${
                          selectedPlan === plan.slug
                            ? "border-primary"
                            : "border-border hover:border-primary/50"
                        }`}
                        onClick={() => setSelectedPlan(plan.slug)}
                      >
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold">{plan.name}</h3>
                          <p className="text-3xl font-bold">
                            ${Number(plan.price).toFixed(2)}
                            <span className="text-sm font-normal text-muted-foreground">/mes</span>
                          </p>
                          <ul className="space-y-2 text-sm">
                            <li className="flex items-center gap-2">
                              <Check className="size-4 text-green-500" />
                              {plan.maxStorage >= 1024
                                ? `${(plan.maxStorage / 1024).toFixed(0)} GB`
                                : `${plan.maxStorage} MB`} almacenamiento
                            </li>
                          </ul>
                          {selectedPlan === plan.slug && (
                            <div className="flex items-center justify-center gap-2 text-sm font-medium text-primary">
                              <Check className="size-4" />
                              Seleccionado
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => step > 1 && setStep(step - 1)}
            disabled={step === 1}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Atrás
          </Button>

          {step < 3 ? (
            <Button onClick={() => setStep(step + 1)} disabled={step === 1 ? !form.name : !form.subdomain}>
              Continuar
            </Button>
          ) : (
            <Button onClick={handleCreate} disabled={loading || !selectedPlan}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Crear Sitio
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
