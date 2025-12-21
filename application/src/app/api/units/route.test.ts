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
  (req as unknown as { cookies: CookieStoreLike }).cookies = {
    get: (name: string) => {
      const value = init?.cookies?.[name];
      return value ? { value } : undefined;
    },
  };

  return req as unknown as Parameters<typeof GET>[0];
};

describe('/api/units', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('GET returns 401 when unauthenticated', async () => {
    auth.mockResolvedValue(null);

    const res = await GET(makeReq('http://localhost/api/units'), { params: Promise.resolve({}) } as { params: Promise<Record<string, string>> });
    expect(res.status).toBe(401);
  });

  it('GET returns 400 when no compound context', async () => {
    auth.mockResolvedValue({ user: { id: 'u1', role: 'ADMIN', email: 'a@a.com' } });
    createDatabaseService.mockResolvedValue({});

    const res = await GET(makeReq('http://localhost/api/units'), { params: Promise.resolve({}) } as { params: Promise<Record<string, string>> });
    expect(res.status).toBe(400);
  });

  it('GET lists units (supports buildingId filter)', async () => {
    auth.mockResolvedValue({ user: { id: 'u1', role: 'ADMIN', email: 'a@a.com' } });

    const listByCompound = jest.fn().mockResolvedValue([
      {
        id: 'u1-unit',
        number: '101',
        type: 'APARTMENT',
        status: 'VACANT',
        buildingId: 'b1',
        compoundId: 'c1',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    createDatabaseService.mockResolvedValue({
      compound: { findById: jest.fn().mockResolvedValue({ id: 'c1' }) },
      compoundRoleAssignment: {
        findForUser: jest.fn().mockResolvedValue({ compoundId: 'c1', userId: 'u1', role: 'COMPOUND_ADMIN' }),
      },
      unit: {
        listByCompound,
      },
    });

    const res = await GET(
      makeReq('http://localhost/api/units?buildingId=b1', { cookies: { active_compound_id: 'c1' } }),
      { params: Promise.resolve({}) } as { params: Promise<Record<string, string>> }
    );

    expect(res.status).toBe(200);
    expect(listByCompound).toHaveBeenCalledWith('c1', { buildingId: 'b1' });

    const json = await res.json();
    expect(json.units).toHaveLength(1);
    expect(json.units[0].number).toBe('101');
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
      makeReq('http://localhost/api/units', {
        method: 'POST',
        body: JSON.stringify({ buildingId: 'b1', number: '101', type: 'APARTMENT', status: 'VACANT' }),
        headers: { 'content-type': 'application/json' },
        cookies: { active_compound_id: 'c1' },
      }),
      { params: Promise.resolve({}) } as { params: Promise<Record<string, string>> }
    );

    expect(res.status).toBe(403);
  });
});
