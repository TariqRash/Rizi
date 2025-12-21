/* eslint-disable @typescript-eslint/no-explicit-any */

import { GET as LIST, POST as ASSIGN } from '../app/api/residents/route';
import { PATCH as UPDATE } from '../app/api/residents/[id]/route';
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

describe('API /residents', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('GET returns 401 when unauthenticated', async () => {
    auth.mockResolvedValue(null);
    const res = await LIST(makeTestReq('http://localhost/api/residents') as any, { params: Promise.resolve({}) } as any);
    expect(res.status).toBe(401);
  });

  it('GET returns 403 for non-admin compound roles', async () => {
    auth.mockResolvedValue({ user: { id: 'u1', role: 'ADMIN', email: 'a@a.com' } });

    createDatabaseService.mockResolvedValue({
      compound: { findById: jest.fn().mockResolvedValue({ id: 'c1' }) },
      compoundRoleAssignment: {
        findForUser: jest.fn().mockResolvedValue({ compoundId: 'c1', userId: 'u1', role: 'RESIDENT' }),
      },
      resident: { listByCompound: jest.fn() },
    });

    const res = await LIST(
      makeTestReq('http://localhost/api/residents', { cookies: { active_compound_id: 'c1' } }) as any,
      { params: Promise.resolve({}) } as any
    );

    expect(res.status).toBe(403);
  });

  it('POST assigns a resident and unsets previous primary (service-level)', async () => {
    auth.mockResolvedValue({ user: { id: 'u1', role: 'ADMIN', email: 'a@a.com' } });

    const assign = jest.fn().mockResolvedValue({ id: 'r1', userId: 'u2', unitId: 'unit1', compoundId: 'c1', isPrimary: true });

    createDatabaseService.mockResolvedValue({
      compound: { findById: jest.fn().mockResolvedValue({ id: 'c1' }) },
      compoundRoleAssignment: {
        findForUser: jest.fn().mockResolvedValue({ compoundId: 'c1', userId: 'u1', role: 'COMPOUND_ADMIN' }),
      },
      unit: { findById: jest.fn().mockResolvedValue({ id: 'unit1', compoundId: 'c1' }) },
      resident: { assign },
    });

    const res = await ASSIGN(
      makeTestReq('http://localhost/api/residents', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ userId: 'u2', unitId: 'unit1', isPrimary: true }),
        cookies: { active_compound_id: 'c1' },
      }) as any,
      { params: Promise.resolve({}) } as any
    );

    expect(res.status).toBe(201);
    expect(assign).toHaveBeenCalledWith({
      compoundId: 'c1',
      unitId: 'unit1',
      userId: 'u2',
      isPrimary: true,
      moveInDate: null,
    });
  });

  it('PATCH can set primary', async () => {
    auth.mockResolvedValue({ user: { id: 'u1', role: 'ADMIN', email: 'a@a.com' } });

    const update = jest.fn().mockResolvedValue({ id: 'r1', isPrimary: true, unitId: 'unit1', compoundId: 'c1' });

    createDatabaseService.mockResolvedValue({
      compound: { findById: jest.fn().mockResolvedValue({ id: 'c1' }) },
      compoundRoleAssignment: {
        findForUser: jest.fn().mockResolvedValue({ compoundId: 'c1', userId: 'u1', role: 'RESIDENT_ADMIN' }),
      },
      resident: {
        findById: jest.fn().mockResolvedValue({ id: 'r1', compoundId: 'c1', unitId: 'unit1' }),
        update,
      },
    });

    const res = await UPDATE(
      makeTestReq('http://localhost/api/residents/r1', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ isPrimary: true }),
        cookies: { active_compound_id: 'c1' },
      }) as any,
      { params: Promise.resolve({ id: 'r1' }) } as any
    );

    expect(res.status).toBe(200);
    expect(update).toHaveBeenCalled();
  });
});
