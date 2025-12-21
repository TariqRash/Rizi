import { SubscriptionPlanEnum, SubscriptionStatusEnum } from 'types';
import { getSubscription } from './getSubscription';
import { NextRequest } from 'next/server';
import { HTTP_STATUS } from 'lib/api/http';

const mockFindByUserId = jest.fn();

jest.mock('services/database/databaseFactory', () => ({
  createDatabaseService: () => ({
    subscription: { findByUserId: mockFindByUserId },
  }),
}));

describe('getSubscription API', () => {
  const user = { id: 'u1', role: 'user', email: 'test@example.com', compoundId: 'c1' };
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns null if no subscription found', async () => {
    mockFindByUserId.mockResolvedValue(null);
    const res = await getSubscription({} as NextRequest, user);
    expect(res.status).toBe(HTTP_STATUS.OK);
    expect(await res.json()).toEqual({ subscription: null });
  });

  it('returns first subscription if found', async () => {
    const sub = {
      id: 'sub1',
      status: SubscriptionStatusEnum.ACTIVE,
      plan: SubscriptionPlanEnum.PRO,
    };
    mockFindByUserId.mockResolvedValue(sub);
    const res = await getSubscription({} as NextRequest, user);
    expect(res.status).toBe(HTTP_STATUS.OK);
    expect(await res.json()).toEqual({ subscription: sub });
  });

  it('returns 500 on error', async () => {
    mockFindByUserId.mockRejectedValue(new Error('fail'));
    const res = await getSubscription({} as NextRequest, user);
    expect(res.status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
    expect(await res.json()).toEqual({ error: 'Internal Server Error' });
  });
});
