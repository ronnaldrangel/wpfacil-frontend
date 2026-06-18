import Link from "next/link"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <div className="flex justify-center">
            <Link href="/">
              <img
                src="/logo/logo_theme_white.svg?v=1"
                alt="WPFacil"
                className="h-10 w-auto dark:hidden"
              />
              <img
                src="/logo/logo_theme_black.svg?v=1"
                alt="WPFacil"
                className="hidden h-10 w-auto dark:block"
              />
            </Link>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}
