"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { CreateSiteSteps } from "@/components/create-site-steps"
import { api } from "@/lib/api-client"
import {
  ArrowLeft,
  Loader2,
  Check,
  Plus,
  RefreshCw,
  Lock,
  Sparkles,
  AlertTriangle,
} from "lucide-react"
import { toast } from "sonner"

const WILDCARD = process.env.NEXT_PUBLIC_WILDCARD_DOMAIN || "wp.wpfacil.net"

export default function CreateSitePage() {
  const router = useRouter()
  const [step, setStep] = React.useState(1)
  const [creationType, setCreationType] = React.useState<"new" | "migrate">("new")
  const [loading, setLoading] = React.useState(false)
  const [plans, setPlans] = React.useState<any[]>([])
  const [loadingPlans, setLoadingPlans] = React.useState(true)
  const [selectedPlan, setSelectedPlan] = React.useState("")
  const [form, setForm] = React.useState({
    name: "",
    subdomain: "",
    useCustomDomain: false,
  })
  const [domainMode, setDomainMode] = React.useState<"free" | "other">("free")
  const [freePrefix, setFreePrefix] = React.useState("")
  const [randomSuffix, setRandomSuffix] = React.useState("")

  React.useEffect(() => {
    api
      .get<any[]>("/api/plans")
      .then((data) => {
        setPlans(data)
        if (data.length > 0) setSelectedPlan(data[0].slug)
      })
      .catch(() => {})
      .finally(() => setLoadingPlans(false))
  }, [])

  React.useEffect(() => {
    if (step === 3 && !randomSuffix) {
      const prefix = form.name ? slugify(form.name) : "sitio"
      const suffix = Math.random().toString(36).substring(2, 8)
      setFreePrefix(prefix)
      setRandomSuffix(suffix)
      setForm((prev) => ({ ...prev, subdomain: `${prefix}-${suffix}` }))
    }
  }, [step, randomSuffix, form.name])

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

  function handlePrefixChange(value: string) {
    const prefix = slugify(value)
    setFreePrefix(prefix)
    setForm((prev) => ({ ...prev, subdomain: `${prefix}-${randomSuffix}` }))
  }

  function canContinue() {
    if (step === 1) return creationType === "new"
    if (step === 2) return !!form.name
    if (step === 3) {
      if (domainMode === "free") return !!freePrefix && !!randomSuffix
      return !!form.subdomain
    }
    return !!selectedPlan
  }

  function handleNext() {
    if (step < 4) {
      setStep(step + 1)
    } else {
      handleCreate()
    }
  }

  async function handleCreate() {
    if (!form.name || !form.subdomain || !selectedPlan) {
      toast.error("Completa todos los campos")
      return
    }
    const plan = plans.find((p) => p.slug === selectedPlan)
    if (!plan) {
      toast.error("Plan no encontrado")
      return
    }
    if (!plan.priceId) {
      toast.error("Este plan no tiene un precio configurado en Stripe")
      return
    }
    setLoading(true)
    try {
      sessionStorage.setItem("wpfacil_create_name", form.name)
      sessionStorage.setItem("wpfacil_create_subdomain", form.subdomain)
      sessionStorage.setItem("wpfacil_create_plan", selectedPlan)
      const res = await api.post<{ url: string }>("/api/stripe/checkout", {
        planId: plan.id,
      })
      window.location.href = res.url
    } catch (err: any) {
      toast.error(err?.message || "Error al iniciar el pago")
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background px-4 py-4 sm:px-6">
        <div className="mx-auto grid max-w-3xl grid-cols-[auto_1fr_auto] items-center gap-4">
          <div className="justify-self-start">
            {step > 1 && (
              <Button
                variant="ghost"
                onClick={() => setStep(step - 1)}
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="mr-0 h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Atrás</span>
              </Button>
            )}
          </div>

          <div className="mx-auto w-full max-w-xs sm:max-w-md">
            <CreateSiteSteps currentStep={step} totalSteps={4} />
          </div>

          <Button
            variant="ghost"
            className="justify-self-end text-muted-foreground hover:text-foreground"
            onClick={() => router.push("/dashboard")}
          >
            Cancelar
          </Button>
        </div>
      </header>

      <main className="flex-1 px-4 pb-40 pt-8 sm:px-6 sm:pt-12">
        <div className="mx-auto max-w-3xl space-y-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {step === 1 && "¿Qué quieres hacer?"}
              {step === 2 && "Nombra tu sitio web"}
              {step === 3 && "Configura tu dominio"}
              {step === 4 && "Selecciona un plan"}
            </h1>
            <p className="text-base text-muted-foreground sm:text-lg">
              {step === 1 &&
                "Selecciona si quieres crear un sitio nuevo o migrar uno existente."}
              {step === 2 &&
                "Elige un nombre para identificar tu sitio en el panel."}
              {step === 3 &&
                "Elige el subdominio que tendrá tu sitio."}
              {step === 4 &&
                "Selecciona el plan que mejor se adapte a tu sitio."}
            </p>
          </div>

          <div className="space-y-6">
            {step === 1 && (
              <RadioGroup
                value={creationType}
                onValueChange={(value) => setCreationType(value as "new" | "migrate")}
                className="grid gap-4 md:grid-cols-2"
              >
                <div>
                  <RadioGroupItem
                    value="new"
                    id="creation-new"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="creation-new"
                    className="relative flex cursor-pointer flex-col items-start gap-4 rounded-xl border-2 border-border p-6 transition-all hover:shadow-md peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 hover:border-primary/50"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Plus className="h-6 w-6" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-lg font-semibold">Crear sitio WordPress</h3>
                      <p className="text-sm text-muted-foreground">
                        Empieza un sitio nuevo desde cero con WordPress.
                      </p>
                    </div>
                  </Label>
                </div>

                <div>
                  <RadioGroupItem
                    value="migrate"
                    id="creation-migrate"
                    className="peer sr-only"
                    disabled
                  />
                  <Label
                    htmlFor="creation-migrate"
                    className="relative flex cursor-not-allowed flex-col items-start gap-4 rounded-xl border-2 border-border bg-muted/30 p-6 opacity-60"
                  >
                    <Badge
                      variant="secondary"
                      className="absolute right-4 top-4"
                    >
                      Próximamente
                    </Badge>
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                      <RefreshCw className="h-6 w-6" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-lg font-semibold">Migrar sitio WordPress</h3>
                      <p className="text-sm text-muted-foreground">
                        Trae tu sitio existente desde otro hosting.
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Lock className="h-4 w-4" />
                      <span>Disponible muy pronto</span>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            )}

            {step === 2 && (
              <div className="space-y-3">
                <Label htmlFor="site-name" className="text-base font-medium">
                  Nombre del sitio
                </Label>
                <Input
                  id="site-name"
                  placeholder="Mi sitio WordPress"
                  value={form.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="h-12 text-base focus-visible:ring-primary"
                />
                <p className="text-sm text-muted-foreground">
                  Este nombre se usará para identificar tu sitio en el panel.
                </p>
              </div>
            )}

            {step === 3 && (
              <RadioGroup
                value={domainMode}
                onValueChange={(value) => setDomainMode(value as "free" | "other")}
                className="space-y-4"
              >
                <div>
                  <RadioGroupItem
                    value="free"
                    id="domain-free"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="domain-free"
                    className="flex w-full cursor-pointer flex-col items-start gap-4 rounded-xl border-2 border-border p-5 transition-all hover:shadow-md peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 hover:border-primary/50"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1 space-y-1">
                        <div className="font-semibold">Dominio gratuito de WPFacil</div>
                        <div className="text-sm text-muted-foreground">
                          Usa un subdominio gratuito para empezar.
                        </div>
                      </div>
                    </div>
                    {domainMode === "free" && (
                      <div className="w-full space-y-2">
                        <Label htmlFor="domain-prefix" className="text-base font-medium">
                          Subdominio
                        </Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id="domain-prefix"
                            value={freePrefix}
                            onChange={(e) => handlePrefixChange(e.target.value)}
                            className="h-12 flex-1 text-base focus-visible:ring-primary"
                          />
                          <span className="text-base text-muted-foreground whitespace-nowrap">
                            -{randomSuffix}.{WILDCARD}
                          </span>
                        </div>
                      </div>
                    )}
                  </Label>
                </div>

                <div>
                  <RadioGroupItem
                    value="other"
                    id="domain-other"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="domain-other"
                    className="flex w-full cursor-pointer flex-col items-start gap-4 rounded-xl border-2 border-border p-5 transition-all hover:shadow-md peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 hover:border-primary/50"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1 space-y-1">
                        <div className="font-semibold">Dominio de otro proveedor</div>
                        <div className="text-sm text-muted-foreground">
                          Usa un dominio que ya hayas comprado.
                        </div>
                      </div>
                    </div>
                    {domainMode === "other" && (
                      <div className="w-full space-y-3">
                        <div className="space-y-2">
                          <Label htmlFor="domain-prefix-other" className="text-base font-medium">
                            Subdominio temporal
                          </Label>
                          <div className="flex items-center gap-2">
                            <Input
                              id="domain-prefix-other"
                              value={freePrefix}
                              onChange={(e) => handlePrefixChange(e.target.value)}
                              className="h-12 flex-1 text-base focus-visible:ring-primary"
                            />
                            <span className="text-base text-muted-foreground whitespace-nowrap">
                              -{randomSuffix}.{WILDCARD}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
                          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                          <span>
                            Podrás conectar tu dominio después de crear tu sitio web.
                          </span>
                        </div>
                      </div>
                    )}
                  </Label>
                </div>
              </RadioGroup>
            )}

            {step === 4 && (
              <div>
                {loadingPlans ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="size-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {plans.map((plan) => (
                      <button
                        type="button"
                        key={plan.slug}
                        onClick={() => setSelectedPlan(plan.slug)}
                        className={cn(
                          "relative rounded-xl border-2 p-5 text-left transition-all hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                          selectedPlan === plan.slug
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        )}
                      >
                        <div className="space-y-4">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-semibold">{plan.name}</h3>
                            {selectedPlan === plan.slug && (
                              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                                <Check className="h-3.5 w-3.5" />
                              </div>
                            )}
                          </div>
                          <div>
                            <span className="text-2xl font-bold">
                              ${Number(plan.price).toFixed(2)}
                            </span>
                            <span className="text-sm text-muted-foreground">/mes</span>
                          </div>
                          <ul className="space-y-2 text-sm">
                            <li className="flex items-center gap-2">
                              <Check className="size-4 text-green-500" />
                              <span>
                                {plan.maxStorage >= 1024
                                  ? `${(plan.maxStorage / 1024).toFixed(0)} GB`
                                  : `${plan.maxStorage} MB`}{" "}
                                almacenamiento
                              </span>
                            </li>
                          </ul>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 px-4 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 sm:px-6">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4">
          <Button
            size="lg"
            onClick={handleNext}
            disabled={loading || !canContinue()}
            className="h-14 w-full px-8 text-lg sm:w-auto sm:px-20"
          >
            {step === 4 && loading && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {step < 4 ? "Continuar" : "Crear Sitio"}
          </Button>
          <div className="hidden items-center gap-2 text-sm text-muted-foreground sm:flex">
            <Sparkles className="h-4 w-4" />
            <span>WPFacil</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
