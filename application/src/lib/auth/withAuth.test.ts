import { HTTP_STATUS } from 'lib/api/http';
import { USER_ROLES } from './roles';
import { withAuth } from './withAuth';
import { NextRequest, NextResponse } from 'next/server';
import { TENANT_HEADER } from 'lib/tenant/tenantResolver';

const mockAuth = jest.fn();

jest.mock('lib/auth/auth', () => ({
  auth: () => mockAuth(),
}));

const createMockRequest = (tenantId = 'tenant-1'): NextRequest => {
  return {
    headers: new Headers(tenantId ? { [TENANT_HEADER]: tenantId } : {}),
  } as unknown as NextRequest;
};

describe('withAuth', () => {
  const handler = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 401 if session is missing', async () => {
    mockAuth.mockResolvedValue(null);
    const wrapped = withAuth(handler);
    const response = await wrapped(createMockRequest(), { params: Promise.resolve({}) });
    const json = await response.json();
    expect(response.status).toBe(HTTP_STATUS.UNAUTHORIZED);
    expect(json).toEqual({ error: 'Unauthorized' });
    expect(handler).not.toHaveBeenCalled();
  });

  it('returns 401 if session has no user id or role', async () => {
    mockAuth.mockResolvedValue({ user: { id: null, role: null, compoundId: null } });
    const wrapped = withAuth(handler);
    const response = await wrapped(createMockRequest(), { params: Promise.resolve({}) });
    const json = await response.json();
    expect(response.status).toBe(HTTP_STATUS.UNAUTHORIZED);
    expect(json).toEqual({ error: 'Unauthorized' });
    expect(handler).not.toHaveBeenCalled();
  });

  it('returns 403 if tenant header is missing', async () => {
    mockAuth.mockResolvedValue({ user: { id: '123', role: USER_ROLES.USER, compoundId: 'tenant-1' } });
    const wrapped = withAuth(handler);
    const response = await wrapped(createMockRequest(undefined), { params: Promise.resolve({}) });
    const json = await response.json();
    expect(response.status).toBe(HTTP_STATUS.FORBIDDEN);
    expect(json).toEqual({ error: 'Forbidden' });
    expect(handler).not.toHaveBeenCalled();
  });

  it('returns 403 if tenant header does not match session compound', async () => {
    mockAuth.mockResolvedValue({ user: { id: '123', role: USER_ROLES.USER, compoundId: 'tenant-2' } });
    const wrapped = withAuth(handler);
    const response = await wrapped(createMockRequest('tenant-1'), { params: Promise.resolve({}) });
    const json = await response.json();
    expect(response.status).toBe(HTTP_STATUS.FORBIDDEN);
    expect(json).toEqual({ error: 'Forbidden' });
    expect(handler).not.toHaveBeenCalled();
  });

  it('returns 403 if user role is not allowed', async () => {
    mockAuth.mockResolvedValue({ user: { id: '123', role: USER_ROLES.USER, compoundId: 'tenant-1' } });
    const wrapped = withAuth(handler, { allowedRoles: [USER_ROLES.ADMIN] });
    const response = await wrapped(createMockRequest(), { params: Promise.resolve({}) });
    const json = await response.json();
    expect(response.status).toBe(HTTP_STATUS.FORBIDDEN);
    expect(json).toEqual({ error: 'Forbidden' });
    expect(handler).not.toHaveBeenCalled();
  });

  it('calls handler with valid session and no role restriction', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1', role: USER_ROLES.ADMIN, compoundId: 'tenant-1' } });
    const mockRes = NextResponse.json({ ok: true });
    handler.mockResolvedValue(mockRes);

    const wrapped = withAuth(handler);
    const params = { foo: 'bar' };
    const response = await wrapped(createMockRequest(), { params: Promise.resolve(params) });

    expect(response).toBe(mockRes);
    expect(handler).toHaveBeenCalledWith(
      expect.any(Object),
      {
        id: 'user-1',
        role: USER_ROLES.ADMIN,
        compoundId: 'tenant-1',
        email: undefined,
      },
      Promise.resolve(params)
    );
  });

  it('calls handler when role is allowed', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-2', role: USER_ROLES.USER, compoundId: 'tenant-1' } });
    const mockRes = NextResponse.json({ ok: true });
    handler.mockResolvedValue(mockRes);

    const wrapped = withAuth(handler, { allowedRoles: [USER_ROLES.USER] });
    const params = { foo: 'bar' };
    const response = await wrapped(createMockRequest(), { params: Promise.resolve(params) });

    expect(response).toBe(mockRes);
    expect(handler).toHaveBeenCalledWith(
      expect.any(Object),
      {
        id: 'user-2',
        role: USER_ROLES.USER,
        compoundId: 'tenant-1',
        email: undefined,
      },
      Promise.resolve(params)
    );
  });

  it('returns 500 if handler throws', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-3', role: USER_ROLES.ADMIN, compoundId: 'tenant-1' } });
    handler.mockRejectedValue(new Error('Unexpected error'));

    const wrapped = withAuth(handler);
    const response = await wrapped(createMockRequest(), { params: Promise.resolve({}) });
    const json = await response.json();

    expect(response.status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
    expect(json).toEqual({ error: 'Internal server error' });
  });
});
