import { GET, POST } from './route';

jest.mock('lib/auth/auth', () => ({
  auth: jest.fn(),
}));

jest.mock('services/database/databaseFactory', () => ({
  createDatabaseService: jest.fn(),
}));

const { auth } = jest.requireMock('lib/auth/auth') as { auth: jest.Mock };
const { createDatabaseService } = jest.requireMock('services/database/databaseFactory') as {
  createDatabaseService: jest.Mock;
};

type CookieGetResult = { value: string };
type CookieStoreLike = { get: (name: string) => CookieGetResult | undefined };

const makeReq = (url: string, init?: RequestInit & { cookies?: Record<string, string> }) => {
  const req = new Request(url, init);

  // next/server NextRequest provides cookies.get(). We shim minimally for our handlers.
  (req as unknown as { cookies: CookieStoreLike }).cookies = {
    get: (name: string) => {
      const value = init?.cookies?.[name];
      return value ? { value } : undefined;
    },
  };

  return req as unknown as Parameters<typeof GET>[0];
};

describe('/api/buildings', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('GET returns 401 when unauthenticated', async () => {
    auth.mockResolvedValue(null);

    const res = await GET(makeReq('http://localhost/api/buildings'), { params: Promise.resolve({}) } as { params: Promise<Record<string, string>> });
    expect(res.status).toBe(401);
  });

  it('GET returns 400 when no compound context', async () => {
    auth.mockResolvedValue({ user: { id: 'u1', role: 'ADMIN', email: 'a@a.com' } });
    createDatabaseService.mockResolvedValue({});

    const res = await GET(makeReq('http://localhost/api/buildings'), { params: Promise.resolve({}) } as { params: Promise<Record<string, string>> });
    expect(res.status).toBe(400);
  });

  it('GET lists buildings for the compound', async () => {
    auth.mockResolvedValue({ user: { id: 'u1', role: 'ADMIN', email: 'a@a.com' } });

    createDatabaseService.mockResolvedValue({
      compound: { findById: jest.fn().mockResolvedValue({ id: 'c1' }) },
      compoundRoleAssignment: {
        findForUser: jest.fn().mockResolvedValue({ compoundId: 'c1', userId: 'u1', role: 'COMPOUND_ADMIN' }),
      },
      building: {
        listByCompound: jest.fn().mockResolvedValue([{ id: 'b1', name: 'A', compoundId: 'c1', createdAt: new Date(), updatedAt: new Date() }]),
      },
    });

    const res = await GET(
      makeReq('http://localhost/api/buildings', { cookies: { active_compound_id: 'c1' } }),
      { params: Promise.resolve({}) } as { params: Promise<Record<string, string>> }
    );
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.buildings).toHaveLength(1);
    expect(json.buildings[0].id).toBe('b1');
  });

  it('POST requires compound admin', async () => {
    auth.mockResolvedValue({ user: { id: 'u1', role: 'ADMIN', email: 'a@a.com' } });

    createDatabaseService.mockResolvedValue({
      compound: { findById: jest.fn().mockResolvedValue({ id: 'c1' }) },
      compoundRoleAssignment: {
        findForUser: jest.fn().mockResolvedValue({ compoundId: 'c1', userId: 'u1', role: 'RESIDENT' }),
      },
    });

    const res = await POST(
      makeReq('http://localhost/api/buildings', {
        method: 'POST',
        body: JSON.stringify({ name: 'Building A' }),
        headers: { 'content-type': 'application/json' },
        cookies: { active_compound_id: 'c1' },
      }),
      { params: Promise.resolve({}) } as { params: Promise<Record<string, string>> }
    );

    expect(res.status).toBe(403);
  });
});
