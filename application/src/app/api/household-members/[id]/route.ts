import { NextResponse } from 'next/server';
import { withCompoundAuth } from 'lib/auth/withCompoundAuth';
import { createDatabaseService } from 'services/database/databaseFactory';
import { HTTP_STATUS } from 'lib/api/http';

export const DELETE = withCompoundAuth(
  async (_req, ctx, paramsPromise) => {
    const compoundId = ctx.compound?.id;
    if (!compoundId) {
      return NextResponse.json({ error: 'Compound context is required' }, { status: HTTP_STATUS.BAD_REQUEST });
    }

    const params = (await paramsPromise) ?? {};
    const id = params.id;
    if (!id) {
      return NextResponse.json({ error: 'Missing household member id' }, { status: HTTP_STATUS.BAD_REQUEST });
    }

    const db = await createDatabaseService();

    // Validate household member belongs to a resident in this compound.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const member = await (db as any).householdMember?.findByIdWithResidentCompound?.(id);
    if (!member || member.resident?.compoundId !== compoundId) {
      return NextResponse.json({ error: 'Not found' }, { status: HTTP_STATUS.NOT_FOUND });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (db as any).householdMember?.delete?.(id);

    return NextResponse.json({ ok: true }, { status: HTTP_STATUS.OK });
  },
  { requireCompound: true, allowedCompoundRoles: ['COMPOUND_ADMIN', 'RESIDENT_ADMIN'] }
);
