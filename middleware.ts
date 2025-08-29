import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyToken } from "@/lib/auth"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get("auth-token")?.value

  // Public routes that don't require authentication
  const publicRoutes = ["/auth", "/"]
  const isPublicRoute = publicRoutes.includes(pathname)

  // If no token and trying to access protected route
  if (!token && !isPublicRoute) {
    return NextResponse.redirect(new URL("/auth", request.url))
  }

  // If token exists, verify it
  if (token) {
    const decoded = await verifyToken(token)

    // If token is invalid and trying to access protected route
    if (!decoded && !isPublicRoute) {
      const response = NextResponse.redirect(new URL("/auth", request.url))
      response.cookies.delete("auth-token")
      return response
    }

    // If token is valid and trying to access auth page, redirect to dashboard
    if (decoded && pathname === "/auth") {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
