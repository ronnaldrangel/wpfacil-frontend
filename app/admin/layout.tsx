"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  BarChart3,
  Users,
  Globe,
  CreditCard,
  Settings,
  Menu,
  X,
  LogOut,
  ChevronDown,
} from "lucide-react"

const navItems = [
  { href: "/admin", label: "Dashboard", icon: BarChart3 },
  { href: "/admin/users", label: "Usuarios", icon: Users },
  { href: "/admin/sites", label: "Sitios", icon: Globe },
  { href: "/admin/subscriptions", label: "Subscripciones", icon: CreditCard },
  { href: "/admin/plans", label: "Planes", icon: Settings },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = React.useState(false)

  const [impersonating, setImpersonating] = React.useState(false)

  React.useEffect(() => {
    const imp = localStorage.getItem("wpfacil_impersonating")
    setImpersonating(!!imp)
  }, [])

  function handleLogout() {
    localStorage.removeItem("wpfacil_token")
    localStorage.removeItem("wpfacil_impersonating")
    router.push("/login")
  }

  function handleStopImpersonating() {
    localStorage.removeItem("wpfacil_impersonating")
    localStorage.removeItem("wpfacil_impersonate_token")
    setImpersonating(false)
    router.push("/admin")
  }

  return (
    <div className="flex min-h-screen">
      {impersonating && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 px-4 py-2 text-center text-sm font-medium text-yellow-950">
          Modo Administrador - Estás impersonando a un usuario
          <button
            onClick={handleStopImpersonating}
            className="ml-3 underline hover:no-underline"
          >
            Volver al panel admin
          </button>
        </div>
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r bg-background transition-transform lg:static lg:translate-x-0",
          impersonating ? "top-10" : "top-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-14 items-center border-b px-6">
          <Link href="/admin" className="flex items-center gap-2">
            <img src="/logo/logo_theme_white.svg?v=1" alt="Admin" className="h-8 w-auto dark:hidden" />
            <img src="/logo/logo_theme_black.svg?v=1" alt="Admin" className="hidden h-8 w-auto dark:block" />
          </Link>
        </div>
        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>
        <div className="border-t p-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <Globe className="h-4 w-4" />
            Volver al panel de usuario
          </Link>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex flex-1 flex-col">
        <header
          className={cn(
            "flex h-14 items-center justify-between border-b bg-background px-4 lg:px-6",
            impersonating && "mt-10"
          )}
        >
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <div className="flex-1" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2">
                <Avatar className="size-8">
                  <AvatarFallback>A</AvatarFallback>
                </Avatar>
                <div className="hidden text-left md:block">
                  <p className="text-sm font-medium leading-none">Admin</p>
                  <p className="text-xs text-muted-foreground">Administrador</p>
                </div>
                <ChevronDown className="hidden h-4 w-4 text-muted-foreground md:block" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Admin</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Cerrar Sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  )
}
