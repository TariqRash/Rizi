import { NextRequest, NextResponse } from 'next/server';
import { HTTP_STATUS } from 'lib/api/http';
import { withCompoundAuth } from 'lib/auth/withCompoundAuth';
import { createDatabaseService } from 'services/database/databaseFactory';
import { createServiceRequestSchema } from 'lib/validation/serviceRequests';

/**
 * Service Requests collection API (compound-scoped).
 *
 * GET: list service requests for active compound (optional filters)
 * POST: create a service request in active compound
 */
export const GET = withCompoundAuth(async (req: NextRequest, ctx) => {
  if (!ctx.compound?.id) {
    return NextResponse.json({ error: 'Compound context is required' }, { status: HTTP_STATUS.BAD_REQUEST });
  }

  const { searchParams } = new URL(req.url);

  const status = searchParams.get('status') ?? undefined;
  const priority = searchParams.get('priority') ?? undefined;
  const unitId = searchParams.get('unitId') ?? undefined;
  const residentId = searchParams.get('residentId') ?? undefined;
  const providerId = searchParams.get('providerId') ?? undefined;
  const q = searchParams.get('q') ?? undefined;

  const db = await createDatabaseService();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const serviceRequests = await (db as any).serviceRequest?.listByCompound?.(ctx.compound.id, {
    status,
    priority,
    unitId,
    residentId,
    providerId,
    q,
  });

  return NextResponse.json({ serviceRequests: serviceRequests ?? [] }, { status: HTTP_STATUS.OK });
}, { requireCompound: true });

export const POST = withCompoundAuth(async (req: NextRequest, ctx) => {
  if (!ctx.compound?.id) {
    return NextResponse.json({ error: 'Compound context is required' }, { status: HTTP_STATUS.BAD_REQUEST });
  }

  if (!ctx.user?.id) {
    return NextResponse.json({ error: 'User context is required' }, { status: HTTP_STATUS.UNAUTHORIZED });
  }

  const parsed = createServiceRequestSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues?.[0]?.message ?? 'Invalid request body' },
      { status: HTTP_STATUS.BAD_REQUEST }
    );
  }

  const db = await createDatabaseService();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const created = await (db as any).serviceRequest?.create?.({
    compoundId: ctx.compound.id,
    title: parsed.data.title,
    description: parsed.data.description,
    priority: parsed.data.priority,
    status: parsed.data.status,
    unitId: parsed.data.unitId ?? null,
    residentId: parsed.data.residentId ?? null,
    providerId: parsed.data.providerId ?? null,
    createdById: ctx.user.id,
    scheduledFor: parsed.data.scheduledFor ? new Date(parsed.data.scheduledFor) : null,
  });

  return NextResponse.json({ serviceRequest: created }, { status: HTTP_STATUS.CREATED });
}, { requireCompound: true, allowedCompoundRoles: ['COMPOUND_ADMIN', 'RESIDENT_ADMIN', 'STAFF'] });
