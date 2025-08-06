import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyToken } from "@/lib/auth"

export function middleware(request: NextRequest) {
  console.log("[middleware] Request URL:", request.url)
  const { pathname } = request.nextUrl
  console.log("[middleware] Pathname:", pathname)

  const token = request.cookies.get("session_token")?.value
  console.log("[middleware] Session token found:", !!token)

  // Public routes that don't require authentication
  const publicRoutes = ["/auth", "/"]
  const isPublicRoute = publicRoutes.includes(pathname)

  // If no token and trying to access protected route
  if (!token && !isPublicRoute) {
    console.log("[middleware] No token, redirecting to /auth")
    return NextResponse.redirect(new URL("/auth", request.url))
  }

  // If token exists and trying to access auth page, redirect to dashboard
  if (token && pathname === "/auth") {
    console.log("[middleware] Token exists, on /auth page, redirecting to /dashboard")
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  console.log("[middleware] Proceeding to next response")
  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
