import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Protected routes
const protectedRoutes = ['/dashboard', '/event-types', '/availability', '/settings'];

// Auth routes
const authRoutes = ['/login', '/register'];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Check if user have token
    const token = request.cookies.get('token')?.value;

    // If protected route and no token - go to /login
    if (protectedRoutes.some(route => pathname.startsWith(route)) && !token) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
    }

    // If auth route and is token - go to /dashboard
    if (authRoutes.some(route => pathname === route) && token) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};