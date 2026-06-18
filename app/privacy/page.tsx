import { Card, CardContent } from "@/components/ui/card"
import { MarketingLayout } from "@/components/marketing-layout"

export const metadata = {
  title: "Política de Privacidad — WPFacil",
  description: "Política de privacidad de WPFacil.",
}

export default function PrivacyPage() {
  return (
    <MarketingLayout>
      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="mb-8 space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Política de Privacidad</h1>
          <p className="text-muted-foreground">Última actualización: {new Date().toLocaleDateString("es-ES")}</p>
        </div>

        <Card>
          <CardContent className="space-y-6 p-6 text-sm leading-relaxed text-muted-foreground">
            <section className="space-y-2">
              <h2 className="text-lg font-semibold text-foreground">1. Introducción</h2>
              <p>
                En WPFacil nos comprometemos a proteger tu privacidad. Esta Política de Privacidad describe qué datos personales recopilamos, cómo los usamos, con quién los compartimos y cuáles son tus derechos.
              </p>
              <p>
                Responsable del tratamiento:
              </p>
              <ul className="list-disc space-y-1 pl-5 text-foreground">
                <li><strong>NEOPATRON LTD</strong></li>
                <li>Company number: 14176889</li>
                <li>Registered office address: Unit 82a James Carter Road, Mildenhall, Bury St. Edmunds, England, IP28 7DE</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-semibold text-foreground">2. Datos que recopilamos</h2>
              <p>Podemos recopilar los siguientes datos:</p>
              <ul className="list-disc space-y-1 pl-5 text-foreground">
                <li>Información de registro: nombre, correo electrónico, contraseña encriptada.</li>
                <li>Información de facturación: datos necesarios para procesar pagos.</li>
                <li>Información de uso: dirección IP, tipo de navegador, páginas visitadas y logs del servicio.</li>
                <li>Datos de los sitios que creas: nombre, dominio, contenido y configuraciones.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-semibold text-foreground">3. Cómo usamos tus datos</h2>
              <p>Utilizamos tus datos para:</p>
              <ul className="list-disc space-y-1 pl-5 text-foreground">
                <li>Proporcionar, mantener y mejorar WPFacil.</li>
                <li>Gestionar tu cuenta, suscripciones y facturación.</li>
                <li>Comunicarnos contigo sobre el servicio, actualizaciones o soporte.</li>
                <li>Garantizar la seguridad y prevenir fraudes.</li>
                <li>Cumplir con obligaciones legales.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-semibold text-foreground">4. Procesamiento de pagos con Stripe</h2>
              <p>
                Utilizamos <strong>Stripe, Inc.</strong> como procesador de pagos para gestionar suscripciones y cobros. Cuando realizas un pago, Stripe recibe los datos de pago necesarios, como información de la tarjeta y dirección de facturación.
              </p>
              <p>
                WPFacil no almacena los números completos de tarjetas de crédito o débito. Stripe procesa y almacena dicha información conforme a su propia política de privacidad, disponible en{" "}
                <a
                  href="https://stripe.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  stripe.com/privacy
                </a>.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-semibold text-foreground">5. Cookies y tecnologías similares</h2>
              <p>
                Utilizamos cookies y tecnologías similares para operar el sitio, recordar tus preferencias, analizar el tráfico y mejorar la experiencia de usuario. Puedes gestionar las cookies desde la configuración de tu navegador.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-semibold text-foreground">6. Terceros y compartición de datos</h2>
              <p>
                No vendemos tus datos personales. Podemos compartir información con proveedores de servicios de confianza que nos ayudan a operar WPFacil, como proveedores de alojamiento, procesadores de pago (Stripe) y herramientas de soporte. Estos terceros están obligados a proteger tu información.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-semibold text-foreground">7. Seguridad</h2>
              <p>
                Implementamos medidas técnicas y organizativas razonables para proteger tus datos contra acceso no autorizado, pérdida o alteración. Sin embargo, ningún sistema es completamente seguro.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-semibold text-foreground">8. Tus derechos</h2>
              <p>Dependiendo de tu ubicación, puedes tener derecho a:</p>
              <ul className="list-disc space-y-1 pl-5 text-foreground">
                <li>Acceder a tus datos personales.</li>
                <li>Rectificar información inexacta.</li>
                <li>Solicitar la eliminación de tus datos.</li>
                <li>Oponerte al procesamiento en ciertos casos.</li>
                <li>Solicitar la portabilidad de tus datos.</li>
              </ul>
              <p>
                Para ejercer tus derechos, contacta con nosotros a través de los canales disponibles en el sitio web.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-semibold text-foreground">9. Cambios en esta política</h2>
              <p>
                Podemos actualizar esta Política de Privacidad periódicamente. Te notificaremos sobre cambios significativos a través del sitio web o por correo electrónico.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-semibold text-foreground">10. Contacto</h2>
              <p>
                Si tienes preguntas sobre esta Política de Privacidad, puedes contactarnos a través de los canales disponibles en el sitio web.
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </MarketingLayout>
  )
}
