import { DatabaseClient } from './database';
import { prisma } from '../../lib/prisma';
import { Subscription, Note, User, SubscriptionStatus, CompoundRole, UserWithSubscription } from 'types';
import { ServiceConfigStatus } from '../status/serviceConfigStatus';
import { createBuildingUnitHelpers } from './buildingsUnits';
import { createResidentHelpers } from './residents';
import { createServiceRequestHelpers } from './serviceRequests/serviceRequests';
import { createFacilityBookingHelpers } from './facilityBookings/facilityBookings';

export class SqlDatabaseService extends DatabaseClient {
  building = createBuildingUnitHelpers(prisma).building;
  unit = createBuildingUnitHelpers(prisma).unit;
  resident = createResidentHelpers(prisma).resident;
  householdMember = createResidentHelpers(prisma).householdMember;
  serviceRequest = createServiceRequestHelpers(prisma).serviceRequest;
  facilityBooking = createFacilityBookingHelpers(prisma).facilityBooking;
  compound = {
    findById: async (id: string) => prisma.compound.findUnique({ where: { id } }),
    create: async (data: { name: string; address?: string | null }) =>
      prisma.compound.create({ data: { name: data.name, address: data.address ?? null } }),
    findFirstForUser: async (userId: string) => {
      const assignment = await prisma.compoundRoleAssignment.findFirst({
        where: { userId },
        orderBy: { createdAt: 'asc' },
      });
      return assignment ? prisma.compound.findUnique({ where: { id: assignment.compoundId } }) : null;
    },
    findManyByIds: async (ids: string[]) => {
      if (!ids.length) return [];
      return prisma.compound.findMany({ where: { id: { in: ids } }, orderBy: { createdAt: 'asc' } });
    },
  };
  compoundRoleAssignment = {
    findForUser: async (compoundId: string, userId: string) =>
      prisma.compoundRoleAssignment.findUnique({ where: { compoundId_userId: { compoundId, userId } } }),
    create: async (data: { compoundId: string; userId: string; role: CompoundRole }) =>
      prisma.compoundRoleAssignment.create({
        data: {
          compoundId: data.compoundId,
          userId: data.userId,
          role: data.role as CompoundRole,
        },
      }),
    listForUser: async (userId: string) =>
      prisma.compoundRoleAssignment.findMany({
        where: { userId },
        orderBy: { createdAt: 'asc' },
        select: { compoundId: true, role: true, createdAt: true },
      }),
  };
  user = {
    findById: async (id: string): Promise<User | null> => prisma.user.findUnique({ where: { id } }),
    findByEmail: async (email: string): Promise<User | null> => prisma.user.findUnique({ where: { email } }),
    findByEmailAndPassword: async (email: string, passwordHash: string): Promise<User | null> => prisma.user.findFirst({ where: { email, passwordHash } }),
    findByVerificationToken: async (token: string): Promise<User | null> => prisma.user.findFirst({ where: { verificationToken: token } }),
    findAll: async (options?: { page?: number; pageSize?: number; searchName?: string; filterPlan?: string; filterStatus?: string }): Promise<{ users: UserWithSubscription[]; total: number }> => {
      const page = options?.page || 1;
      const pageSize = options?.pageSize || 10;
      const skip = (page - 1) * pageSize;
      const where: Record<string, unknown> = {};
      if (options?.searchName) where.name = { contains: options.searchName, mode: 'insensitive' };
      if (options?.filterPlan || options?.filterStatus) {
        where.subscriptions = { some: {} };
        if (options.filterPlan) (where.subscriptions as { some: { plan: Record<string, unknown> } }).some.plan = { equals: options.filterPlan };
        if (options.filterStatus) (where.subscriptions as { some: { status: Record<string, unknown> } }).some.status = { equals: options.filterStatus };
      }
      const [users, total] = await Promise.all([
        prisma.user.findMany({ where, include: { subscriptions: true }, orderBy: { name: 'asc' }, skip, take: pageSize }),
        prisma.user.count({ where }),
      ]);
      const mapped = users.map((u: User & { subscriptions?: Subscription[] }) => ({ ...u, subscription: u.subscriptions?.[0] ?? null }));
      return { users: mapped, total };
    },
    create: async (user: Omit<User, 'id' | 'createdAt'>): Promise<User> => prisma.user.create({ data: user }),
    update: async (id: string, user: Partial<Omit<User, 'id' | 'createdAt'>>): Promise<User> => prisma.user.update({ where: { id }, data: user }),
    updateByEmail: async (email: string, user: Partial<Omit<User, 'id' | 'createdAt'>>): Promise<User> => prisma.user.update({ where: { email }, data: user }),
    delete: async (id: string): Promise<void> => { await prisma.user.delete({ where: { id } }); },
    count: async (): Promise<number> => prisma.user.count(),
  };
  subscription = {
    findByUserAndStatus: async (compoundId: string, status: SubscriptionStatus): Promise<Subscription | null> => prisma.subscription.findFirst({ where: { compoundId, status } }),
    findById: async (id: string): Promise<Subscription | null> => prisma.subscription.findUnique({ where: { id } }),
    findByUserId: async (compoundId: string): Promise<Subscription[]> => prisma.subscription.findMany({ where: { compoundId } }),
    create: async (subscription: Omit<Subscription, 'id' | 'createdAt'>): Promise<Subscription> => prisma.subscription.create({ data: subscription }),
    update: async (compoundId: string, subscription: Partial<Omit<Subscription, 'id' | 'createdAt'>>): Promise<Subscription> => prisma.subscription.update({ where: { compoundId }, data: subscription }),
    updateByCustomerId: async (customerId: string, subscription: Partial<Omit<Subscription, 'id' | 'createdAt'>>): Promise<Subscription> => {
      const existing = await prisma.subscription.findFirst({ where: { customerId } });
      if (!existing) throw new Error('Subscription not found for customerId');
      return prisma.subscription.update({ where: { id: existing.id }, data: subscription });
    },
    delete: async (id: string): Promise<void> => { await prisma.subscription.delete({ where: { id } }); },
  };
  note = {
    findById: async (id: string): Promise<Note | null> => prisma.note.findUnique({ where: { id } }),
    findByUserId: async (userId: string): Promise<Note[]> => prisma.note.findMany({ where: { userId } }),
    create: async (note: Omit<Note, 'id' | 'createdAt'>): Promise<Note> => prisma.note.create({ data: note }),
    update: async (id: string, note: Partial<Omit<Note, 'id' | 'createdAt'>>): Promise<Note> => prisma.note.update({ where: { id }, data: note }),
    delete: async (id: string): Promise<void> => { await prisma.note.delete({ where: { id } }); },
    findMany: async (args: { userId: string; search?: string; skip: number; take: number; orderBy: { createdAt?: 'desc' | 'asc'; title?: 'asc'; } }) => {
      const { userId, search, skip, take, orderBy } = args;
      return prisma.note.findMany({
        where: {
          userId,
          ...(search ? { OR: [ { title: { contains: search, mode: 'insensitive' } }, { content: { contains: search, mode: 'insensitive' } } ] } : {}),
        },
        skip,
        take,
        orderBy,
      });
    },
    count: async (userId: string, search?: string) => prisma.note.count({ where: { userId, ...(search ? { OR: [ { title: { contains: search, mode: 'insensitive' } }, { content: { contains: search, mode: 'insensitive' } } ] } : {}), } }),
  };
  verificationToken = {
    create: async (data: { identifier: string; token: string; expires: Date }) => { await prisma.verificationToken.create({ data }); },
    find: async (identifier: string, token: string) => prisma.verificationToken.findUnique({ where: { identifier_token: { identifier, token } } }),
    findByToken: async (token: string) => prisma.verificationToken.findFirst({ where: { token } }),
    delete: async (identifier: string, token: string) => { await prisma.verificationToken.delete({ where: { identifier_token: { identifier, token } } }); },
    deleteExpired: async (now: Date) => { await prisma.verificationToken.deleteMany({ where: { expires: { lt: now } } }); },
  };
  async checkConnection(): Promise<boolean> {
    let testClient: typeof prisma | null = null;
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      testClient = new (prisma.constructor as typeof prisma)({ datasources: { db: { url: process.env.DATABASE_URL } } });
      if (testClient) {
        await testClient.$queryRaw`SELECT 1`;
        return true;
      } else {
        throw new Error('Failed to create test Prisma client');
      }
    } catch (connectionError: unknown) {
      const errorMsg = connectionError instanceof Error ? connectionError.message : String(connectionError);
      console.error('Database connection test failed:', { error: errorMsg, databaseUrl: process.env.DATABASE_URL ? 'SET' : 'NOT SET' });
      (this as unknown as { lastConnectionError: string }).lastConnectionError = `Connection error: ${errorMsg}`;
      return false;
    } finally {
      if (testClient) await testClient.$disconnect();
    }
  }
  async checkConfiguration(): Promise<ServiceConfigStatus> {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      return {
        name: (this.constructor as { serviceName?: string }).serviceName || 'Database',
        configured: false,
        connected: undefined,
        configToReview: ['DATABASE_URL'],
        error: 'Configuration missing',
        description: (this as { description?: string }).description,
      };
    }
    const isConnected = await this.checkConnection();
    if (!isConnected) {
      return {
        name: (this.constructor as { serviceName?: string }).serviceName || 'Database',
        configured: true,
        connected: false,
        configToReview: ['DATABASE_URL'],
        error: (this as { lastConnectionError?: string }).lastConnectionError || 'Connection failed',
        description: (this as { description?: string }).description,
      };
    }
    return {
      name: (this.constructor as { serviceName?: string }).serviceName || 'Database',
      configured: true,
      connected: true,
    };
  }
}
