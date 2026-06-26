"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { CreateSiteSteps } from "@/components/create-site-steps"
import { PeriodToggle } from "@/components/period-toggle"
import { PageLoader } from "@/components/page-loader"
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
  Eye,
  EyeOff,
  KeyRound,
} from "lucide-react"
import { toast } from "sonner"

const WILDCARD = process.env.NEXT_PUBLIC_WILDCARD_DOMAIN || "wp.wpfacil.net"

export default function CreateSitePage() {
  return (
    <React.Suspense fallback={<PageLoader />}>
      <CreateSiteContent />
    </React.Suspense>
  )
}

function generatePassword(length = 16): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*"
  let pwd = ""
  for (let i = 0; i < length; i++) {
    pwd += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return pwd
}

function CreateSiteContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const slotId = searchParams.get("slotId")
  const slotPlan = searchParams.get("plan")
  const [step, setStep] = React.useState(1)
  const [creationType, setCreationType] = React.useState<"new" | "migrate">("new")
  const [loading, setLoading] = React.useState(false)
  const [plans, setPlans] = React.useState<any[]>([])
  const [loadingPlans, setLoadingPlans] = React.useState(true)
  const [selectedPlan, setSelectedPlan] = React.useState(slotPlan || "")
  const [period, setPeriod] = React.useState<"monthly" | "annual">("monthly")
  const [showPassword, setShowPassword] = React.useState(false)
  const [form, setForm] = React.useState({
    name: "",
    subdomain: "",
    useCustomDomain: false,
    wpTitle: "",
    wpAdminUser: "",
    wpAdminEmail: "",
    wpAdminPassword: "",
  })
  const [domainMode, setDomainMode] = React.useState<"free" | "other">("free")
  const [freePrefix, setFreePrefix] = React.useState("")
  const [randomSuffix, setRandomSuffix] = React.useState("")

  React.useEffect(() => {
    api
      .get<any[]>('/api/plans')
      .then((data) => {
        setPlans(data)
        if (slotPlan) {
          setSelectedPlan(slotPlan)
          const p = data.find((p) => p.slug === slotPlan)
          if (p) setPeriod(p.period)
        } else {
          const first = data.find((p) => p.period === period)
          if (first) setSelectedPlan(first.slug)
        }
      })
      .catch(() => {})
      .finally(() => setLoadingPlans(false))
  }, [])

  React.useEffect(() => {
    if (step === 4 && !randomSuffix) {
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

  const totalSteps = slotId ? 4 : 5

  function canContinue() {
    if (step === 1) return creationType === "new"
    if (step === 2) return !!form.name
    if (step === 3) {
      return (
        !!form.wpTitle &&
        !!form.wpAdminUser &&
        !!form.wpAdminEmail &&
        form.wpAdminPassword.length >= 8
      )
    }
    if (step === 4) {
      if (domainMode === "free") return !!freePrefix && !!randomSuffix
      return !!form.subdomain
    }
    return !!selectedPlan
  }

  function handleNext() {
    if (step < totalSteps) {
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
    if (!slotId && !plan.monthlyPriceId && !plan.annualPriceId) {
      toast.error("Este plan no tiene precios configurados en Stripe")
      return
    }
    setLoading(true)
    try {
      const payload = {
        name: form.name,
        subdomain: form.subdomain,
        plan: selectedPlan,
        slotId,
        wpTitle: form.wpTitle,
        wpAdminUser: form.wpAdminUser,
        wpAdminEmail: form.wpAdminEmail,
        wpAdminPassword: form.wpAdminPassword,
      }
      if (slotId) {
        await api.post("/api/sites", payload)
        toast.success("Sitio creado. Desplegando...")
        router.push("/dashboard")
        return
      }
      sessionStorage.setItem("wpfacil_create_name", form.name)
      sessionStorage.setItem("wpfacil_create_subdomain", form.subdomain)
      sessionStorage.setItem("wpfacil_create_plan", selectedPlan)
      sessionStorage.setItem("wpfacil_create_wpTitle", form.wpTitle)
      sessionStorage.setItem("wpfacil_create_wpAdminUser", form.wpAdminUser)
      sessionStorage.setItem("wpfacil_create_wpAdminEmail", form.wpAdminEmail)
      sessionStorage.setItem("wpfacil_create_wpAdminPassword", form.wpAdminPassword)
      const res = await api.post<{ url: string }>("/api/stripe/checkout", {
        planId: plan.id,
        period,
      })
      window.location.href = res.url
    } catch (err: any) {
      toast.error(err?.message || "Error al crear el sitio")
      setLoading(false)
    }
  }

  const sortedPlans = React.useMemo(() => {
    return [...plans].sort((a, b) => Number(a.monthlyPrice) - Number(b.monthlyPrice))
  }, [plans])

  React.useEffect(() => {
    if (slotPlan) return
    if (!selectedPlan || !plans.find((p) => p.slug === selectedPlan)) {
      if (plans.length > 0) setSelectedPlan(plans[0].slug)
    }
  }, [plans, selectedPlan, slotPlan])

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
            <CreateSiteSteps currentStep={step} totalSteps={totalSteps} />
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
              {step === 3 && "Configura tu WordPress"}
              {step === 4 && "Configura tu dominio"}
              {step === 5 && "Selecciona un plan"}
            </h1>
            <p className="text-base text-muted-foreground sm:text-lg">
              {step === 1 &&
                "Selecciona si quieres crear un sitio nuevo o migrar uno existente."}
              {step === 2 &&
                "Elige un nombre para identificar tu sitio en el panel."}
              {step === 3 &&
                "Define el título y los datos del administrador de tu WordPress."}
              {step === 4 &&
                "Elige el subdominio que tendrá tu sitio."}
              {step === 5 &&
                "Selecciona el plan y la frecuencia de pago que prefieras."}
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
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="wp-title" className="text-base font-medium">
                    Título del sitio
                  </Label>
                  <Input
                    id="wp-title"
                    placeholder="Mi sitio WordPress"
                    value={form.wpTitle}
                    onChange={(e) => setForm((prev) => ({ ...prev, wpTitle: e.target.value }))}
                    className="h-12 text-base focus-visible:ring-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="wp-admin-user" className="text-base font-medium">
                    Usuario administrador
                  </Label>
                  <Input
                    id="wp-admin-user"
                    placeholder="admin"
                    value={form.wpAdminUser}
                    onChange={(e) => setForm((prev) => ({ ...prev, wpAdminUser: e.target.value }))}
                    className="h-12 text-base focus-visible:ring-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="wp-admin-email" className="text-base font-medium">
                    Correo del administrador
                  </Label>
                  <Input
                    id="wp-admin-email"
                    type="email"
                    placeholder="admin@tusitio.com"
                    value={form.wpAdminEmail}
                    onChange={(e) => setForm((prev) => ({ ...prev, wpAdminEmail: e.target.value }))}
                    className="h-12 text-base focus-visible:ring-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="wp-admin-password" className="text-base font-medium">
                    Contraseña del administrador
                  </Label>
                  <div className="relative">
                    <Input
                      id="wp-admin-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Mínimo 8 caracteres"
                      value={form.wpAdminPassword}
                      onChange={(e) => setForm((prev) => ({ ...prev, wpAdminPassword: e.target.value }))}
                      className="h-12 pr-20 text-base focus-visible:ring-primary"
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                      <button
                        type="button"
                        title="Generar contraseña"
                        onClick={() => {
                          const pwd = generatePassword()
                          setForm((prev) => ({ ...prev, wpAdminPassword: pwd }))
                          setShowPassword(true)
                        }}
                        className="text-muted-foreground hover:text-primary p-1"
                      >
                        <KeyRound className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="text-muted-foreground p-1"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Debe tener al menos 8 caracteres.
                  </p>
                </div>
              </div>
            )}

            {step === 4 && (
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

            {step === 5 && (
              <div className="space-y-6">
                {!slotPlan && (
                  <div className="flex justify-center">
                    <PeriodToggle value={period} onChange={setPeriod} />
                  </div>
                )}

                {loadingPlans ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="size-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {sortedPlans.map((plan) => {
                      const price = period === "monthly" ? plan.monthlyPrice : plan.annualPrice
                      return (
                        <button
                          type="button"
                          key={plan.slug}
                          onClick={() => !slotId && setSelectedPlan(plan.slug)}
                          className={cn(
                            "relative rounded-xl border-2 p-5 text-left transition-all hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                            selectedPlan === plan.slug
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50",
                            slotId && "cursor-default"
                          )}
                        >
                          <div className="space-y-4">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h3 className="font-semibold">{plan.name}</h3>
                                <p className="text-xs text-muted-foreground capitalize">
                                  {period === "monthly" ? "mensual" : "anual"}
                                </p>
                              </div>
                              {selectedPlan === plan.slug && (
                                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                                  <Check className="h-3.5 w-3.5" />
                                </div>
                              )}
                            </div>
                            <div>
                              <span className="text-2xl font-bold">
                                ${Number(price).toFixed(2)}
                              </span>
                              <span className="text-sm text-muted-foreground">
                                /{period === "monthly" ? "mes" : "año"}
                              </span>
                            </div>
                            <ul className="space-y-2 text-sm">
                              {Array.isArray(plan.features) && plan.features.length > 0 ? (
                                plan.features.map((feature: string, idx: number) => (
                                  <li key={idx} className="flex items-start gap-2">
                                    <Check className="mt-0.5 size-4 shrink-0 text-green-500" />
                                    <span>{feature}</span>
                                  </li>
                                ))
                              ) : (
                                <li className="flex items-center gap-2">
                                  <Check className="size-4 text-green-500" />
                                  <span>
                                    {plan.maxStorage >= 1024
                                      ? `${(plan.maxStorage / 1024).toFixed(0)} GB`
                                      : `${plan.maxStorage} MB`}{" "}
                                    almacenamiento
                                  </span>
                                </li>
                              )}
                            </ul>
                          </div>
                        </button>
                      )
                    })}
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
            {step === totalSteps && loading && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {step < totalSteps ? "Continuar" : "Crear Sitio"}
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
