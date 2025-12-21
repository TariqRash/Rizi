import { NextRequest, NextResponse } from 'next/server';
import { HTTP_STATUS } from 'lib/api/http';
import { withAuth } from 'lib/auth/withAuth';
import { createDatabaseService } from 'services/database/databaseFactory';
import { createBillingService } from 'services/billing/billingFactory';
import { SubscriptionPlanEnum, SubscriptionStatusEnum } from 'types';

/**
 * Creates the first compound for a newly signed-up user.
 * - Creates a Compound
 * - Assigns the user as COMPOUND_ADMIN
 * - Sets active_compound_id cookie
 * - Creates/initializes a FREE compound subscription (Stripe customer + subscription)
 */
async function handler(req: NextRequest, user: { id: string; role: string; email: string }) {
  const { name, address } = await req.json().catch(() => ({ name: null, address: null }));

  if (!name || typeof name !== 'string') {
    return NextResponse.json({ error: 'Compound name is required' }, { status: HTTP_STATUS.BAD_REQUEST });
  }

  const db = await createDatabaseService();

  // If user already has a compound, return it (idempotent onboarding)
  // DatabaseClient base type doesn't include compound helpers; concrete SQL service does.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const existing = await (db as any).compound?.findFirstForUser?.(user.id);
  if (existing) {
    const res = NextResponse.json({ ok: true, compoundId: existing.id }, { status: HTTP_STATUS.OK });
    res.cookies.set('active_compound_id', existing.id, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
    });
    return res;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const compound = await (db as any).compound.create({ name, address });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (db as any).compoundRoleAssignment.create({
    compoundId: compound.id,
    userId: user.id,
    role: 'COMPOUND_ADMIN',
  });

  // Initialize billing for the compound (FREE)
  try {
    const billingService = await createBillingService();
    const config = await billingService.checkConfiguration();

    if (config.configured && config.connected) {
      const customer = await billingService.createCustomer(user.email, {
        userId: user.email,
        compoundId: compound.id,
      });

      await db.subscription.create({
        compoundId: compound.id,
        userId: user.id,
        customerId: customer.id,
        plan: null,
        status: null,
      });

      await billingService.createSubscription(customer.id, SubscriptionPlanEnum.FREE);

      await db.subscription.update(compound.id, {
        status: SubscriptionStatusEnum.PENDING,
        plan: SubscriptionPlanEnum.FREE,
      });
    }
  } catch {
    // Billing can be configured later; compound onboarding should still succeed.
  }

  const res = NextResponse.json({ ok: true, compoundId: compound.id }, { status: HTTP_STATUS.OK });
  res.cookies.set('active_compound_id', compound.id, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
  });
  return res;
}

export const POST = withAuth(handler);
