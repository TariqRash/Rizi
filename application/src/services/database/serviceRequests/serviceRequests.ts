import { PrismaClient } from '@prisma/client';

export type ServiceRequestStatus = 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELED';
export type ServiceRequestPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

type ListOptions = {
  status?: ServiceRequestStatus;
  priority?: ServiceRequestPriority;
  unitId?: string;
  residentId?: string;
  providerId?: string;
  q?: string;
};

type CreateInput = {
  compoundId: string;
  title: string;
  description: string;
  priority?: ServiceRequestPriority;
  status?: ServiceRequestStatus;
  unitId?: string | null;
  residentId?: string | null;
  providerId?: string | null;
  createdById: string;
  scheduledFor?: Date | null;
};

type UpdateInput = {
  title?: string;
  description?: string;
  status?: ServiceRequestStatus;
  priority?: ServiceRequestPriority;
  unitId?: string | null;
  residentId?: string | null;
  providerId?: string | null;
  scheduledFor?: Date | null;
  resolvedAt?: Date | null;
};

export function createServiceRequestHelpers(prisma: PrismaClient) {
  return {
    serviceRequest: {
      listByCompound: async (compoundId: string, options?: ListOptions) => {
        const where: Record<string, unknown> = { compoundId };

        if (options?.status) where.status = options.status;
        if (options?.priority) where.priority = options.priority;
        if (options?.unitId) where.unitId = options.unitId;
        if (options?.residentId) where.residentId = options.residentId;
        if (options?.providerId) where.providerId = options.providerId;
        if (options?.q) {
          where.OR = [
            { title: { contains: options.q, mode: 'insensitive' } },
            { description: { contains: options.q, mode: 'insensitive' } },
          ];
        }

        return prisma.serviceRequest.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          include: { unit: true, resident: true, provider: true, createdBy: true },
        });
      },

      findById: async (id: string) => {
        return prisma.serviceRequest.findUnique({
          where: { id },
          include: { unit: true, resident: true, provider: true, createdBy: true },
        });
      },

      create: async (data: CreateInput) => {
        return prisma.serviceRequest.create({
          data: {
            compoundId: data.compoundId,
            title: data.title,
            description: data.description,
            priority: data.priority,
            status: data.status,
            unitId: data.unitId ?? null,
            residentId: data.residentId ?? null,
            providerId: data.providerId ?? null,
            createdById: data.createdById,
            scheduledFor: data.scheduledFor ?? null,
          },
          include: { unit: true, resident: true, provider: true, createdBy: true },
        });
      },

      update: async (id: string, compoundId: string, data: UpdateInput) => {
        // compoundId included to ensure tenant isolation at write time.
        return prisma.serviceRequest.update({
          where: { id, compoundId },
          data: {
            title: data.title,
            description: data.description,
            status: data.status,
            priority: data.priority,
            unitId: data.unitId === undefined ? undefined : data.unitId,
            residentId: data.residentId === undefined ? undefined : data.residentId,
            providerId: data.providerId === undefined ? undefined : data.providerId,
            scheduledFor: data.scheduledFor === undefined ? undefined : data.scheduledFor,
            resolvedAt: data.resolvedAt === undefined ? undefined : data.resolvedAt,
          },
          include: { unit: true, resident: true, provider: true, createdBy: true },
        });
      },

      delete: async (id: string, compoundId: string) => {
        // compoundId included to ensure tenant isolation at delete time.
        return prisma.serviceRequest.delete({ where: { id, compoundId } });
      },
    },
  };
}
