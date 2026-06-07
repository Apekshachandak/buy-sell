import { NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const PROTECTED = ['/listings/new', '/dashboard', '/listings/*/edit']

function isProtected(pathname) {
  if (pathname === '/listings/new') return true
  if (pathname === '/dashboard') return true
  if (/^\/listings\/[^/]+\/edit$/.test(pathname)) return true
  return false
}

export async function middleware(req) {
  const { pathname } = req.nextUrl

  if (!isProtected(pathname)) return NextResponse.next()

  const token = req.cookies.get('trove_token')?.value
  if (!token) {
    const loginUrl = new URL('/auth/login', req.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'trove_super_secret_key_2024')
    await jwtVerify(token, secret)
    return NextResponse.next()
  } catch {
    const loginUrl = new URL('/auth/login', req.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }
}

export const config = {
  matcher: ['/listings/new', '/dashboard', '/listings/:id/edit'],
}
