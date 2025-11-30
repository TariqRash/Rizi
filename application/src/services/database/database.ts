import { Note, Subscription, User, UserWithSubscriptions, SubscriptionStatus, Compound } from 'types';
import { ServiceConfigStatus, ConfigurableService } from '../status/serviceConfigStatus';

export type DatabaseProvider = 'Postgres';

export type QueryParams = unknown[];

/**
 * Abstract base class for database clients.
 * Provides a common interface for database operations across different database providers.
 */
export abstract class DatabaseClient implements ConfigurableService {
  abstract user: {
    findById: (id: string) => Promise<User | null>;
    findByEmail: (email: string) => Promise<User | null>;
    findByEmailAndPassword: (email: string, passwordHash: string) => Promise<User | null>;
    findByVerificationToken: (token: string) => Promise<User | null>;
    findAll: (options?: {
      page?: number;
      pageSize?: number;
      searchName?: string;
      filterPlan?: string;
      filterStatus?: string;
    }) => Promise<{ users: UserWithSubscriptions[]; total: number }>;
    create: (user: Omit<User, 'id' | 'createdAt'>) => Promise<User>;
    update: (id: string, user: Partial<Omit<User, 'id' | 'createdAt'>>) => Promise<User>;
    delete: (id: string) => Promise<void>;
    count: () => Promise<number>;
    updateByEmail: (email: string, user: Partial<Omit<User, 'id' | 'createdAt'>>) => Promise<User>;
  };
  abstract subscription: {
    findByUserAndStatus: (
      userId: string,
      status: SubscriptionStatus
    ) => Promise<Subscription | null>;
    findById: (id: string) => Promise<Subscription | null>;
    findByUserId: (userId: string) => Promise<Subscription[]>;
    create: (subscription: Omit<Subscription, 'id' | 'createdAt'>) => Promise<Subscription>;
    update: (
      userId: string,
      subscription: Partial<Omit<Subscription, 'id' | 'createdAt'>>
    ) => Promise<Subscription>;
    updateByCustomerId: (
      customerId: string,
      subscription: Partial<Omit<Subscription, 'id' | 'createdAt'>>
    ) => Promise<Subscription>;
    delete: (id: string) => Promise<void>;
  };
  abstract note: {
    findById: (id: string) => Promise<Note | null>;
    findByUserId: (userId: string) => Promise<Note[]>;
    create: (note: Omit<Note, 'id' | 'createdAt'>) => Promise<Note>;
    update: (id: string, note: Partial<Omit<Note, 'id' | 'createdAt'>>) => Promise<Note>;
    delete: (id: string) => Promise<void>;
    findMany: (args: {
      search?: string;
      userId: string;
      skip: number;
      take: number;
      orderBy: {
        createdAt?: 'desc' | 'asc';
        title?: 'asc';
      };
    }) => Promise<Note[]>;
    count: (userId: string, search?: string) => Promise<number>;
  };
  abstract verificationToken: {
    create: (data: { identifier: string; token: string; expires: Date }) => Promise<void>;
    find: (
      identifier: string,
      token: string
    ) => Promise<{ identifier: string; token: string; expires: Date } | null>;
    findByToken: (
      token: string
    ) => Promise<{ identifier: string; token: string; expires: Date } | null>;
    delete: (identifier: string, token: string) => Promise<void>;
    deleteExpired: (now: Date) => Promise<void>;
  };
  abstract compound: {
    findByDomain: (
      hostname: string,
      subdomainCandidates: string[]
    ) => Promise<Compound | null>;
  };
  abstract checkConnection(): Promise<boolean>;

  abstract checkConfiguration(): Promise<ServiceConfigStatus>;

  /**
   * Default implementation: database services are required by default.
   * Override this method if a specific database implementation should be optional.
   */
  isRequired(): boolean {
    return true;
  }
}
