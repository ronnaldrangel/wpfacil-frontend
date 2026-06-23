import type { Metadata } from "next"
import { ContactPageClient } from "./contact-page-client"

export const metadata: Metadata = {
  title: "Contacto — WPFacil",
  description: "Contáctanos para resolver tus dudas sobre WPFacil. Estamos aquí para ayudarte.",
}

export default function ContactPage() {
  return <ContactPageClient />
}
