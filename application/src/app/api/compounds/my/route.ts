import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from 'lib/auth/withAuth';
import { HTTP_STATUS } from 'lib/api/http';
import { createDatabaseService } from 'services/database/databaseFactory';

/**
 * Returns the list of compounds the current user belongs to.
 * Used for multi-compound users to select active tenant context.
 */
async function handler(_req: NextRequest, user: { id: string }) {
  const db = await createDatabaseService();

  // DatabaseClient base type doesn't include compound helpers; concrete SQL service does.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const assignments = await (db as any).compoundRoleAssignment?.listForUser?.(user.id);
  if (!assignments) {
    return NextResponse.json({ compounds: [] }, { status: HTTP_STATUS.OK });
  }

  const compoundIds = assignments.map((a: { compoundId: string }) => a.compoundId);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const compounds = await (db as any).compound?.findManyByIds?.(compoundIds);

  const roleByCompound = new Map<string, string>(
    assignments.map((a: { compoundId: string; role: string }) => [a.compoundId, a.role])
  );

  return NextResponse.json(
    {
      compounds: (compounds ?? []).map((c: { id: string; name: string; address?: string | null }) => ({
        id: c.id,
        name: c.name,
        address: c.address ?? null,
        role: roleByCompound.get(c.id) ?? null,
      })),
    },
    { status: HTTP_STATUS.OK }
  );
}

export const GET = withAuth(handler);
