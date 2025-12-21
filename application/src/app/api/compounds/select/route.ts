import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from 'lib/auth/withAuth';
import { HTTP_STATUS } from 'lib/api/http';
import { createDatabaseService } from 'services/database/databaseFactory';

/**
 * Sets the active compound cookie after verifying the current user
 * is assigned to the specified compound.
 */
async function handler(req: NextRequest, user: { id: string }) {
  const { compoundId } = await req.json().catch(() => ({ compoundId: null }));

  if (!compoundId || typeof compoundId !== 'string') {
    return NextResponse.json({ error: 'compoundId is required' }, { status: HTTP_STATUS.BAD_REQUEST });
  }

  const db = await createDatabaseService();
  // DatabaseClient base type doesn't include compound helpers; concrete SQL service does.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const assignment = await (db as any).compoundRoleAssignment?.findForUser?.(compoundId, user.id);

  if (!assignment) {
    return NextResponse.json({ error: 'Not a member of this compound' }, { status: HTTP_STATUS.FORBIDDEN });
  }

  const res = NextResponse.json({ ok: true }, { status: HTTP_STATUS.OK });
  res.cookies.set('active_compound_id', compoundId, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
  });
  return res;
}

export const POST = withAuth(handler);
