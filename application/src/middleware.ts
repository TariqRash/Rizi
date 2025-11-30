import { NextResponse, NextRequest } from 'next/server';
import { auth } from 'lib/auth/auth';
import { UserRole } from 'types';
import { USER_ROLES } from 'lib/auth/roles';
import { HTTP_STATUS } from 'lib/api/http';
import { buildTenantHeaders, resolveTenantFromRequest } from 'lib/tenant/tenantResolver';

const ROLE_HOME_URL: Record<UserRole, string> = {
  [USER_ROLES.USER]: '/dashboard/my-notes',
  [USER_ROLES.ADMIN]: '/dashboard/my-notes',
};

/**
 * Middleware to handle authentication and role-based redirects.
 * @returns A NextResponse object for redirection or continuation.
 */
export async function middleware(request: NextRequest) {
  const tenant = await resolveTenantFromRequest(request);
  const tenantRequired =
    request.nextUrl.pathname.startsWith('/dashboard') ||
    request.nextUrl.pathname.startsWith('/admin') ||
    request.nextUrl.pathname.startsWith('/api');
  const isApiRequest = request.nextUrl.pathname.startsWith('/api');
  const tenantAwareHeaders = buildTenantHeaders(tenant, request.headers);

  if (tenantRequired && !tenant) {
    if (isApiRequest) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: HTTP_STATUS.NOT_FOUND });
    }

    return NextResponse.redirect(new URL('/', request.url));
  }

  const session = await auth();
  const { pathname } = request.nextUrl;

  const isLoggedIn = !!session?.user;
  const role = session?.user?.role as UserRole;
  const tenantMismatch =
    tenant && session?.user?.compoundId && session.user.compoundId !== tenant.compound.id;

  // 1. Redirect authenticated users from root directly to their role-based dashboard
  if (pathname === '/' && isLoggedIn && role && !tenantMismatch) {
    return NextResponse.redirect(new URL(ROLE_HOME_URL[role] ?? '/', request.url));
  }

  // 2. Redirect from generic /dashboard to role-based dashboard
  // This handles backward compatibility and direct /dashboard access
  if (pathname === '/dashboard' && isLoggedIn && role && !tenantMismatch) {
    return NextResponse.redirect(new URL(ROLE_HOME_URL[role] ?? '/', request.url));
  }

  // 3. Protect dashboard routes - redirect unauthenticated users to login
  if (pathname.startsWith('/dashboard') && (!isLoggedIn || tenantMismatch)) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 4. Redirect logged-in users from auth pages directly to their role-based dashboard
  if (isLoggedIn && role && !tenantMismatch && (pathname === '/login' || pathname === '/signup')) {
    return NextResponse.redirect(new URL(ROLE_HOME_URL[role] ?? '/', request.url));
  }

  // 5. Protect admin routes
  if (pathname.startsWith('/admin')) {
    if (!isLoggedIn || tenantMismatch) {
      // Redirect unauthenticated users to login
      return NextResponse.redirect(new URL('/login', request.url));
    } else if (role !== USER_ROLES.ADMIN) {
      // Redirect non-admin users to their role-based dashboard
      return NextResponse.redirect(new URL(ROLE_HOME_URL[role] ?? '/', request.url));
    }
  }

  if (isApiRequest && tenantMismatch) {
    return NextResponse.json({ error: 'Forbidden' }, { status: HTTP_STATUS.FORBIDDEN });
  }

  const response = NextResponse.next({
    request: {
      headers: tenantAwareHeaders,
    },
  });

  return response;
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
    '/api/:path*',
  ],
};
