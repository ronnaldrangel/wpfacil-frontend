import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "next-themes"
import { Toaster } from "sonner"
import { WhatsAppButton } from "@/components/whatsapp-button"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "WPFacil — Sitios WordPress ultrarrápidos",
  description: "Crea y gestiona sitios WordPress en segundos. SSL automático, CDN global, subdominio gratis y panel de control intuitivo.",
  openGraph: {
    title: "WPFacil — Sitios WordPress ultrarrápidos",
    description: "Crea y gestiona sitios WordPress en segundos. Sin complicaciones.",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light">
          {children}
          <Toaster richColors position="bottom-right" />
          <WhatsAppButton />
        </ThemeProvider>
      </body>
    </html>
  )
}
