import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyToken } from "@/lib/auth"

export function middleware(request: NextRequest) {
  // Add console logs to trace the middleware execution
  console.log("[middleware] Request URL:", request.url)
  const { pathname } = request.nextUrl
  console.log("[middleware] Pathname:", pathname)

  const token = request.cookies.get("auth-token")?.value
  console.log("[middleware] Auth token found:", !!token)

  // Public routes that don't require authentication
  const publicRoutes = ["/auth", "/"]
  const isPublicRoute = publicRoutes.includes(pathname)

  // If no token and trying to access protected route
  if (!token && !isPublicRoute) {
    console.log("[middleware] No token, redirecting to /auth")
    return NextResponse.redirect(new URL("/auth", request.url))
  }

  // If token exists, verify it
  if (token) {
    const decoded = verifyToken(token)
    console.log("[middleware] Token decoded:", !!decoded)

    // If token is invalid and trying to access protected route
    if (!decoded && !isPublicRoute) {
      console.log("[middleware] Invalid token, redirecting to /auth and deleting cookie.")
      const response = NextResponse.redirect(new URL("/auth", request.url))
      response.cookies.delete("auth-token")
      return response
    }

    // If token is valid and trying to access auth page, redirect to dashboard
    if (decoded && pathname === "/auth") {
      console.log("[middleware] Token valid, on /auth page, redirecting to /dashboard.")
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
    if (decoded && !isPublicRoute) {
      console.log("[middleware] Token valid, accessing protected route.")
    }
  }

  console.log("[middleware] Proceeding to next response.")
  return NextResponse.next()
}

export const config = {
  // Exclude UV assets and service paths from auth middleware to avoid 404s during proxying
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|uv/).*)"],
}
