import { NextRequest, NextResponse } from 'next/server';
import { HTTP_STATUS } from 'lib/api/http';
import { withCompoundAuth } from 'lib/auth/withCompoundAuth';
import { createDatabaseService } from 'services/database/databaseFactory';
import { updateBuildingSchema } from 'lib/validation/buildings';

type Params = { id: string };

/**
 * Single building API (compound-scoped).
 *
 * GET: fetch building by id (must belong to active compound)
 * PATCH: update building name
 * DELETE: delete building (only if no units)
 */
export const GET = withCompoundAuth(async (_req, ctx, paramsPromise) => {
  const params = (await paramsPromise) as Params;

  if (!ctx.compound?.id) {
    return NextResponse.json({ error: 'Compound context is required' }, { status: HTTP_STATUS.BAD_REQUEST });
  }

  const db = await createDatabaseService();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const building = await (db as any).building?.findById?.(params.id);

  if (!building || building.compoundId !== ctx.compound.id) {
    return NextResponse.json({ error: 'Not found' }, { status: HTTP_STATUS.NOT_FOUND });
  }

  return NextResponse.json({ building }, { status: HTTP_STATUS.OK });
}, { requireCompound: true });

export const PATCH = withCompoundAuth(async (req: NextRequest, ctx, paramsPromise) => {
  const params = (await paramsPromise) as Params;

  if (!ctx.compound?.id) {
    return NextResponse.json({ error: 'Compound context is required' }, { status: HTTP_STATUS.BAD_REQUEST });
  }

  const parsed = updateBuildingSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues?.[0]?.message ?? 'Invalid request body' },
      { status: HTTP_STATUS.BAD_REQUEST }
    );
  }

  const db = await createDatabaseService();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const existing = await (db as any).building?.findById?.(params.id);
  if (!existing || existing.compoundId !== ctx.compound.id) {
    return NextResponse.json({ error: 'Not found' }, { status: HTTP_STATUS.NOT_FOUND });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updated = await (db as any).building?.update?.(params.id, { name: parsed.data.name });
  return NextResponse.json({ building: updated }, { status: HTTP_STATUS.OK });
}, { requireCompound: true, allowedCompoundRoles: ['COMPOUND_ADMIN'] });

export const DELETE = withCompoundAuth(async (_req, ctx, paramsPromise) => {
  const params = (await paramsPromise) as Params;

  if (!ctx.compound?.id) {
    return NextResponse.json({ error: 'Compound context is required' }, { status: HTTP_STATUS.BAD_REQUEST });
  }

  const db = await createDatabaseService();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const existing = await (db as any).building?.findByIdWithCounts?.(params.id);

  if (!existing || existing.compoundId !== ctx.compound.id) {
    return NextResponse.json({ error: 'Not found' }, { status: HTTP_STATUS.NOT_FOUND });
  }

  if ((existing._count?.units ?? 0) > 0) {
    return NextResponse.json({ error: 'Cannot delete a building with units' }, { status: HTTP_STATUS.CONFLICT });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (db as any).building?.delete?.(params.id);
  return NextResponse.json({ ok: true }, { status: HTTP_STATUS.OK });
}, { requireCompound: true, allowedCompoundRoles: ['COMPOUND_ADMIN'] });
