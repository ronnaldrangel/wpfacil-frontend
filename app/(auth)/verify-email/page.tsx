"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { api } from "@/lib/api-client"
import { Loader2, CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"

function VerifyForm() {
  const searchParams = useSearchParams()
  const [status, setStatus] = React.useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = React.useState("")

  React.useEffect(() => {
    const token = searchParams.get("token")
    if (!token) {
      setStatus("error")
      setMessage("Token de verificación no válido.")
      return
    }
    api.get(`/api/auth/verify-email?token=${token}`)
      .then(() => {
        setStatus("success")
        setMessage("¡Email verificado exitosamente! Ya puedes iniciar sesión.")
      })
      .catch((err) => {
        setStatus("error")
        setMessage(err?.message || "Error al verificar el email.")
      })
  }, [searchParams])

  return (
    <Card>
      <CardHeader className="text-center">
        <div className="flex justify-center mb-2">
          {status === "loading" && <Loader2 className="size-12 animate-spin text-primary" />}
          {status === "success" && <CheckCircle className="size-12 text-green-500" />}
          {status === "error" && <XCircle className="size-12 text-destructive" />}
        </div>
        <CardTitle>
          {status === "loading" && "Verificando..."}
          {status === "success" && "Email Verificado"}
          {status === "error" && "Error de Verificación"}
        </CardTitle>
        <CardDescription>{message}</CardDescription>
      </CardHeader>
      {status !== "loading" && (
        <CardContent className="text-center">
          <Link href="/login">
            <Button className="w-full">Ir a iniciar sesión</Button>
          </Link>
        </CardContent>
      )}
    </Card>
  )
}

export default function VerifyEmailPage() {
  return (
    <React.Suspense fallback={<div className="text-center py-8"><Loader2 className="size-8 animate-spin mx-auto" /></div>}>
      <VerifyForm />
    </React.Suspense>
  )
}
