import { NextRequest, NextResponse } from 'next/server';
import { auth } from 'lib/auth/auth';
import { ErrorResponse, HTTP_STATUS } from 'lib/api/http';
import type { UserRole } from 'types';
import { createDatabaseService } from 'services/database/databaseFactory';

// Keep this file runnable in the standard Next.js Node runtime without requiring
// Prisma type resolution during editor analysis.
export type CompoundRole =
  | 'COMPOUND_ADMIN'
  | 'RESIDENT_ADMIN'
  | 'RESIDENT'
  | 'OWNER'
  | 'STAFF';

export type WithCompoundAuthOptions = {
  allowedUserRoles?: UserRole[];
  allowedCompoundRoles?: CompoundRole[];
  /**
   * If true, the handler must be called with an active compound.
   * If false, compound is optional (useful for onboarding flows).
   */
  requireCompound?: boolean;
};

type Handler = (
  req: NextRequest,
  ctx: {
    user: { id: string; role: UserRole; email: string };
    compound: { id: string; role?: CompoundRole } | null;
  },
  params: Promise<Record<string, string> | undefined>
) => Promise<Response>;

const getCompoundIdFromRequest = (req: NextRequest): string | null => {
  // Preferred: explicit header for API calls from dashboards
  const headerId = req.headers.get('x-compound-id');
  if (headerId) return headerId;

  // Fallback: cookie (handy for SSR and same-site API calls)
  const cookieId = req.cookies.get('active_compound_id')?.value;
  if (cookieId) return cookieId;

  return null;
};

/**
 * Like withAuth, but also resolves an active compound context + compound-level role.
 */
export const withCompoundAuth =
  (handler: Handler, options: WithCompoundAuthOptions = {}) =>
  async (req: NextRequest, { params }: { params: Promise<Record<string, string> | undefined> }): Promise<Response> => {
    try {
      const session = await auth();

      if (!session || !session.user?.id || !session.user?.role) {
        const res: ErrorResponse = { error: 'Unauthorized' };
        return NextResponse.json(res, { status: HTTP_STATUS.UNAUTHORIZED });
      }

      const user = {
        id: session.user.id,
        role: session.user.role,
        email: session.user.email,
      };

      if (options.allowedUserRoles && !options.allowedUserRoles.includes(user.role)) {
        const res: ErrorResponse = { error: 'Forbidden' };
        return NextResponse.json(res, { status: HTTP_STATUS.FORBIDDEN });
      }

      const compoundId = getCompoundIdFromRequest(req);
      const db = await createDatabaseService();

      let compound: { id: string; role?: CompoundRole } | null = null;
      if (compoundId) {
        // Ensure compound exists and user has a role assignment (or user is SUPER_ADMIN).
  // DatabaseClient base type doesn't include compound helpers; concrete SQL service does.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const compoundRecord = await (db as any).compound?.findById?.(compoundId);
        if (!compoundRecord) {
          const res: ErrorResponse = { error: 'Compound not found' };
          return NextResponse.json(res, { status: HTTP_STATUS.NOT_FOUND });
        }

        // SUPER_ADMIN has access to everything.
        if (user.role === 'SUPER_ADMIN') {
          compound = { id: compoundId };
        } else {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const assignment = await (db as any).compoundRoleAssignment?.findForUser?.(
            compoundId,
            user.id
          );

          if (!assignment) {
            const res: ErrorResponse = { error: 'Forbidden' };
            return NextResponse.json(res, { status: HTTP_STATUS.FORBIDDEN });
          }

          compound = { id: compoundId, role: assignment.role as CompoundRole };

          if (
            options.allowedCompoundRoles &&
            compound.role &&
            !options.allowedCompoundRoles.includes(compound.role)
          ) {
            const res: ErrorResponse = { error: 'Forbidden' };
            return NextResponse.json(res, { status: HTTP_STATUS.FORBIDDEN });
          }
        }
      }

      if (options.requireCompound && !compound) {
        const res: ErrorResponse = { error: 'Compound context is required' };
        return NextResponse.json(res, { status: HTTP_STATUS.BAD_REQUEST });
      }

      return await handler(req, { user, compound }, params);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Auth error:', error.message);
      } else {
        console.error('Unknown auth error:', error);
      }

      const res: ErrorResponse = { error: 'Internal server error' };
      return NextResponse.json(res, { status: HTTP_STATUS.INTERNAL_SERVER_ERROR });
    }
  };
