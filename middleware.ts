import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const pathname = req.nextUrl.pathname

    // Redirect based on role
    if (pathname.startsWith('/dashboard') && token?.role) {
      if (token.role === 'ADMIN' && !pathname.startsWith('/admin')) {
        return NextResponse.redirect(new URL('/admin/dashboard', req.url))
      } else if (token.role === 'MANAGER' && !pathname.startsWith('/manager')) {
        return NextResponse.redirect(new URL('/manager/dashboard', req.url))
      } else if (token.role === 'TECHNICIAN' && !pathname.startsWith('/technician')) {
        return NextResponse.redirect(new URL('/technician/dashboard', req.url))
      } else if (token.role === 'CLIENT' && !pathname.startsWith('/client')) {
        return NextResponse.redirect(new URL('/client/dashboard', req.url))
      }
    }

    // Protect role-specific routes
    if (pathname.startsWith('/admin') && token?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/auth/signin', req.url))
    }
    if (pathname.startsWith('/manager') && token?.role !== 'MANAGER' && token?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/auth/signin', req.url))
    }
    if (pathname.startsWith('/technician') && token?.role !== 'TECHNICIAN' && token?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/auth/signin', req.url))
    }
    if (pathname.startsWith('/client') && token?.role !== 'CLIENT' && token?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/auth/signin', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    }
  }
)

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/manager/:path*',
    '/technician/:path*',
    '/client/:path*'
  ]
}