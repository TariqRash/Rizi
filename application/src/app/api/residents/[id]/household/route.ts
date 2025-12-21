import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withCompoundAuth } from 'lib/auth/withCompoundAuth';
import { createDatabaseService } from 'services/database/databaseFactory';
import { HTTP_STATUS } from 'lib/api/http';

const postSchema = z.object({
  name: z.string().min(1),
  relation: z.string().min(1),
  phone: z.string().optional(),
});

export const GET = withCompoundAuth(
  async (_req, ctx, paramsPromise) => {
    const compoundId = ctx.compound?.id;
    if (!compoundId) {
      return NextResponse.json({ error: 'Compound context is required' }, { status: HTTP_STATUS.BAD_REQUEST });
    }

    const params = (await paramsPromise) ?? {};
    const residentId = params.id;
    if (!residentId) {
      return NextResponse.json({ error: 'Missing resident id' }, { status: HTTP_STATUS.BAD_REQUEST });
    }

    const db = await createDatabaseService();

    // Ensure resident belongs to this compound
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const resident = await (db as any).resident?.findById?.(residentId);
    if (!resident || resident.compoundId !== compoundId) {
      return NextResponse.json({ error: 'Not found' }, { status: HTTP_STATUS.NOT_FOUND });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const household = await (db as any).householdMember?.listForResident?.(residentId);
    return NextResponse.json({ household: household ?? [] }, { status: HTTP_STATUS.OK });
  },
  { requireCompound: true, allowedCompoundRoles: ['COMPOUND_ADMIN', 'RESIDENT_ADMIN'] }
);

export const POST = withCompoundAuth(
  async (req: NextRequest, ctx, paramsPromise) => {
    const compoundId = ctx.compound?.id;
    if (!compoundId) {
      return NextResponse.json({ error: 'Compound context is required' }, { status: HTTP_STATUS.BAD_REQUEST });
    }

    const params = (await paramsPromise) ?? {};
    const residentId = params.id;
    if (!residentId) {
      return NextResponse.json({ error: 'Missing resident id' }, { status: HTTP_STATUS.BAD_REQUEST });
    }

    const body = postSchema.parse(await req.json());

    const db = await createDatabaseService();

    // Ensure resident belongs to this compound
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const resident = await (db as any).resident?.findById?.(residentId);
    if (!resident || resident.compoundId !== compoundId) {
      return NextResponse.json({ error: 'Not found' }, { status: HTTP_STATUS.NOT_FOUND });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const member = await (db as any).householdMember?.create?.({
      residentId,
      name: body.name,
      relation: body.relation,
      phone: body.phone ?? null,
    });

    return NextResponse.json({ member }, { status: HTTP_STATUS.CREATED });
  },
  { requireCompound: true, allowedCompoundRoles: ['COMPOUND_ADMIN', 'RESIDENT_ADMIN'] }
);
