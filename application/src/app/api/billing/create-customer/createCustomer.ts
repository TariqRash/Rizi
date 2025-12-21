import { HTTP_STATUS } from 'lib/api/http';
import { NextRequest, NextResponse } from 'next/server';
import { createBillingService } from 'services/billing/billingFactory';
import { createDatabaseService } from 'services/database/databaseFactory';

/**
 * Creates a customer in the billing system.
 *
 * @param user - The user object containing id and role and email.
 */
export const createCustomer = async (
  request: NextRequest,
  user: { id: string; role: string; email: string }
): Promise<Response> => {
  try {
    // Billing is compound-scoped. This endpoint is still callable, but it must receive
    // an active compound context (sent via header or cookie) so we can attach the
    // customer record + local subscription row to the right compound.
    const compoundId =
      request.headers.get('x-compound-id') ??
      request.cookies.get('active_compound_id')?.value ??
      null;

    if (!compoundId) {
      return NextResponse.json(
        { error: 'Compound context is required' },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    const billingService = await createBillingService();

    const customers = await billingService.listCustomer(user.email);

    if (customers.length > 0) {
      return NextResponse.json({ customerId: customers[0].id });
    }

    const customer = await billingService.createCustomer(user.email, {
      userId: user.email,
      compoundId,
    });

    const db = await createDatabaseService();
    await db.subscription.create({
      compoundId,
      customerId: customer.id,
      plan: null,
      status: null,
      userId: user.id,
    });

    return NextResponse.json({ customerId: customer.id });
  } catch (err: unknown) {
    console.error('Internal Server Error', err);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
};
