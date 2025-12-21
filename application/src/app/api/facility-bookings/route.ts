import { NextRequest, NextResponse } from 'next/server';
import { HTTP_STATUS } from 'lib/api/http';
import { withCompoundAuth } from 'lib/auth/withCompoundAuth';
import { createDatabaseService } from 'services/database/databaseFactory';
import { createFacilityBookingSchema } from 'lib/validation/facilityBookings';

/**
 * Facility Bookings collection API (compound-scoped).
 *
 * GET: list facility bookings for active compound (optional filters)
 * POST: create a facility booking in active compound
 */
export const GET = withCompoundAuth(async (req: NextRequest, ctx) => {
  if (!ctx.compound?.id) {
    return NextResponse.json({ error: 'Compound context is required' }, { status: HTTP_STATUS.BAD_REQUEST });
  }

  const { searchParams } = new URL(req.url);

  const status = searchParams.get('status') ?? undefined;
  const unitId = searchParams.get('unitId') ?? undefined;
  const residentId = searchParams.get('residentId') ?? undefined;
  const q = searchParams.get('q') ?? undefined;

  const db = await createDatabaseService();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const facilityBookings = await (db as any).facilityBooking?.listByCompound?.(ctx.compound.id, {
    status,
    unitId,
    residentId,
    q,
  });

  return NextResponse.json({ facilityBookings: facilityBookings ?? [] }, { status: HTTP_STATUS.OK });
}, { requireCompound: true });

export const POST = withCompoundAuth(async (req: NextRequest, ctx) => {
  if (!ctx.compound?.id) {
    return NextResponse.json({ error: 'Compound context is required' }, { status: HTTP_STATUS.BAD_REQUEST });
  }

  if (!ctx.user?.id) {
    return NextResponse.json({ error: 'User context is required' }, { status: HTTP_STATUS.UNAUTHORIZED });
  }

  const parsed = createFacilityBookingSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues?.[0]?.message ?? 'Invalid request body' },
      { status: HTTP_STATUS.BAD_REQUEST }
    );
  }

  const db = await createDatabaseService();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const created = await (db as any).facilityBooking?.create?.({
    compoundId: ctx.compound.id,
    facilityName: parsed.data.facilityName,
    startTime: new Date(parsed.data.startTime),
    endTime: new Date(parsed.data.endTime),
    status: parsed.data.status,
    unitId: parsed.data.unitId ?? null,
    residentId: parsed.data.residentId ?? null,
    bookedById: ctx.user.id,
  });

  return NextResponse.json({ facilityBooking: created }, { status: HTTP_STATUS.CREATED });
}, { requireCompound: true, allowedCompoundRoles: ['COMPOUND_ADMIN', 'RESIDENT_ADMIN', 'STAFF'] });
