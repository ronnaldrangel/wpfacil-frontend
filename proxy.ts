import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const authPages = ["/login", "/register", "/forgot-password", "/reset-password", "/verify-email"]

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const hasAuth = request.cookies.has("wpfacil_auth")

  if (pathname === "/") {
    return NextResponse.next()
  }

  if (pathname === "/dashboard") {
    return NextResponse.next()
  }

  if (pathname === "/sites") {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  if (authPages.includes(pathname) && hasAuth) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/", "/dashboard", "/sites", "/login", "/register", "/forgot-password", "/reset-password", "/verify-email"],
}
