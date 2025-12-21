import { NextRequest, NextResponse } from 'next/server';
import { SubscriptionPlan, SubscriptionStatusEnum } from 'types';
import { HTTP_STATUS } from 'lib/api/http';
import { createDatabaseService } from 'services/database/databaseFactory';
import { createBillingService } from 'services/billing/billingFactory';

/**
 * Creates a subscription for a user. Free or Pro plans are supported.
 *
 * @param user - The user object containing id and role and email.
 */
export const createSubscription = async (
  request: NextRequest,
  user: { id: string; role: string; email: string },
  compoundId: string
): Promise<Response> => {
  try {
    const billingService = await createBillingService();

    const { plan }: { plan: SubscriptionPlan } = await request.json();

    if (!plan) {
      return NextResponse.json({ error: 'Plan is required' }, { status: HTTP_STATUS.BAD_REQUEST });
    }

    let customerId;

    const db = await createDatabaseService();

  const subscription = await db.subscription.findByUserId(compoundId);

    if (subscription.length) {
      customerId = subscription[0].customerId;
    }

    if (!customerId) {
      const customer = await billingService.createCustomer(user.email, {
        userId: user.email,
        compoundId,
      });
      customerId = customer.id;
      await db.subscription.create({
        customerId: customer.id,
        plan: null,
        status: null,
        compoundId,
        userId: user.id,
      });
    }

    const { clientSecret } = await billingService.createSubscription(customerId, plan);

    await db.subscription.update(compoundId, {
      status: SubscriptionStatusEnum.PENDING,
      plan,
    });

    return NextResponse.json({ clientSecret });
  } catch (err: unknown) {
    console.error('Internal Server Error', err);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
};
