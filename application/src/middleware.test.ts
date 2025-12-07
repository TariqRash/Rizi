import { NextRequest } from 'next/server';
import { middleware } from './middleware';
import { USER_ROLES } from 'lib/auth/roles';
import { HTTP_STATUS } from 'lib/api/http';

const mockAuth = jest.fn();

jest.mock('lib/auth/auth', () => ({
  auth: () => mockAuth(),
}));

const createMockRequest = (
  pathname: string,
  url: string = 'http://localhost:3000'
): NextRequest => {
  return {
    nextUrl: {
      pathname,
    },
    url: `${url}${pathname}`,
  } as unknown as NextRequest;
};

describe('middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Root path (/)', () => {
    it('redirects authenticated admin users to /admin/dashboard', async () => {
      mockAuth.mockResolvedValue({
        user: { id: '1', role: USER_ROLES.ADMIN },
      });

      const request = createMockRequest('/');
      const response = await middleware(request);
      expect(response).toEqual(
        expect.objectContaining({
          status: HTTP_STATUS.TEMPORARY_REDIRECT, // NextResponse.redirect returns a 307 status
          headers: expect.objectContaining({
            get: expect.any(Function),
          }),
        })
      );

      // Check the location header for redirect URL
      const location = response.headers.get('location');
      expect(location).toBe('http://localhost:3000/admin/dashboard');
    });

    it('redirects authenticated regular users to /dashboard/my-notes', async () => {
      mockAuth.mockResolvedValue({
        user: { id: '1', role: USER_ROLES.USER },
      });

      const request = createMockRequest('/');
      const response = await middleware(request);

      expect(response.status).toBe(HTTP_STATUS.TEMPORARY_REDIRECT);
      const location = response.headers.get('location');
      expect(location).toBe('http://localhost:3000/dashboard/my-notes');
    });

    it('redirects managers to their bookings home', async () => {
      mockAuth.mockResolvedValue({
        user: { id: '2', role: USER_ROLES.MANAGER },
      });

      const request = createMockRequest('/');
      const response = await middleware(request);
      const location = response.headers.get('location');

      expect(response.status).toBe(HTTP_STATUS.TEMPORARY_REDIRECT);
      expect(location).toBe('http://localhost:3000/dashboard/manager/bookings');
    });

    it('redirects authenticated super admins to /admin/dashboard', async () => {
      mockAuth.mockResolvedValue({
        user: { id: '1', role: USER_ROLES.SUPER_ADMIN },
      });

      const request = createMockRequest('/');
      const response = await middleware(request);
      const location = response.headers.get('location');

      expect(response.status).toBe(HTTP_STATUS.TEMPORARY_REDIRECT);
      expect(location).toBe('http://localhost:3000/admin/dashboard');
    });

    it('allows unauthenticated users to stay on root', async () => {
      mockAuth.mockResolvedValue(null);

      const request = createMockRequest('/');
      const response = await middleware(request);

      // NextResponse.next() returns a response without redirect
      expect(response.status).not.toBe(HTTP_STATUS.TEMPORARY_REDIRECT);
    });

    it('allows users without role to stay on root', async () => {
      mockAuth.mockResolvedValue({
        user: { id: '1' }, // no role
      });

      const request = createMockRequest('/');
      const response = await middleware(request);

      expect(response.status).not.toBe(HTTP_STATUS.TEMPORARY_REDIRECT);
    });
  });

  describe('Dashboard routes (/dashboard)', () => {
    it('redirects unauthenticated users to /login', async () => {
      mockAuth.mockResolvedValue(null);

      const request = createMockRequest('/dashboard');
      const response = await middleware(request);

      expect(response.status).toBe(HTTP_STATUS.TEMPORARY_REDIRECT);
      const location = response.headers.get('location');
      expect(location).toBe('http://localhost:3000/login');
    });

    it('redirects unauthenticated users from nested dashboard routes to /login', async () => {
      mockAuth.mockResolvedValue(null);

      const request = createMockRequest('/dashboard/account');
      const response = await middleware(request);

      expect(response.status).toBe(HTTP_STATUS.TEMPORARY_REDIRECT);
      const location = response.headers.get('location');
      expect(location).toBe('http://localhost:3000/login');
    });

    it('redirects authenticated users to their role dashboard from /dashboard', async () => {
      mockAuth.mockResolvedValue({
        user: { id: '1', role: USER_ROLES.USER },
      });

      const request = createMockRequest('/dashboard');
      const response = await middleware(request);

      expect(response.status).toBe(HTTP_STATUS.TEMPORARY_REDIRECT);
      const location = response.headers.get('location');
      expect(location).toBe('http://localhost:3000/dashboard/my-notes');
    });

    it('allows authenticated users to access nested dashboard routes', async () => {
      mockAuth.mockResolvedValue({
        user: { id: '1', role: USER_ROLES.USER },
      });

      const request = createMockRequest('/dashboard/my-notes');
      const response = await middleware(request);

      expect(response.status).not.toBe(HTTP_STATUS.TEMPORARY_REDIRECT);
    });
  });

  describe('Admin routes (/admin)', () => {
    it('redirects unauthenticated users to /login', async () => {
      mockAuth.mockResolvedValue(null);

      const request = createMockRequest('/admin/dashboard');
      const response = await middleware(request);

      expect(response.status).toBe(HTTP_STATUS.TEMPORARY_REDIRECT);
      const location = response.headers.get('location');
      expect(location).toBe('http://localhost:3000/login');
    });

    it('redirects authenticated non-admin users to their role home', async () => {
      mockAuth.mockResolvedValue({
        user: { id: '1', role: USER_ROLES.USER },
      });

      const request = createMockRequest('/admin/dashboard');
      const response = await middleware(request);

      expect(response.status).toBe(HTTP_STATUS.TEMPORARY_REDIRECT);
      const location = response.headers.get('location');
      expect(location).toBe('http://localhost:3000/dashboard/my-notes');
    });

    it('allows authenticated admin users to access admin routes', async () => {
      mockAuth.mockResolvedValue({
        user: { id: '1', role: USER_ROLES.ADMIN },
      });

      const request = createMockRequest('/admin/dashboard');
      const response = await middleware(request);

      expect(response.status).not.toBe(HTTP_STATUS.TEMPORARY_REDIRECT);
    });

    it('allows authenticated super admin users to access admin routes', async () => {
      mockAuth.mockResolvedValue({
        user: { id: '1', role: USER_ROLES.SUPER_ADMIN },
      });

      const request = createMockRequest('/admin/users/manage');
      const response = await middleware(request);

      expect(response.status).not.toBe(HTTP_STATUS.TEMPORARY_REDIRECT);
    });

    it('redirects authenticated users without role to /', async () => {
      mockAuth.mockResolvedValue({
        user: { id: '1' }, // no role
      });

      const request = createMockRequest('/admin/dashboard');
      const response = await middleware(request);

      expect(response.status).toBe(HTTP_STATUS.TEMPORARY_REDIRECT);
      const location = response.headers.get('location');
      expect(location).toBe('http://localhost:3000/');
    });

    it('handles nested admin routes correctly for admin users', async () => {
      mockAuth.mockResolvedValue({
        user: { id: '1', role: USER_ROLES.ADMIN },
      });

      const request = createMockRequest('/admin/users/manage');
      const response = await middleware(request);

      expect(response.status).not.toBe(HTTP_STATUS.TEMPORARY_REDIRECT);
    });

    it('handles nested admin routes correctly for non-admin users', async () => {
      mockAuth.mockResolvedValue({
        user: { id: '1', role: USER_ROLES.USER },
      });

      const request = createMockRequest('/admin/users/manage');
      const response = await middleware(request);

      expect(response.status).toBe(HTTP_STATUS.TEMPORARY_REDIRECT);
      const location = response.headers.get('location');
      expect(location).toBe('http://localhost:3000/dashboard/my-notes');
    });
  });

  describe('Auth routes (/login, /signup)', () => {
    it('redirects authenticated admin users from /login to /admin/dashboard', async () => {
      mockAuth.mockResolvedValue({
        user: { id: '1', role: USER_ROLES.ADMIN },
      });

      const request = createMockRequest('/login');
      const response = await middleware(request);

      expect(response.status).toBe(HTTP_STATUS.TEMPORARY_REDIRECT);
      const location = response.headers.get('location');
      expect(location).toBe('http://localhost:3000/admin/dashboard');
    });

    it('redirects authenticated regular users from /login to /dashboard/my-notes', async () => {
      mockAuth.mockResolvedValue({
        user: { id: '1', role: USER_ROLES.USER },
      });

      const request = createMockRequest('/login');
      const response = await middleware(request);

      expect(response.status).toBe(HTTP_STATUS.TEMPORARY_REDIRECT);
      const location = response.headers.get('location');
      expect(location).toBe('http://localhost:3000/dashboard/my-notes');
    });

    it('redirects authenticated super admins from /login to /admin/dashboard', async () => {
      mockAuth.mockResolvedValue({
        user: { id: '1', role: USER_ROLES.SUPER_ADMIN },
      });

      const request = createMockRequest('/login');
      const response = await middleware(request);

      expect(response.status).toBe(HTTP_STATUS.TEMPORARY_REDIRECT);
      const location = response.headers.get('location');
      expect(location).toBe('http://localhost:3000/admin/dashboard');
    });

    it('redirects authenticated admin users from /signup to /admin/dashboard', async () => {
      mockAuth.mockResolvedValue({
        user: { id: '1', role: USER_ROLES.ADMIN },
      });

      const request = createMockRequest('/signup');
      const response = await middleware(request);

      expect(response.status).toBe(HTTP_STATUS.TEMPORARY_REDIRECT);
      const location = response.headers.get('location');
      expect(location).toBe('http://localhost:3000/admin/dashboard');
    });

    it('redirects authenticated regular users from /signup to /dashboard/my-notes', async () => {
      mockAuth.mockResolvedValue({
        user: { id: '1', role: USER_ROLES.USER },
      });

      const request = createMockRequest('/signup');
      const response = await middleware(request);

      expect(response.status).toBe(HTTP_STATUS.TEMPORARY_REDIRECT);
      const location = response.headers.get('location');
      expect(location).toBe('http://localhost:3000/dashboard/my-notes');
    });

    it('allows unauthenticated users to access /login', async () => {
      mockAuth.mockResolvedValue(null);

      const request = createMockRequest('/login');
      const response = await middleware(request);

      expect(response.status).not.toBe(HTTP_STATUS.TEMPORARY_REDIRECT);
    });

    it('allows unauthenticated users to access /signup', async () => {
      mockAuth.mockResolvedValue(null);

      const request = createMockRequest('/signup');
      const response = await middleware(request);

      expect(response.status).not.toBe(HTTP_STATUS.TEMPORARY_REDIRECT);
    });

    it('allows authenticated users without role to access /login', async () => {
      mockAuth.mockResolvedValue({
        user: { id: '1' }, // no role
      });

      const request = createMockRequest('/login');
      const response = await middleware(request);

      expect(response.status).not.toBe(HTTP_STATUS.TEMPORARY_REDIRECT);
    });
  });

  describe('Other routes', () => {
    it('allows access to system-status', async () => {
      mockAuth.mockResolvedValue(null);

      const request = createMockRequest('/system-status');
      const response = await middleware(request);

      expect(response.status).not.toBe(HTTP_STATUS.TEMPORARY_REDIRECT);
    });

    it('allows access to api routes', async () => {
      mockAuth.mockResolvedValue(null);

      const request = createMockRequest('/api/health');
      const response = await middleware(request);

      expect(response.status).not.toBe(HTTP_STATUS.TEMPORARY_REDIRECT);
    });

    it('allows access to public routes not in matcher', async () => {
      mockAuth.mockResolvedValue(null);

      const request = createMockRequest('/pricing');
      const response = await middleware(request);

      expect(response.status).not.toBe(HTTP_STATUS.TEMPORARY_REDIRECT);
    });
  });

  describe('Edge cases', () => {
    it('handles session with missing user object', async () => {
      mockAuth.mockResolvedValue({
        // session exists but no user
      });

      const request = createMockRequest('/dashboard');
      const response = await middleware(request);

      expect(response.status).toBe(HTTP_STATUS.TEMPORARY_REDIRECT);
      const location = response.headers.get('location');
      expect(location).toBe('http://localhost:3000/login');
    });

    it('handles different base URLs correctly', async () => {
      mockAuth.mockResolvedValue({
        user: { id: '1', role: USER_ROLES.USER },
      });

      const request = createMockRequest('/dashboard', 'https://example.com');
      const response = await middleware(request);

      expect(response.status).toBe(HTTP_STATUS.TEMPORARY_REDIRECT);
      const location = response.headers.get('location');
      expect(location).toBe('https://example.com/dashboard/my-notes');
    });
    it('handles middleware with undefined role gracefully', async () => {
      mockAuth.mockResolvedValue({
        user: { id: '1', role: undefined },
      });

      const request = createMockRequest('/admin/dashboard');
      const response = await middleware(request);

      expect(response.status).toBe(HTTP_STATUS.TEMPORARY_REDIRECT);
      const location = response.headers.get('location');
      expect(location).toBe('http://localhost:3000/');
    });

    it('handles middleware with null role gracefully', async () => {
      mockAuth.mockResolvedValue({
        user: { id: '1', role: null },
      });

      const request = createMockRequest('/admin/dashboard');
      const response = await middleware(request);

      expect(response.status).toBe(HTTP_STATUS.TEMPORARY_REDIRECT);
      const location = response.headers.get('location');
      expect(location).toBe('http://localhost:3000/');
    });
  });
});
