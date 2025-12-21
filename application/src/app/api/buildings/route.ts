import { NextRequest, NextResponse } from 'next/server';
import { HTTP_STATUS } from 'lib/api/http';
import { withCompoundAuth } from 'lib/auth/withCompoundAuth';
import { createDatabaseService } from 'services/database/databaseFactory';
import { createBuildingSchema } from 'lib/validation/buildings';

/**
 * Buildings collection API (compound-scoped).
 *
 * GET: list buildings for active compound
 * POST: create building in active compound
 */
export const GET = withCompoundAuth(async (_req, ctx) => {
  if (!ctx.compound?.id) {
    return NextResponse.json({ error: 'Compound context is required' }, { status: HTTP_STATUS.BAD_REQUEST });
  }

  const db = await createDatabaseService();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const buildings = await (db as any).building?.listByCompound?.(ctx.compound.id);

  return NextResponse.json({ buildings: buildings ?? [] }, { status: HTTP_STATUS.OK });
}, { requireCompound: true });

export const POST = withCompoundAuth(async (req: NextRequest, ctx) => {
  if (!ctx.compound?.id) {
    return NextResponse.json({ error: 'Compound context is required' }, { status: HTTP_STATUS.BAD_REQUEST });
  }

  const parsed = createBuildingSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues?.[0]?.message ?? 'Invalid request body' },
      { status: HTTP_STATUS.BAD_REQUEST }
    );
  }

  const db = await createDatabaseService();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const created = await (db as any).building?.create?.({
    compoundId: ctx.compound.id,
    name: parsed.data.name,
  });

  return NextResponse.json({ building: created }, { status: HTTP_STATUS.CREATED });
}, { requireCompound: true, allowedCompoundRoles: ['COMPOUND_ADMIN'] });
