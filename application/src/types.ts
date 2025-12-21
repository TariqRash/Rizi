import { USER_ROLES } from 'lib/auth/roles';

// User type
export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  image: string | null;

  role: UserRole;
  createdAt: Date;

  verificationToken?: string | null;
  emailVerified: boolean;
}

// Subscription type
export interface Subscription {
  id: string;
  compoundId: string;
  userId?: string | null;
  status: SubscriptionStatus | null;
  plan: SubscriptionPlan | null;
  customerId: string | null;
  createdAt: Date;
}

// Note type
export interface Note {
  id: string;
  userId: string;
  title: string;
  content: string;
  createdAt: Date;
}

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export type SubscriptionStatus = 'ACTIVE' | 'CANCELED' | 'PENDING';

export type SubscriptionPlan = 'FREE' | 'PRO';

export type CompoundRole =
  | 'COMPOUND_ADMIN'
  | 'RESIDENT_ADMIN'
  | 'RESIDENT'
  | 'OWNER'
  | 'STAFF';

export interface UserWithSubscriptions extends User {
  subscriptions: Subscription[];
}

/**
 * Backwards-compatible view used by the existing AdminDashboard UI.
 * (Eventually we should refactor the UI to be fully compound-aware.)
 */
export type UserWithSubscription = User & { subscription: Subscription | null };

export enum SubscriptionStatusEnum {
  ACTIVE = 'ACTIVE',
  CANCELED = 'CANCELED',
  PENDING = 'PENDING',
}

export enum SubscriptionPlanEnum {
  FREE = 'FREE',
  PRO = 'PRO',
}
