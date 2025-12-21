import { HTTP_STATUS } from 'lib/api/http';
import { NextRequest, NextResponse } from 'next/server';
import { createDatabaseService } from 'services/database/databaseFactory';

/**
 * Fetches the active subscription for a user.
 *
 * @param user - The user object containing id and role and email.
 */
export const getSubscription = async (
  request: NextRequest,
  user: { id: string; role: string; email: string; compoundId: string }
): Promise<Response> => {
  try {
    const db = await createDatabaseService();
    const subscription = await db.subscription.findByUserId(user.compoundId);

    return NextResponse.json({ subscription: subscription });
  } catch (err: unknown) {
    console.error('Internal Server Error', err);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
};
