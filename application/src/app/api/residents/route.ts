import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withCompoundAuth } from 'lib/auth/withCompoundAuth';
import { createDatabaseService } from 'services/database/databaseFactory';
import { HTTP_STATUS } from 'lib/api/http';

const postSchema = z.object({
  userId: z.string().min(1),
  unitId: z.string().min(1),
  isPrimary: z.boolean().optional(),
  moveInDate: z.string().datetime().optional(),
});

export const GET = withCompoundAuth(
  async (req: NextRequest, ctx) => {
    const compoundId = ctx.compound?.id;
    if (!compoundId) {
      return NextResponse.json({ error: 'Compound context is required' }, { status: HTTP_STATUS.BAD_REQUEST });
    }

    const url = new URL(req.url);
    const unitId = url.searchParams.get('unitId') ?? undefined;
    const buildingId = url.searchParams.get('buildingId') ?? undefined;
    const q = url.searchParams.get('q') ?? undefined;

    const db = await createDatabaseService();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const residents = await (db as any).resident?.listByCompound?.(compoundId, { unitId, buildingId, q });

    return NextResponse.json({ residents: residents ?? [] }, { status: HTTP_STATUS.OK });
  },
  {
    requireCompound: true,
    allowedCompoundRoles: ['COMPOUND_ADMIN', 'RESIDENT_ADMIN'],
  }
);

export const POST = withCompoundAuth(
  async (req: NextRequest, ctx) => {
    const compoundId = ctx.compound?.id;
    if (!compoundId) {
      return NextResponse.json({ error: 'Compound context is required' }, { status: HTTP_STATUS.BAD_REQUEST });
    }

    const body = postSchema.parse(await req.json());

    const db = await createDatabaseService();

    // Validate unit belongs to compound
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const unit = await (db as any).unit?.findById?.(body.unitId);
    if (!unit || unit.compoundId !== compoundId) {
      return NextResponse.json({ error: 'Unit not found in this compound' }, { status: HTTP_STATUS.NOT_FOUND });
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const resident = await (db as any).resident?.assign?.({
        compoundId,
        unitId: body.unitId,
        userId: body.userId,
        isPrimary: body.isPrimary,
        moveInDate: body.moveInDate ? new Date(body.moveInDate) : null,
      });

      return NextResponse.json({ resident }, { status: HTTP_STATUS.CREATED });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Failed to assign resident';
      // Prisma unique constraint hit: user already resident in this compound
      if (message.toLowerCase().includes('unique') || message.toLowerCase().includes('constraint')) {
        return NextResponse.json({ error: 'Resident already exists in this compound' }, { status: HTTP_STATUS.CONFLICT });
      }
      return NextResponse.json({ error: message }, { status: HTTP_STATUS.BAD_REQUEST });
    }
  },
  {
    requireCompound: true,
    allowedCompoundRoles: ['COMPOUND_ADMIN', 'RESIDENT_ADMIN'],
  }
);
