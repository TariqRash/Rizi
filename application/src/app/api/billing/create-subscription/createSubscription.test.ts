import { HTTP_STATUS } from 'lib/api/http';
import { createSubscription } from './createSubscription';
import { NextRequest } from 'next/server';
import { SubscriptionPlanEnum } from 'types';

const mockCreateCustomer = jest.fn();
const mockCreateSubscription = jest.fn();
const mockDbCreate = jest.fn();
const mockDbUpdate = jest.fn();
const mockDbFindByUserId = jest.fn();

jest.mock('services/billing/billingFactory', () => ({
  createBillingService: () =>
    Promise.resolve({
      createCustomer: mockCreateCustomer,
      createSubscription: mockCreateSubscription,
    }),
}));
jest.mock('services/database/databaseFactory', () => ({
  createDatabaseService: () => ({
    subscription: {
      create: mockDbCreate,
      update: mockDbUpdate,
      findByUserId: mockDbFindByUserId,
    },
  }),
}));

describe('createSubscription API', () => {
  const user = { id: 'u1', role: 'user', email: 'test@example.com' };
  const plan = SubscriptionPlanEnum.FREE;
  const compoundId = 'c1';

  /* eslint-disable  @typescript-eslint/no-explicit-any */
  function mockRequest(body: any): NextRequest {
    return { json: jest.fn().mockResolvedValue(body) } as unknown as NextRequest;
  }
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 400 if plan is missing', async () => {
    const res = await createSubscription(mockRequest({}), user, compoundId);
    expect(res.status).toBe(HTTP_STATUS.BAD_REQUEST);
    expect(await res.json()).toEqual({ error: 'Plan is required' });
  });

  it('uses existing customer and returns clientSecret, updates user in db', async () => {
    mockDbFindByUserId.mockResolvedValue([{ customerId: 'cust1' }]);
    mockCreateSubscription.mockResolvedValue({ clientSecret: 'secret_abc' });
    mockDbUpdate.mockResolvedValue({});
    const res = await createSubscription(mockRequest({ plan }), user, compoundId);
    expect(res.status).toBe(HTTP_STATUS.OK);
    expect(await res.json()).toEqual({ clientSecret: 'secret_abc' });
    expect(mockDbFindByUserId).toHaveBeenCalledWith(compoundId);
    expect(mockCreateCustomer).not.toHaveBeenCalled();
    expect(mockCreateSubscription).toHaveBeenCalledWith('cust1', plan);
    expect(mockDbCreate).not.toHaveBeenCalled();
    expect(mockDbUpdate).toHaveBeenCalledWith(compoundId, expect.any(Object));
  });

  it('creates customer if not found and returns clientSecret, creates user in db', async () => {
    mockDbFindByUserId.mockResolvedValue([]);
    mockCreateCustomer.mockResolvedValue({ id: 'cust2' });
    mockCreateSubscription.mockResolvedValue({ clientSecret: 'secret_xyz' });
    mockDbCreate.mockResolvedValue({});
    mockDbUpdate.mockResolvedValue({});
    const res = await createSubscription(mockRequest({ plan }), user, compoundId);
    expect(res.status).toBe(HTTP_STATUS.OK);
    expect(await res.json()).toEqual({ clientSecret: 'secret_xyz' });
    expect(mockCreateCustomer).toHaveBeenCalledWith(user.email, { userId: user.email, compoundId });
    expect(mockCreateSubscription).toHaveBeenCalledWith('cust2', plan);
    expect(mockDbCreate).toHaveBeenCalledWith({
      customerId: 'cust2',
      plan: null,
      status: null,
      compoundId,
      userId: 'u1',
    });
    expect(mockDbUpdate).toHaveBeenCalledWith(compoundId, expect.any(Object));
  });

  it('returns 500 if db update fails after subscription', async () => {
    mockDbFindByUserId.mockResolvedValue([{ customerId: 'cust1' }]);
    mockCreateSubscription.mockResolvedValue({ clientSecret: 'secret_abc' });
    mockDbUpdate.mockRejectedValue(new Error('fail'));
    const res = await createSubscription(mockRequest({ plan }), user, compoundId);
    expect(res.status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
    expect(await res.json()).toEqual({ error: 'Internal Server Error' });
  });

  it('returns 500 on error from billing service', async () => {
    mockDbFindByUserId.mockRejectedValue(new Error('fail'));
    const res = await createSubscription(mockRequest({ plan }), user, compoundId);
    expect(res.status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
    expect(await res.json()).toEqual({ error: 'Internal Server Error' });
  });

  it('returns 500 if createCustomer fails', async () => {
    mockDbFindByUserId.mockResolvedValue([]);
    mockCreateCustomer.mockRejectedValue(new Error('fail'));
    const res = await createSubscription(mockRequest({ plan }), user, compoundId);
    expect(res.status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
    expect(await res.json()).toEqual({ error: 'Internal Server Error' });
  });

  it('returns 500 if createSubscription fails', async () => {
    mockDbFindByUserId.mockResolvedValue([{ customerId: 'cust1' }]);
    mockCreateSubscription.mockRejectedValue(new Error('fail'));
    const res = await createSubscription(mockRequest({ plan }), user, compoundId);
    expect(res.status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
    expect(await res.json()).toEqual({ error: 'Internal Server Error' });
  });
});
