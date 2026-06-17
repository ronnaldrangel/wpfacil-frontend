"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { getToken } from "@/lib/api-client"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  useEffect(() => {
    if (getToken()) {
      router.push("/dashboard")
    }
  }, [router])

  return <>{children}</>
}
