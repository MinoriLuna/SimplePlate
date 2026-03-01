import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function middleware(request) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Check if the user is logged in
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const url = new URL(request.url)

  // 1. If they ARE logged in, and they try to go to the login, register, or home page...
  // Redirect them straight to their dashboard!
  if (user && (url.pathname === '/' || url.pathname === '/login' || url.pathname === '/register')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // 2. If they are NOT logged in, and they try to access protected pages...
  // Kick them to the login page!
  if (!user && (url.pathname.startsWith('/dashboard') || url.pathname.startsWith('/rewards') || url.pathname.startsWith('/history') || url.pathname.startsWith('/settings'))) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return supabaseResponse
}

// This tells the middleware which routes it should "watch"
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}