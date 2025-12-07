import { withAuth } from 'lib/auth/withAuth';
import { getAllUsers } from './getAllUsers';
import { USER_ROLES } from '../../../lib/auth/roles';

export const GET = withAuth(getAllUsers, { allowedRoles: [USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN] });
