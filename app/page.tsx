"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Globe, Zap, Shield, Headphones, Server, Cloud, Check, Menu, X, Sun, Moon, Star } from "lucide-react"
import { useTheme } from "next-themes"
import * as React from "react"

const features = [
  { icon: Zap, title: "Despliegue rápido", desc: "Tu sitio WordPress activo en menos de 2 minutos" },
  { icon: Shield, title: "SSL automático", desc: "Certificados Let's Encrypt gratuitos con renovación automática" },
  { icon: Globe, title: "Subdominio gratis", desc: "tusitio.wpfacil.net incluido con cada sitio" },
  { icon: Server, title: "Backups automáticos", desc: "Copias de seguridad diarias con restauración en 1 clic" },
  { icon: Cloud, title: "CDN incorporado", desc: "Distribución global de contenido para carga instantánea" },
  { icon: Headphones, title: "Soporte experto", desc: "Equipo especializado en WordPress disponible 24/7" },
]

const plans = [
  { name: "Básico", slug: "basic", price: "$9.99", sites: "1 sitio", storage: "10 GB", popular: false },
  { name: "Pro", slug: "pro", price: "$13.99", sites: "5 sitios", storage: "50 GB", popular: true },
  { name: "Enterprise", slug: "enterprise", price: "$20.99", sites: "Ilimitados", storage: "200 GB", popular: false },
]

const testimonials = [
  { quote: "Migré 15 sitios en un día. El panel es increíblemente intuitivo y el soporte resolvió todo en minutos.", name: "Carlos M.", role: "Desarrollador Freelance" },
  { quote: "Desde que uso WPFacil, mis clientes notaron la velocidad. Los despliegues son instantáneos.", name: "María G.", role: "Agencia Digital" },
  { quote: "La mejor decisión fue migrar a WPFacil. Rendimiento superior y cero dolores de cabeza.", name: "Andrés L.", role: "CTO en StartUp" },
]

export default function HomePage() {
  const [menuOpen, setMenuOpen] = React.useState(false)
  const [mounted, setMounted] = React.useState(false)
  const { theme, setTheme } = useTheme()
  React.useEffect(() => setMounted(true), [])

  const scrollTo = (id: string) => {
    setMenuOpen(false)
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo/logo_theme_white.svg?v=1" alt="WPFacil" className="h-8 w-auto dark:hidden" />
            <img src="/logo/logo_theme_black.svg?v=1" alt="WPFacil" className="hidden h-8 w-auto dark:block" />
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            <button onClick={() => scrollTo("features")} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Características</button>
            <button onClick={() => scrollTo("pricing")} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Planes</button>
            <button onClick={() => scrollTo("why")} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Por qué WPFacil</button>
          </nav>
          <div className="hidden items-center gap-1 md:flex">
            <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
              {mounted && theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </Button>
            <Button variant="ghost" asChild><Link href="/login">Iniciar Sesión</Link></Button>
            <Button asChild><Link href="/register">Comenzar ahora</Link></Button>
          </div>
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
        {menuOpen && (
          <div className="border-t bg-background p-4 md:hidden">
            <nav className="flex flex-col gap-3">
              <button onClick={() => scrollTo("features")} className="text-sm text-muted-foreground hover:text-foreground">Características</button>
              <button onClick={() => scrollTo("pricing")} className="text-sm text-muted-foreground hover:text-foreground">Planes</button>
              <button onClick={() => scrollTo("why")} className="text-sm text-muted-foreground hover:text-foreground">Por qué WPFacil</button>
              <div className="flex flex-col gap-2 pt-2 border-t">
                <Button variant="ghost" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                  {mounted && theme === "dark" ? <Sun className="size-4 mr-2" /> : <Moon className="size-4 mr-2" />}
                  {mounted && theme === "dark" ? "Modo claro" : "Modo oscuro"}
                </Button>
                <Button variant="outline" asChild><Link href="/login">Iniciar Sesión</Link></Button>
                <Button asChild><Link href="/register">Comenzar ahora</Link></Button>
              </div>
            </nav>
          </div>
        )}
      </header>

      <main>
        {/* Hero */}
        <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
          <div className="mx-auto max-w-6xl px-4 text-center">
            <h1 className="text-3xl font-bold tracking-tight md:text-5xl lg:text-6xl">
              Crea y gestiona sitios{" "}
              <span className="text-primary">WordPress</span>
              <br />
              en segundos
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              Despliega sitios WordPress ultrarrápidos con SSL automático, CDN global y panel de control intuitivo.
              Sin complicaciones técnicas.
            </p>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" className="h-11 px-6 text-base" asChild>
                <Link href="/register">Comenzar ahora</Link>
              </Button>
            </div>
            <div className="mt-10 flex items-center justify-center gap-8">
              <div className="flex flex-col items-center">
                <span className="text-base font-medium">+1,200</span>
                <span className="text-xs text-muted-foreground">sitios desplegados</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-base font-medium">99.9%</span>
                <span className="text-xs text-muted-foreground">uptime garantizado</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-base font-medium">&lt; 2 min</span>
                <span className="text-xs text-muted-foreground">tiempo de despliegue</span>
              </div>
            </div>
          </div>
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--color-primary)_0%,_transparent_60%)] opacity-10" />
        </section>

        {/* Features */}
        <section id="features" className="py-20 md:py-28">
          <div className="mx-auto max-w-6xl px-4">
            <div className="text-center">
              <h2 className="text-3xl font-bold md:text-4xl">Todo lo que necesitas para tu WordPress</h2>
              <p className="mt-4 text-muted-foreground">Plataforma completa con herramientas inteligentes para que te enfoques en crecer</p>
            </div>
            <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {features.map((f) => (
                <Card key={f.title}>
                  <CardContent className="pt-6">
                    <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10">
                      <f.icon className="size-6 text-primary" />
                    </div>
                    <h3 className="mt-4 font-semibold">{f.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Why WPFacil */}
        <section id="why" className="bg-muted/30 py-20 md:py-28">
          <div className="mx-auto max-w-6xl px-4">
            <div className="text-center">
              <h2 className="text-3xl font-bold md:text-4xl">Por qué elegir WPFacil</h2>
              <p className="mt-4 text-muted-foreground">Tres pilares que nos diferencian</p>
            </div>
            <div className="mt-12 grid gap-8 md:grid-cols-3">
              <Card className="text-center">
                <CardContent className="pt-8 pb-6">
                  <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary/10">
                    <Zap className="size-7 text-primary" />
                  </div>
                  <h3 className="mt-5 text-xl font-semibold">Rendimiento</h3>
                  <p className="mt-3 text-sm text-muted-foreground">
                    Servidores optimizados específicamente para WordPress con caché avanzada y CDN global.
                    Tu sitio cargará en milisegundos.
                  </p>
                </CardContent>
              </Card>
              <Card className="text-center border-primary">
                <CardContent className="pt-8 pb-6">
                  <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary/10">
                    <Shield className="size-7 text-primary" />
                  </div>
                  <h3 className="mt-5 text-xl font-semibold">Seguridad</h3>
                  <p className="mt-3 text-sm text-muted-foreground">
                    WAF empresarial, protección DDoS, monitoreo 24/7 y certificados SSL automáticos.
                    Tu sitio y tus datos protegidos.
                  </p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="pt-8 pb-6">
                  <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary/10">
                    <Headphones className="size-7 text-primary" />
                  </div>
                  <h3 className="mt-5 text-xl font-semibold">Soporte</h3>
                  <p className="mt-3 text-sm text-muted-foreground">
                    Equipo de expertos en WordPress disponible 24/7. Resolvemos tus dudas en minutos,
                    no en días.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="bg-muted/30 py-20 md:py-28">
          <div className="mx-auto max-w-6xl px-4">
            <div className="text-center">
              <h2 className="text-3xl font-bold md:text-4xl">Planes simples y transparentes</h2>
              <p className="mt-4 text-muted-foreground">Sin sorpresas. Escoge el plan ideal para tu proyecto</p>
            </div>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {plans.map((plan) => (
                <Card key={plan.slug} className={plan.popular ? "relative border-primary shadow-lg overflow-visible" : ""}>
                  {plan.popular && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">Popular</Badge>
                  )}
                  <CardHeader className="text-center pb-0">
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <p className="mt-4">
                      <span className="text-4xl font-bold">{plan.price}</span>
                      <span className="text-sm text-muted-foreground">/mes</span>
                    </p>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <ul className="space-y-3">
                      <li className="flex items-center gap-2 text-sm">
                        <Check className="size-4 text-green-500 shrink-0" />
                        {plan.sites}
                      </li>
                      <li className="flex items-center gap-2 text-sm">
                        <Check className="size-4 text-green-500 shrink-0" />
                        {plan.storage} almacenamiento
                      </li>
                      <li className="flex items-center gap-2 text-sm">
                        <Check className="size-4 text-green-500 shrink-0" />
                        SSL automático
                      </li>
                      <li className="flex items-center gap-2 text-sm">
                        <Check className="size-4 text-green-500 shrink-0" />
                        CDN global
                      </li>
                      <li className="flex items-center gap-2 text-sm">
                        <Check className="size-4 text-green-500 shrink-0" />
                        Soporte 24/7
                      </li>
                    </ul>
                    <Button className="mt-6 w-full h-12 px-8 text-base" size="lg" variant={plan.popular ? "default" : "outline"} asChild>
                      <Link href="/register">Comenzar ahora</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="bg-muted/30">
          <div className="mx-auto max-w-6xl px-4 pt-16 pb-10 md:pt-24 md:pb-12 text-center">
            <h2 className="text-3xl font-bold md:text-4xl">Lo que dicen nuestros usuarios</h2>
            <p className="mt-4 text-muted-foreground">Más de 1,200 sitios confían en WPFacil</p>
          </div>
          <div className="mx-auto max-w-6xl px-4 pb-16 md:pb-24">
            <div className="grid gap-6 md:grid-cols-3">
              {testimonials.map((t, i) => (
                <Card key={i} className="!overflow-visible">
                  <CardContent className="pt-6">
                    <div className="flex gap-0.5 mb-3">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <Star key={j} className="size-4 fill-yellow-500 text-yellow-500" />
                      ))}
                    </div>
                    <p className="text-sm leading-relaxed text-muted-foreground">"{t.quote}"</p>
                    <div className="mt-6 border-t pt-4">
                      <p className="text-sm font-semibold">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.role}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Final */}
        <section className="bg-muted/30 py-20 md:py-28">
          <div className="mx-auto max-w-4xl px-4 text-center">
            <h2 className="text-3xl font-bold md:text-5xl">Comienza hoy. Crea tu primer sitio en 2 minutos.</h2>
            <p className="mt-6 text-lg text-muted-foreground">
              Sin tarjeta de crédito. Sin complicaciones.
            </p>
            <div className="mt-10">
              <Button size="lg" className="h-12 px-8 text-base" asChild>
                <Link href="/register">Comenzar ahora</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-background/80 backdrop-blur-md py-12">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="md:col-span-1">
              <a className="flex items-center gap-2">
                <img src="/logo/logo_theme_white.svg?v=1" alt="WPFacil" className="h-6 w-auto dark:hidden" />
                <img src="/logo/logo_theme_black.svg?v=1" alt="WPFacil" className="hidden h-6 w-auto dark:block" />
              </a>
              <p className="mt-3 text-sm text-muted-foreground">
                Plataforma de hosting WordPress ultrarrápido y fácil de usar.
              </p>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-semibold">Producto</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><button onClick={() => scrollTo("features")} className="hover:text-foreground transition-colors">Características</button></li>
                <li><button onClick={() => scrollTo("pricing")} className="hover:text-foreground transition-colors">Planes</button></li>
                <li><button onClick={() => scrollTo("why")} className="hover:text-foreground transition-colors">Por qué WPFacil</button></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-semibold">Recursos</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/login" className="hover:text-foreground transition-colors">Iniciar sesión</Link></li>
                <li><Link href="/register" className="hover:text-foreground transition-colors">Crear cuenta</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-semibold">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><span className="hover:text-foreground transition-colors cursor-pointer">Términos del servicio</span></li>
                <li><span className="hover:text-foreground transition-colors cursor-pointer">Política de privacidad</span></li>
              </ul>
            </div>
          </div>
          <div className="mt-10 border-t pt-6 text-center text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} WPFacil. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  )
}
