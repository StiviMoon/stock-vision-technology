// middleware.js
import { NextResponse } from 'next/server';

export function middleware(request) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // Rutas que requieren autenticación
  const protectedRoutes = ['/dashboard', '/profile', '/admin'];
  
  // Rutas de autenticación (no requieren autenticación)
  const authRoutes = ['/login', '/register'];

  // Verificar rutas protegidas
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  if (isProtectedRoute && !token) {
    const url = new URL('/login', request.url);
    url.searchParams.set('returnUrl', pathname);
    return NextResponse.redirect(url);
  }

  // Redirigir usuarios autenticados desde páginas de login/registro
  const isAuthRoute = authRoutes.some(route => pathname === route);
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Rutas que necesitan verificación:
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)',
  ],
};