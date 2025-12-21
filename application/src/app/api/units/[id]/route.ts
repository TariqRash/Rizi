import { NextRequest, NextResponse } from 'next/server';
import { HTTP_STATUS } from 'lib/api/http';
import { withCompoundAuth } from 'lib/auth/withCompoundAuth';
import { createDatabaseService } from 'services/database/databaseFactory';

type Params = { id: string };

type UpdateUnitBody = {
  number?: string;
  type?: string;
  status?: string;
};

/**
 * Single unit API (compound-scoped).
 */
export const GET = withCompoundAuth(async (_req, ctx, paramsPromise) => {
  const params = (await paramsPromise) as Params;

  if (!ctx.compound?.id) {
    return NextResponse.json({ error: 'Compound context is required' }, { status: HTTP_STATUS.BAD_REQUEST });
  }

  const db = await createDatabaseService();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const unit = await (db as any).unit?.findById?.(params.id);

  if (!unit || unit.compoundId !== ctx.compound.id) {
    return NextResponse.json({ error: 'Not found' }, { status: HTTP_STATUS.NOT_FOUND });
  }

  return NextResponse.json({ unit }, { status: HTTP_STATUS.OK });
}, { requireCompound: true });

export const PATCH = withCompoundAuth(async (req: NextRequest, ctx, paramsPromise) => {
  const params = (await paramsPromise) as Params;

  if (!ctx.compound?.id) {
    return NextResponse.json({ error: 'Compound context is required' }, { status: HTTP_STATUS.BAD_REQUEST });
  }

  const body = (await req.json().catch(() => ({}))) as UpdateUnitBody;

  const db = await createDatabaseService();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const existing = await (db as any).unit?.findById?.(params.id);
  if (!existing || existing.compoundId !== ctx.compound.id) {
    return NextResponse.json({ error: 'Not found' }, { status: HTTP_STATUS.NOT_FOUND });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updated = await (db as any).unit?.update?.(params.id, {
    number: body.number?.trim(),
    type: body.type,
    status: body.status,
  });

  return NextResponse.json({ unit: updated }, { status: HTTP_STATUS.OK });
}, { requireCompound: true, allowedCompoundRoles: ['COMPOUND_ADMIN'] });

export const DELETE = withCompoundAuth(async (_req, ctx, paramsPromise) => {
  const params = (await paramsPromise) as Params;

  if (!ctx.compound?.id) {
    return NextResponse.json({ error: 'Compound context is required' }, { status: HTTP_STATUS.BAD_REQUEST });
  }

  const db = await createDatabaseService();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const existing = await (db as any).unit?.findById?.(params.id);
  if (!existing || existing.compoundId !== ctx.compound.id) {
    return NextResponse.json({ error: 'Not found' }, { status: HTTP_STATUS.NOT_FOUND });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (db as any).unit?.delete?.(params.id);
  return NextResponse.json({ ok: true }, { status: HTTP_STATUS.OK });
}, { requireCompound: true, allowedCompoundRoles: ['COMPOUND_ADMIN'] });
