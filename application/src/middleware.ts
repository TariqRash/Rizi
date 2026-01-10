import { NextResponse, NextRequest } from 'next/server';
import { auth } from 'lib/auth/auth';
import { UserRole } from 'types';
import { USER_ROLES } from 'lib/auth/roles';
import { createDatabaseService } from 'services/database/databaseFactory';

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

  // Compound onboarding (A): require a selected/created compound for app usage.
  // If the user is logged in but hasn't created/selected a compound yet,
  // guide them through the onboarding step.
  const activeCompoundId = request.cookies.get('active_compound_id')?.value;

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

  // 3b. If logged in user has no active compound yet, redirect to onboarding
  if (pathname.startsWith('/dashboard') && isLoggedIn && !activeCompoundId) {
    try {
      const db = await createDatabaseService();
      // DatabaseClient base type doesn't include compound helpers; concrete SQL service does.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const assignments = await (db as any).compoundRoleAssignment?.listForUser?.(session?.user?.id);
      const count = Array.isArray(assignments) ? assignments.length : 0;

      if (count === 0) {
        return NextResponse.redirect(new URL('/onboarding/compound', request.url));
      }

      if (count === 1) {
        const onlyId = assignments[0].compoundId;
        const res = NextResponse.redirect(new URL('/dashboard', request.url));
        res.cookies.set('active_compound_id', onlyId, {
          httpOnly: true,
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production',
          path: '/',
          maxAge: 60 * 60 * 24 * 365,
        });
        return res;
      }

      return NextResponse.redirect(new URL('/dashboard/select-compound', request.url));
    } catch {
      // Fallback to onboarding if DB isn't reachable.
      return NextResponse.redirect(new URL('/onboarding/compound', request.url));
    }
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
    '/onboarding/compound',
    '/dashboard/select-compound',
    '/dashboard',
    '/dashboard/:path*',
    '/admin',
    '/admin/:path*',
    '/system-status',
    '/api/system-status',
    '/api/health',
  ],
};
