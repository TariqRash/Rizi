import { UserRole } from 'types';

export const USER_ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  USER: 'USER',
} as const;

export const ALL_ROLES: UserRole[] = Object.values(USER_ROLES);

export const SUPER_ADMIN_EMAIL = 'tariq@ib.com.sa';
