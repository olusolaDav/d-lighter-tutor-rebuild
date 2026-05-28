import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/** Role → home dashboard mapping */
const ROLE_ROUTES: Record<string, string> = {
  super_admin: '/super-admin',
  admin: '/admin',
  tutor: '/tutor',
  student: '/student',
  parent: '/parent',
}

/** Routes that bypass the auth-redirect even when authenticated */
const AUTH_BYPASS_ROUTES = ['/auth/register-super-admins', '/auth/change-password']

/**
 * Edge-safe JWT payload decoder (no crypto – verification happens inside API routes).
 * We only use this for routing decisions.
 */
function decodeJWTPayload(token: string): Record<string, any> | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const payload = JSON.parse(atob(base64))
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null
    return payload
  } catch {
    return null
  }
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const accessToken = request.cookies.get('accessToken')?.value

  if (AUTH_BYPASS_ROUTES.some((r) => pathname.startsWith(r))) {
    return NextResponse.next()
  }

  if (pathname.startsWith('/auth')) {
    if (accessToken) {
      const payload = decodeJWTPayload(accessToken)
      if (payload?.role && !payload?.mustChangePassword) {
        const destination = ROLE_ROUTES[payload.role as string] ?? '/auth/login'
        return NextResponse.redirect(new URL(destination, request.url))
      }
    }
    return NextResponse.next()
  }

  const protectedPrefixes = ['/admin', '/super-admin', '/tutor', '/student', '/parent']
  const isProtected = protectedPrefixes.some((prefix) => pathname.startsWith(prefix))

  if (!isProtected) return NextResponse.next()

  if (!accessToken) {
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  const payload = decodeJWTPayload(accessToken)

  if (!payload?.role) {
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    const response = NextResponse.redirect(loginUrl)
    response.cookies.delete('accessToken')
    response.cookies.delete('refreshToken')
    return response
  }

  if (payload.mustChangePassword && !pathname.startsWith('/auth/change-password')) {
    return NextResponse.redirect(new URL('/auth/change-password', request.url))
  }

  const userDashboard = ROLE_ROUTES[payload.role as string]

  if (userDashboard && !pathname.startsWith(userDashboard)) {
    return NextResponse.redirect(new URL(userDashboard, request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$|api/).*)',
  ],
}