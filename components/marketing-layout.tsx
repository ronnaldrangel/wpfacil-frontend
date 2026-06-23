"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"
import { Menu, X, Sun, Moon } from "lucide-react"

export function MarketingLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = React.useState(false)
  const [mounted, setMounted] = React.useState(false)
  const { theme, setTheme } = useTheme()

  React.useEffect(() => setMounted(true), [])

  const isHome = pathname === "/"

  function scrollTo(id: string) {
    setMenuOpen(false)
    if (isHome) {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })
    }
  }

  const navLink = (id: string, label: string) => {
    if (isHome) {
      return (
        <Button
          variant="link"
          onClick={() => scrollTo(id)}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          {label}
        </Button>
      )
    }
    return (
      <Button variant="link" asChild className="text-sm text-muted-foreground hover:text-foreground">
        <Link href={`/#${id}`}>{label}</Link>
      </Button>
    )
  }

  const mobileNavLink = (id: string, label: string) => {
    if (isHome) {
      return (
        <Button
          variant="ghost"
          onClick={() => scrollTo(id)}
          className="justify-start text-sm text-muted-foreground hover:text-foreground"
        >
          {label}
        </Button>
      )
    }
    return (
      <Button variant="ghost" asChild className="justify-start text-sm text-muted-foreground hover:text-foreground">
        <Link href={`/#${id}`}>{label}</Link>
      </Button>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo/logo_theme_white.svg?v=1" alt="WPFacil" className="h-8 w-auto dark:hidden" />
            <img src="/logo/logo_theme_black.svg?v=1" alt="WPFacil" className="hidden h-8 w-auto dark:block" />
          </Link>
          <nav className="hidden items-center gap-2 md:flex">
            {navLink("features", "Características")}
            {navLink("pricing", "Planes")}
            {navLink("why", "Por qué WPFacil")}
            <Button variant="link" asChild className="text-sm text-muted-foreground hover:text-foreground">
              <Link href="/contact">Contacto</Link>
            </Button>
          </nav>
          <div className="hidden items-center gap-1 md:flex">
            <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
              {mounted && theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/login">Iniciar Sesión</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Comenzar ahora</Link>
            </Button>
          </div>
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
          {menuOpen && (
          <div className="border-t bg-background p-4 md:hidden">
            <nav className="flex flex-col gap-1">
              {mobileNavLink("features", "Características")}
              {mobileNavLink("pricing", "Planes")}
              {mobileNavLink("why", "Por qué WPFacil")}
              <Button variant="ghost" asChild className="justify-start text-sm text-muted-foreground hover:text-foreground">
                <Link href="/contact">Contacto</Link>
              </Button>
              <div className="flex flex-col gap-2 border-t pt-2">
                <Button variant="ghost" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                  {mounted && theme === "dark" ? <Sun className="mr-2 size-4" /> : <Moon className="mr-2 size-4" />}
                  {mounted && theme === "dark" ? "Modo claro" : "Modo oscuro"}
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/login">Iniciar Sesión</Link>
                </Button>
                <Button asChild>
                  <Link href="/register">Comenzar ahora</Link>
                </Button>
              </div>
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1 pt-16">{children}</main>

      <footer className="border-t bg-background/80 py-12 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="md:col-span-1">
              <Link href="/" className="flex items-center gap-2">
                <img src="/logo/logo_theme_white.svg?v=1" alt="WPFacil" className="h-6 w-auto dark:hidden" />
                <img src="/logo/logo_theme_black.svg?v=1" alt="WPFacil" className="hidden h-6 w-auto dark:block" />
              </Link>
              <p className="mt-3 text-sm text-muted-foreground">
                Plataforma de hosting WordPress ultrarrápido y fácil de usar.
              </p>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-semibold">Producto</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/#features" className="hover:text-foreground transition-colors">
                    Características
                  </Link>
                </li>
                <li>
                  <Link href="/#pricing" className="hover:text-foreground transition-colors">
                    Planes
                  </Link>
                </li>
                <li>
                  <Link href="/#why" className="hover:text-foreground transition-colors">
                    Por qué WPFacil
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-semibold">Recursos</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/login" className="hover:text-foreground transition-colors">
                    Iniciar sesión
                  </Link>
                </li>
                <li>
                  <Link href="/register" className="hover:text-foreground transition-colors">
                    Crear cuenta
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-semibold">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/terms" className="hover:text-foreground transition-colors">
                    Términos del servicio
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-foreground transition-colors">
                    Política de privacidad
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-foreground transition-colors">
                    Contacto
                  </Link>
                </li>
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
