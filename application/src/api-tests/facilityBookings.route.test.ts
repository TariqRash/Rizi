/* eslint-disable @typescript-eslint/no-explicit-any */

import { GET, POST } from '../app/api/facility-bookings/route';
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

describe('API /facility-bookings', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('GET returns 401 when unauthenticated', async () => {
    auth.mockResolvedValue(null);

    const res = await GET(makeTestReq('http://localhost/api/facility-bookings') as any, {
      params: Promise.resolve({}),
    } as any);

    expect(res.status).toBe(401);
  });

  it('POST requires allowed compound role', async () => {
    auth.mockResolvedValue({ user: { id: 'u1', role: 'USER', email: 'u@u.com' } });

    createDatabaseService.mockResolvedValue({
      compound: { findById: jest.fn().mockResolvedValue({ id: 'c1' }) },
      compoundRoleAssignment: {
        findForUser: jest.fn().mockResolvedValue({ compoundId: 'c1', userId: 'u1', role: 'RESIDENT' }),
      },
    });

    const res = await POST(
      makeTestReq('http://localhost/api/facility-bookings', {
        method: 'POST',
        body: JSON.stringify({ facilityName: 'Pool', startTime: new Date().toISOString(), endTime: new Date().toISOString() }),
        headers: { 'content-type': 'application/json' },
        cookies: { active_compound_id: 'c1' },
      }) as any,
      { params: Promise.resolve({}) } as any
    );

    expect(res.status).toBe(403);
  });

  it('POST creates in compound and GET lists', async () => {
    auth.mockResolvedValue({ user: { id: 'u1', role: 'USER', email: 'u@u.com' } });

    const listByCompound = jest.fn().mockResolvedValue([
      {
        id: 'fb1',
        compoundId: 'c1',
        facilityName: 'Pool',
        startTime: new Date(),
        endTime: new Date(),
        status: 'REQUESTED',
        bookedById: 'u1',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    const create = jest.fn().mockResolvedValue({
      id: 'fb1',
      compoundId: 'c1',
      facilityName: 'Pool',
      startTime: new Date(),
      endTime: new Date(),
      status: 'REQUESTED',
      bookedById: 'u1',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    createDatabaseService.mockResolvedValue({
      compound: { findById: jest.fn().mockResolvedValue({ id: 'c1' }) },
      compoundRoleAssignment: {
        findForUser: jest.fn().mockResolvedValue({ compoundId: 'c1', userId: 'u1', role: 'STAFF' }),
      },
      facilityBooking: {
        listByCompound,
        create,
      },
    });

    const createRes = await POST(
      makeTestReq('http://localhost/api/facility-bookings', {
        method: 'POST',
        body: JSON.stringify({
          facilityName: 'Pool',
          startTime: new Date().toISOString(),
          endTime: new Date().toISOString(),
        }),
        headers: { 'content-type': 'application/json' },
        cookies: { active_compound_id: 'c1' },
      }) as any,
      { params: Promise.resolve({}) } as any
    );

    expect(createRes.status).toBe(201);
    const createJson = await createRes.json();
    expect(createJson.facilityBooking.id).toBe('fb1');

    const listRes = await GET(
      makeTestReq('http://localhost/api/facility-bookings', { cookies: { active_compound_id: 'c1' } }) as any,
      { params: Promise.resolve({}) } as any
    );

    expect(listRes.status).toBe(200);
    const listJson = await listRes.json();
    expect(listJson.facilityBookings).toHaveLength(1);
    expect(listJson.facilityBookings[0].compoundId).toBe('c1');
  });
});
