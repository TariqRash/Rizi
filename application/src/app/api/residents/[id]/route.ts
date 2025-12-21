import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withCompoundAuth } from 'lib/auth/withCompoundAuth';
import { createDatabaseService } from 'services/database/databaseFactory';
import { HTTP_STATUS } from 'lib/api/http';

const patchSchema = z
  .object({
    isPrimary: z.boolean().optional(),
    moveInDate: z.string().datetime().nullable().optional(),
    moveOutDate: z.string().datetime().nullable().optional(),
    unitId: z.string().min(1).optional(),
  })
  .strict();

export const GET = withCompoundAuth(
  async (_req, ctx, paramsPromise) => {
    const compoundId = ctx.compound?.id;
    if (!compoundId) {
      return NextResponse.json({ error: 'Compound context is required' }, { status: HTTP_STATUS.BAD_REQUEST });
    }

    const params = (await paramsPromise) ?? {};
    const id = params.id;
    if (!id) {
      return NextResponse.json({ error: 'Missing resident id' }, { status: HTTP_STATUS.BAD_REQUEST });
    }

    const db = await createDatabaseService();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const resident = await (db as any).resident?.findByIdWithRelations?.(id);

    if (!resident || resident.compoundId !== compoundId) {
      return NextResponse.json({ error: 'Not found' }, { status: HTTP_STATUS.NOT_FOUND });
    }

    return NextResponse.json({ resident }, { status: HTTP_STATUS.OK });
  },
  { requireCompound: true, allowedCompoundRoles: ['COMPOUND_ADMIN', 'RESIDENT_ADMIN'] }
);

export const PATCH = withCompoundAuth(
  async (req: NextRequest, ctx, paramsPromise) => {
    const compoundId = ctx.compound?.id;
    if (!compoundId) {
      return NextResponse.json({ error: 'Compound context is required' }, { status: HTTP_STATUS.BAD_REQUEST });
    }

    const params = (await paramsPromise) ?? {};
    const id = params.id;
    if (!id) {
      return NextResponse.json({ error: 'Missing resident id' }, { status: HTTP_STATUS.BAD_REQUEST });
    }

    const payload = patchSchema.parse(await req.json());

    const db = await createDatabaseService();

    // Ensure resident belongs to this compound
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const existing = await (db as any).resident?.findById?.(id);
    if (!existing || existing.compoundId !== compoundId) {
      return NextResponse.json({ error: 'Not found' }, { status: HTTP_STATUS.NOT_FOUND });
    }

    // If unitId is changing, validate target unit belongs to compound
    if (payload.unitId) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const unit = await (db as any).unit?.findById?.(payload.unitId);
      if (!unit || unit.compoundId !== compoundId) {
        return NextResponse.json({ error: 'Unit not found in this compound' }, { status: HTTP_STATUS.NOT_FOUND });
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updated = await (db as any).resident?.update?.(id, {
      isPrimary: payload.isPrimary,
      unitId: payload.unitId,
      moveInDate: payload.moveInDate === undefined ? undefined : payload.moveInDate ? new Date(payload.moveInDate) : null,
      moveOutDate:
        payload.moveOutDate === undefined ? undefined : payload.moveOutDate ? new Date(payload.moveOutDate) : null,
    });

    return NextResponse.json({ resident: updated }, { status: HTTP_STATUS.OK });
  },
  { requireCompound: true, allowedCompoundRoles: ['COMPOUND_ADMIN', 'RESIDENT_ADMIN'] }
);

export const DELETE = withCompoundAuth(
  async (_req, ctx, paramsPromise) => {
    const compoundId = ctx.compound?.id;
    if (!compoundId) {
      return NextResponse.json({ error: 'Compound context is required' }, { status: HTTP_STATUS.BAD_REQUEST });
    }

    const params = (await paramsPromise) ?? {};
    const id = params.id;
    if (!id) {
      return NextResponse.json({ error: 'Missing resident id' }, { status: HTTP_STATUS.BAD_REQUEST });
    }

    const db = await createDatabaseService();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const existing = await (db as any).resident?.findById?.(id);
    if (!existing || existing.compoundId !== compoundId) {
      return NextResponse.json({ error: 'Not found' }, { status: HTTP_STATUS.NOT_FOUND });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (db as any).resident?.remove?.(id);
    return NextResponse.json({ ok: true }, { status: HTTP_STATUS.OK });
  },
  { requireCompound: true, allowedCompoundRoles: ['COMPOUND_ADMIN', 'RESIDENT_ADMIN'] }
);
