import { NextResponse, NextRequest } from 'next/server';
import { auth } from 'lib/auth/auth';
import { UserRole } from 'types';
import { USER_ROLES } from 'lib/auth/roles';

const ROLE_HOME_URL: Record<UserRole, string> = {
  [USER_ROLES.SUPER_ADMIN]: '/admin/dashboard',
  [USER_ROLES.USER]: '/dashboard/my-notes',
};

/**
 * Middleware to handle authentication and role-based redirects.
 * @returns A NextResponse object for redirection or continuation.
 */
export async function middleware(request: NextRequest) {
  const session = await auth();
  const { pathname } = request.nextUrl;

  const isLoggedIn = !!session?.user;
  const role = session?.user?.role as UserRole;

  // 1. Redirect authenticated users from root directly to their role-based dashboard
  if (pathname === '/' && isLoggedIn && role) {
    return NextResponse.redirect(new URL(ROLE_HOME_URL[role] ?? '/', request.url));
  }

  // 2. Redirect from generic /dashboard to role-based dashboard
  // This handles backward compatibility and direct /dashboard access
  if (pathname === '/dashboard' && isLoggedIn && role) {
    return NextResponse.redirect(new URL(ROLE_HOME_URL[role] ?? '/', request.url));
  }

  // 3. Protect dashboard routes - redirect unauthenticated users to login
  if (pathname.startsWith('/dashboard') && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 4. Redirect logged-in users from auth pages directly to their role-based dashboard
  if (isLoggedIn && role && (pathname === '/login' || pathname === '/signup')) {
    return NextResponse.redirect(new URL(ROLE_HOME_URL[role] ?? '/', request.url));
  }

  // 5. Protect admin routes
  if (pathname.startsWith('/admin')) {
    if (!isLoggedIn) {
      // Redirect unauthenticated users to login
      return NextResponse.redirect(new URL('/login', request.url));
    } else if (role !== USER_ROLES.ADMIN && role !== USER_ROLES.SUPER_ADMIN) {
      // Redirect non-admin users to their role-based dashboard
      return NextResponse.redirect(new URL(ROLE_HOME_URL[role] ?? '/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/login',
    '/signup',
    '/dashboard',
    '/dashboard/:path*',
    '/admin',
    '/admin/:path*',
    '/system-status',
    '/api/system-status',
    '/api/health',
  ],
};
