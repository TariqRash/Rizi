import { NextRequest, NextResponse } from 'next/server';
import { HTTP_STATUS } from 'lib/api/http';
import { withCompoundAuth } from 'lib/auth/withCompoundAuth';
import { createDatabaseService } from 'services/database/databaseFactory';

type CreateUnitBody = {
  buildingId: string;
  number: string;
  type: string;
  status?: string;
};

/**
 * Units collection API (compound-scoped).
 *
 * GET: list units for active compound (optionally filter by buildingId)
 * POST: create unit in active compound
 */
export const GET = withCompoundAuth(async (req, ctx) => {
  if (!ctx.compound?.id) {
    return NextResponse.json({ error: 'Compound context is required' }, { status: HTTP_STATUS.BAD_REQUEST });
  }

  const { searchParams } = new URL(req.url);
  const buildingId = searchParams.get('buildingId');

  const db = await createDatabaseService();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const units = await (db as any).unit?.listByCompound?.(ctx.compound.id, { buildingId: buildingId ?? undefined });

  return NextResponse.json({ units: units ?? [] }, { status: HTTP_STATUS.OK });
}, { requireCompound: true });

export const POST = withCompoundAuth(async (req: NextRequest, ctx) => {
  if (!ctx.compound?.id) {
    return NextResponse.json({ error: 'Compound context is required' }, { status: HTTP_STATUS.BAD_REQUEST });
  }

  const body = (await req.json().catch(() => ({}))) as Partial<CreateUnitBody>;

  if (!body.buildingId || typeof body.buildingId !== 'string') {
    return NextResponse.json({ error: 'buildingId is required' }, { status: HTTP_STATUS.BAD_REQUEST });
  }
  if (!body.number || typeof body.number !== 'string') {
    return NextResponse.json({ error: 'number is required' }, { status: HTTP_STATUS.BAD_REQUEST });
  }
  if (!body.type || typeof body.type !== 'string') {
    return NextResponse.json({ error: 'type is required' }, { status: HTTP_STATUS.BAD_REQUEST });
  }

  const db = await createDatabaseService();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const created = await (db as any).unit?.create?.({
    compoundId: ctx.compound.id,
    buildingId: body.buildingId,
    number: body.number.trim(),
    type: body.type,
    status: body.status,
  });

  return NextResponse.json({ unit: created }, { status: HTTP_STATUS.CREATED });
}, { requireCompound: true, allowedCompoundRoles: ['COMPOUND_ADMIN'] });
