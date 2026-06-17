"use client"

import * as React from "react"
import { useRouter, usePathname } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { getToken, removeToken, api } from "@/lib/api-client"

export default function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = React.useState<{
    name: string
    email: string
    avatar?: string
    isAdmin: boolean
  } | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const token = getToken()
    if (!token) {
      router.push("/login")
      return
    }


    async function fetchUser() {
      try {
        const data = await api.get<{
          name: string
          email: string
          image?: string
          isAdmin: boolean
        }>("/api/users/me")
        setUser({
          name: data.name,
          email: data.email,
          avatar: data.image,
          isAdmin: data.isAdmin,
        })
      } catch {
        removeToken()
        router.push("/login")
      } finally {
        setLoading(false)
      }
    }
    fetchUser()
  }, [router, pathname])

  function handleLogout() {
    removeToken()
    router.push("/login")
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    )
  }

  if (!user) return null

  return (
    <DashboardLayout user={user} onLogout={handleLogout}>
      {children}
    </DashboardLayout>
  )
}
