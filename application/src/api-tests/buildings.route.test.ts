/* eslint-disable @typescript-eslint/no-explicit-any */

import { GET, POST } from '../app/api/buildings/route';
import { makeTestReq } from './testRequest';

jest.mock('lib/auth/auth', () => ({
  auth: jest.fn(),
}));

jest.mock('../services/database/databaseFactory', () => ({
  createDatabaseService: jest.fn(),
}));

const { auth } = jest.requireMock('lib/auth/auth') as { auth: jest.Mock };
const { createDatabaseService } = jest.requireMock('../services/database/databaseFactory') as {
  createDatabaseService: jest.Mock;
};

describe('API /buildings', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('GET returns 401 when unauthenticated', async () => {
    auth.mockResolvedValue(null);

    const res = await GET(makeTestReq('http://localhost/api/buildings') as any, { params: Promise.resolve({}) } as any);
    expect(res.status).toBe(401);
  });

  it('GET returns 400 when no compound context', async () => {
    auth.mockResolvedValue({ user: { id: 'u1', role: 'ADMIN', email: 'a@a.com' } });
    createDatabaseService.mockResolvedValue({});

    const res = await GET(makeTestReq('http://localhost/api/buildings') as any, { params: Promise.resolve({}) } as any);
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
        listByCompound: jest.fn().mockResolvedValue([
          { id: 'b1', name: 'A', compoundId: 'c1', createdAt: new Date(), updatedAt: new Date(), _count: { units: 0 } },
        ]),
      },
    });

    const res = await GET(
      makeTestReq('http://localhost/api/buildings', { cookies: { active_compound_id: 'c1' } }) as any,
      { params: Promise.resolve({}) } as any
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
      makeTestReq('http://localhost/api/buildings', {
        method: 'POST',
        body: JSON.stringify({ name: 'Building A' }),
        headers: { 'content-type': 'application/json' },
        cookies: { active_compound_id: 'c1' },
      }) as any,
      { params: Promise.resolve({}) } as any
    );

    expect(res.status).toBe(403);
  });
});
