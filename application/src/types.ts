import { USER_ROLES } from 'lib/auth/roles';

// User type
export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  image: string | null;

  role: UserRole;
  compoundId: string;
  createdAt: Date;

  verificationToken?: string | null;
  emailVerified: boolean;
}

export interface Compound {
  id: string;
  name: string;
  subdomain: string;
  customDomain: string | null;
  createdAt: Date;
}

// Subscription type
export interface Subscription {
  id: string;
  userId: string;
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

export interface UserWithSubscriptions extends User {
  subscription: Subscription | null;
}

export enum SubscriptionStatusEnum {
  ACTIVE = 'ACTIVE',
  CANCELED = 'CANCELED',
  PENDING = 'PENDING',
}

export enum SubscriptionPlanEnum {
  FREE = 'FREE',
  PRO = 'PRO',
}
