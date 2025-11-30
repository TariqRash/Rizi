import { auth } from 'lib/auth/auth';
import { NextRequest, NextResponse } from 'next/server';
import { ErrorResponse, HTTP_STATUS } from '../api/http';
import { UserRole } from 'types';
import { TENANT_HEADER } from 'lib/tenant/tenantResolver';

export type WithAuthOptions = {
  allowedRoles?: UserRole[];
};

type Handler = (
  req: NextRequest,
  user: { id: string; role: UserRole; email: string; compoundId: string },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params: Promise<any>
) => Promise<Response>;

/**
 * Higher-order function to wrap API route handlers with authentication and optional role-based authorization.
 * @param options Optional configuration for allowed user roles.
 */
export const withAuth =
  (handler: Handler, options: WithAuthOptions = {}) =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async (req: NextRequest, { params }: { params: Promise<any> }): Promise<Response> => {
    try {
      const session = await auth();
      const tenantId = req.headers.get(TENANT_HEADER);

      if (!session || !session.user?.id || !session.user?.role || !session.user?.compoundId) {
        const res: ErrorResponse = { error: 'Unauthorized' };
        return NextResponse.json(res, { status: HTTP_STATUS.UNAUTHORIZED });
      }

      if (!tenantId || tenantId !== session.user.compoundId) {
        const res: ErrorResponse = { error: 'Forbidden' };
        return NextResponse.json(res, { status: HTTP_STATUS.FORBIDDEN });
      }

      const { id, role, email, compoundId } = session.user;

      if (options.allowedRoles && !options.allowedRoles.includes(role)) {
        const res: ErrorResponse = { error: 'Forbidden' };
        return NextResponse.json(res, { status: HTTP_STATUS.FORBIDDEN });
      }

      return await handler(req, { id, role, email, compoundId }, params);
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
