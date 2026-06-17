"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut, User, CreditCard, Shield, Sun, Moon, Bell } from "lucide-react"

interface DashboardLayoutProps {
  children: React.ReactNode
  user: { name: string; email: string; avatar?: string; isAdmin?: boolean }
  onLogout: () => void
}

export function DashboardLayout({ children, user, onLogout }: DashboardLayoutProps) {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  const [notifications, setNotifications] = React.useState<{ id: number; text: string; time: string }[]>([])
  React.useEffect(() => setMounted(true), [])
  React.useEffect(() => {
    const raw = localStorage.getItem("wpfacil_notifications")
    if (raw) {
      try { setNotifications(JSON.parse(raw)) } catch {}
    }
    const handler = () => {
      const r = localStorage.getItem("wpfacil_notifications")
      if (r) { try { setNotifications(JSON.parse(r)) } catch {} }
    }
    window.addEventListener("storage", handler)
    return () => window.removeEventListener("storage", handler)
  }, [])

  function clearNotifications() {
    localStorage.removeItem("wpfacil_notifications")
    setNotifications([])
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex h-14 items-center justify-center border-b bg-background px-4 lg:px-6">
        <div className="flex w-full max-w-5xl items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <img src="/logo/logo_theme_white.svg?v=1" alt="WPFacil" className="h-7 w-auto dark:hidden" />
            <img src="/logo/logo_theme_black.svg?v=1" alt="WPFacil" className="hidden h-7 w-auto dark:block" />
          </Link>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
              {mounted && theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="size-4" />
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground">
                      {notifications.length > 9 ? "9+" : notifications.length}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72">
                <DropdownMenuLabel>Notificaciones</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notifications.length === 0 ? (
                  <p className="px-2 py-4 text-center text-sm text-muted-foreground">Sin notificaciones</p>
                ) : (
                  notifications.slice(0, 10).map((n) => (
                    <div key={n.id} className="px-2 py-2 text-sm">
                      <p>{n.text}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {new Date(n.time).toLocaleString("es-ES")}
                      </p>
                    </div>
                  ))
                )}
                {notifications.length > 0 && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={clearNotifications} className="justify-center text-sm text-muted-foreground">
                      Limpiar notificaciones
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2">
                <Avatar className="size-7">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <span className="hidden text-sm font-medium md:inline">{user.name}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="flex items-center gap-3 px-2 py-1.5">
                <Avatar className="size-9">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{user.name}</span>
                  <span className="text-xs text-muted-foreground">{user.email}</span>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push("/billing")}>
                <CreditCard className="mr-2 h-4 w-4" />
                Facturación
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/profile")}>
                <User className="mr-2 h-4 w-4" />
                Perfil
              </DropdownMenuItem>
              {user.isAdmin && (
                <DropdownMenuItem onClick={() => router.push("/admin")}>
                  <Shield className="mr-2 h-4 w-4" />
                  Panel de Administración
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Cerrar Sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        </header>
      <main className="flex-1 p-4 lg:p-6">
        <div className="mx-auto max-w-5xl">{children}</div>
      </main>
    </div>
  )
}
