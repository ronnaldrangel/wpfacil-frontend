"use client"

import * as React from "react"
import { MessageCircle } from "lucide-react"

export function WhatsAppButton() {
  const [href, setHref] = React.useState("#")

  React.useEffect(() => {
    const text = `${window.location.href} Hola quiero hablar con un asesor`
    setHref(`https://wa.me/51920789569?text=${encodeURIComponent(text)}`)
  }, [])

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contactar por WhatsApp"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-white shadow-lg transition-transform hover:scale-110 hover:bg-green-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <MessageCircle className="h-7 w-7 fill-white" />
    </a>
  )
}
