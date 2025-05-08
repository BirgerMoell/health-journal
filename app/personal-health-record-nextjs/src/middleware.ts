import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Add a simple helper to check if URL contains a specific parameter
function hasParam(url: URL, param: string): boolean {
  return url.searchParams.has(param);
}

// Routes that should not require authentication
const publicRoutes = [
  '/login',
  '/forgot-password',
  '/reset-password',
  '/signup',
  '/about',
  '/_next',
  '/static',
  '/api/auth',
  '/faq',
  '/privacy',
  '/'
];

// Check if the current path is a public route
function isPublicRoute(path: string): boolean {
  return publicRoutes.some(route => path.startsWith(route));
}

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  
  const { data: { session } } = await supabase.auth.getSession();

  // If user is signed in and trying to access login page, redirect to home
  if (session?.user && req.nextUrl.pathname === '/login') {
    return NextResponse.redirect(new URL('/home', req.url));
  }

  // Allow all other requests to proceed
  return res;
}

// Only run middleware on specific paths
export const config = {
  matcher: ['/login', '/home'],
}; 