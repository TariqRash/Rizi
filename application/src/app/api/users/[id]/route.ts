import { withAuth } from 'lib/auth/withAuth';
import { editUser } from './editUser';
import { USER_ROLES } from 'lib/auth/roles';

export const PATCH = withAuth(editUser, { allowedRoles: [USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN] });
