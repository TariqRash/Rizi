


import { PrismaClient } from '@prisma/client';

export enum BookingStatus {
  REQUESTED = 'REQUESTED',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
}

type ListOptions = {
  status?: BookingStatus;
  unitId?: string;
  residentId?: string;
  q?: string;
};

type CreateInput = {
  compoundId: string;
  facilityName: string;
  startTime: Date;
  endTime: Date;
  status?: BookingStatus;
  unitId?: string | null;
  residentId?: string | null;
  bookedById: string;
};

type UpdateInput = {
  facilityName?: string;
  startTime?: Date;
  endTime?: Date;
  status?: BookingStatus;
  unitId?: string | null;
  residentId?: string | null;
};

export function createFacilityBookingHelpers(prisma: PrismaClient) {
  return {
    facilityBooking: {
      listByCompound: async (compoundId: string, options?: ListOptions) => {
        const where: Record<string, unknown> = { compoundId };
        if (options?.status) where.status = options.status;
        if (options?.unitId) where.unitId = options.unitId;
        if (options?.residentId) where.residentId = options.residentId;
        if (options?.q) {
          where.OR = [
            { facilityName: { contains: options.q, mode: 'insensitive' } },
          ];
        }

        return prisma.facilityBooking.findMany({
          where,
          orderBy: { startTime: 'desc' },
          include: { unit: true, resident: true },
        });
      },

      findById: async (id: string) => {
        return prisma.facilityBooking.findUnique({ where: { id }, include: { unit: true, resident: true } });
      },

      create: async (data: CreateInput) => {
        return prisma.facilityBooking.create({
          data: {
            compoundId: data.compoundId,
            facilityName: data.facilityName,
            startTime: data.startTime,
            endTime: data.endTime,
            status: data.status,
            unitId: data.unitId ?? null,
            residentId: data.residentId ?? null,
            bookedById: data.bookedById,
          },
          include: { unit: true, resident: true },
        });
      },

      update: async (id: string, compoundId: string, data: UpdateInput) => {
        return prisma.facilityBooking.update({
          where: { id, compoundId },
          data: {
            facilityName: data.facilityName,
            startTime: data.startTime,
            endTime: data.endTime,
            status: data.status,
            unitId: data.unitId === undefined ? undefined : data.unitId,
            residentId: data.residentId === undefined ? undefined : data.residentId,
          },
          include: { unit: true, resident: true },
        });
      },

      delete: async (id: string, compoundId: string) => {
        return prisma.facilityBooking.delete({ where: { id, compoundId } });
      },
    },
  };
}
