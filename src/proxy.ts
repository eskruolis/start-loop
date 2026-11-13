import { getSessionCookie } from "better-auth/cookies"
import { type NextRequest, NextResponse } from "next/server"

/**
 * Sends visitors without a session cookie to the sign-in page. A fast first gate only: the cookie
 * is not verified here, so pages and actions still call requireUser() / requireActionUser().
 */
const PUBLIC = ["/sign-in", "/sign-up", "/api/auth", "/api/health"]

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  if (PUBLIC.some((p) => pathname === p || pathname.startsWith(`${p}/`))) return NextResponse.next()
  if (getSessionCookie(request)) return NextResponse.next()
  const url = new URL("/sign-in", request.url)
  if (pathname !== "/") url.searchParams.set("next", pathname)
  return NextResponse.redirect(url)
}

export const config = {
  // Everything but Next's own files and static assets.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp|ico|txt)$).*)",
  ],
}
