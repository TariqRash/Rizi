import { UserRole } from 'types';

export const USER_ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  OWNER: 'OWNER',
  RESIDENT: 'RESIDENT',
  SERVICE_PROVIDER: 'SERVICE_PROVIDER',
  VISITOR: 'VISITOR',
  SUPERVISOR: 'SUPERVISOR',
  USER: 'USER',
} as const;

export const ALL_ROLES: UserRole[] = Object.values(USER_ROLES);

export const SUPER_ADMIN_EMAIL = 'tariq@ib.com.sa';
