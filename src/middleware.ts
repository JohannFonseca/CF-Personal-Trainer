import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
 
const intlMiddleware = createMiddleware(routing);

export async function middleware(request: NextRequest) {
  // First, we create the response from intl middleware
  const response = intlMiddleware(request);

  // Then we handle Supabase session using that response
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Protect routes logic
  const pathname = request.nextUrl.pathname;
  // Note: with next-intl, pathnames are prefixed with locale (e.g. /es/dashboard)
  const isAuthRoute = pathname.includes('/login') || pathname.includes('/register');
  const isProtectedRoute = pathname.includes('/dashboard') || pathname.includes('/admin');

  if (isProtectedRoute && !user) {
    const locale = pathname.split('/')[1] || routing.defaultLocale;
    return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
  }

  if (isAuthRoute && user) {
    const locale = pathname.split('/')[1] || routing.defaultLocale;
    return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url));
  }

  return response;
}
 
export const config = {
  matcher: [
    // Enable a redirect to a matching locale at the root
    '/',
    // Set a cookie to remember the previous locale for
    // all requests that have a locale prefix
    '/(es|en)/:path*',
    // Enable redirects that add missing locales
    // (e.g. `/pathnames` -> `/en/pathnames`)
    '/((?!_next|_vercel|.*\\..*).*)'
  ]
};
