import { Card, CardContent } from "@/components/ui/card"
import { MarketingLayout } from "@/components/marketing-layout"

export const metadata = {
  title: "Términos y Condiciones — WPFacil",
  description: "Términos y condiciones de uso de WPFacil.",
}

export default function TermsPage() {
  return (
    <MarketingLayout>
      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="mb-8 space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Términos y Condiciones</h1>
          <p className="text-muted-foreground">Última actualización: {new Date().toLocaleDateString("es-ES")}</p>
        </div>

        <Card>
          <CardContent className="space-y-6 p-6 text-sm leading-relaxed text-muted-foreground">
            <section className="space-y-2">
              <h2 className="text-lg font-semibold text-foreground">1. Aceptación de los términos</h2>
              <p>
                Al acceder y utilizar WPFacil, aceptas estar legalmente obligado por estos Términos y Condiciones. Si no estás de acuerdo, no debes utilizar nuestros servicios.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-semibold text-foreground">2. Información de la empresa</h2>
              <p>
                WPFacil es operado por:
              </p>
              <ul className="list-disc space-y-1 pl-5 text-foreground">
                <li><strong>NEOPATRON LTD</strong></li>
                <li>Company number: 14176889</li>
                <li>Registered office address: Unit 82a James Carter Road, Mildenhall, Bury St. Edmunds, England, IP28 7DE</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-semibold text-foreground">3. Descripción del servicio</h2>
              <p>
                WPFacil es una plataforma de hosting gestionado que permite crear, desplegar y administrar sitios web basados en WordPress. Los servicios incluyen alojamiento, subdominios, certificados SSL, acceso a archivos, bases de datos y herramientas de administración.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-semibold text-foreground">4. Cuentas de usuario</h2>
              <p>
                Eres responsable de mantener la confidencialidad de tus credenciales y de todas las actividades que ocurran bajo tu cuenta. Debes proporcionar información veraz, actualizada y completa durante el registro.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-semibold text-foreground">5. Pagos y suscripciones</h2>
              <p>
                Los pagos se procesan a través de <strong>Stripe, Inc.</strong>, un procesador de pagos externo. Al suscribirte a un plan, aceptas que Stripe gestione el cobro de las tarifas correspondientes.
              </p>
              <p>
                WPFacil no almacena los datos completos de tu tarjeta de crédito o débito. Dicha información es procesada y almacenada directamente por Stripe de acuerdo con sus propios términos y políticas de privacidad.
              </p>
              <p>
                Las suscripciones se renuevan automáticamente según el período de facturación seleccionado, salvo que canceles tu suscripción antes de la fecha de renovación.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-semibold text-foreground">6. Cancelación y reembolsos</h2>
              <p>
                Puedes cancelar tu suscripción en cualquier momento desde tu panel de facturación. Si cancelas, seguirás teniendo acceso hasta el final del período de facturación pagado.
              </p>
              <p>
                Los reembolsos se evaluarán caso por caso. No garantizamos reembolsos por cambios de opinión una vez transcurrido el período de garantía aplicable.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-semibold text-foreground">7. Uso prohibido</h2>
              <p>
                No puedes utilizar WPFacil para actividades ilegales, fraudulentas, abusivas o que infrinjan derechos de terceros. Esto incluye, pero no se limita a: malware, phishing, spam, contenido protegido por derechos de autor sin autorización, y actividades que dañen la infraestructura de la plataforma.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-semibold text-foreground">8. Propiedad intelectual</h2>
              <p>
                WPFacil y todos sus elementos (logotipos, marcas, software, diseño) son propiedad de NEOPATRON LTD. No se otorga ninguna licencia sobre ellos salvo la necesaria para utilizar el servicio conforme a estos términos.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-semibold text-foreground">9. Limitación de responsabilidad</h2>
              <p>
                WPFacil se proporciona "tal cual" y "según disponibilidad". En la medida máxima permitida por la ley, NEOPATRON LTD no será responsable por daños indirectos, incidentales, especiales o consecuentes derivados del uso o la imposibilidad de uso del servicio.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-semibold text-foreground">10. Terminación</h2>
              <p>
                Podemos suspender o cancelar tu cuenta de inmediato si incumples estos términos, si tu suscripción vence y no se renueva, o por cualquier motivo justificado. También puedes eliminar tu cuenta en cualquier momento.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-semibold text-foreground">11. Ley aplicable</h2>
              <p>
                Estos Términos se regirán e interpretarán de acuerdo con las leyes de Inglaterra y Gales. Cualquier disputa estará sujeta a la jurisdicción exclusiva de los tribunales de Inglaterra y Gales.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-semibold text-foreground">12. Contacto</h2>
              <p>
                Para cualquier consulta sobre estos Términos, puedes contactarnos a través de los canales disponibles en el sitio web.
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </MarketingLayout>
  )
}
