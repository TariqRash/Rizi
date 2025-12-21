import { NextRequest, NextResponse } from 'next/server';
import { HTTP_STATUS } from 'lib/api/http';
import { withCompoundAuth } from 'lib/auth/withCompoundAuth';
import { createDatabaseService } from 'services/database/databaseFactory';
import { updateServiceRequestSchema } from 'lib/validation/serviceRequests';

/**
 * Service Request item API (compound-scoped).
 *
 * GET: fetch service request by id (must belong to active compound)
 * PATCH: update fields
 * DELETE: remove
 */
export const GET = withCompoundAuth(async (_req, ctx, paramsPromise) => {
  if (!ctx.compound?.id) {
    return NextResponse.json({ error: 'Compound context is required' }, { status: HTTP_STATUS.BAD_REQUEST });
  }

  const params = (await paramsPromise) ?? {};
  const id = (params as Record<string, string>).id;
  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: HTTP_STATUS.BAD_REQUEST });
  }

  const db = await createDatabaseService();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const existing = await (db as any).serviceRequest?.findById?.(id);

  if (!existing || existing.compoundId !== ctx.compound.id) {
    return NextResponse.json({ error: 'Service request not found' }, { status: HTTP_STATUS.NOT_FOUND });
  }

  return NextResponse.json({ serviceRequest: existing }, { status: HTTP_STATUS.OK });
}, { requireCompound: true });

export const PATCH = withCompoundAuth(async (req: NextRequest, ctx, paramsPromise) => {
  if (!ctx.compound?.id) {
    return NextResponse.json({ error: 'Compound context is required' }, { status: HTTP_STATUS.BAD_REQUEST });
  }

  const params = (await paramsPromise) ?? {};
  const id = (params as Record<string, string>).id;
  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: HTTP_STATUS.BAD_REQUEST });
  }

  const parsed = updateServiceRequestSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues?.[0]?.message ?? 'Invalid request body' },
      { status: HTTP_STATUS.BAD_REQUEST }
    );
  }

  const db = await createDatabaseService();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updated = await (db as any).serviceRequest?.update?.(id, ctx.compound.id, {
    title: parsed.data.title,
    description: parsed.data.description,
    status: parsed.data.status,
    priority: parsed.data.priority,
    unitId: parsed.data.unitId,
    residentId: parsed.data.residentId,
    providerId: parsed.data.providerId,
    scheduledFor: parsed.data.scheduledFor ? new Date(parsed.data.scheduledFor) : parsed.data.scheduledFor,
    resolvedAt: parsed.data.resolvedAt ? new Date(parsed.data.resolvedAt) : parsed.data.resolvedAt,
  });

  return NextResponse.json({ serviceRequest: updated }, { status: HTTP_STATUS.OK });
}, { requireCompound: true, allowedCompoundRoles: ['COMPOUND_ADMIN', 'RESIDENT_ADMIN', 'STAFF'] });

export const DELETE = withCompoundAuth(async (_req, ctx, paramsPromise) => {
  if (!ctx.compound?.id) {
    return NextResponse.json({ error: 'Compound context is required' }, { status: HTTP_STATUS.BAD_REQUEST });
  }

  const params = (await paramsPromise) ?? {};
  const id = (params as Record<string, string>).id;
  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: HTTP_STATUS.BAD_REQUEST });
  }

  const db = await createDatabaseService();

  // Confirm it belongs to this compound before delete so we return 404 instead of 500.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const existing = await (db as any).serviceRequest?.findById?.(id);
  if (!existing || existing.compoundId !== ctx.compound.id) {
    return NextResponse.json({ error: 'Service request not found' }, { status: HTTP_STATUS.NOT_FOUND });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (db as any).serviceRequest?.delete?.(id, ctx.compound.id);

  return NextResponse.json({ ok: true }, { status: HTTP_STATUS.OK });
}, { requireCompound: true, allowedCompoundRoles: ['COMPOUND_ADMIN', 'RESIDENT_ADMIN', 'STAFF'] });
