import type { Prisma, PrismaClient } from '@prisma/client';

export type ResidentDTO = {
  id: string;
  userId: string;
  unitId: string;
  compoundId: string;
  isPrimary: boolean;
  moveInDate: Date | null;
  moveOutDate: Date | null;
  createdAt: Date;
  user?: { id: string; name: string; email: string };
  unit?: { id: string; number: string; buildingId: string };
};

export type HouseholdMemberDTO = {
  id: string;
  name: string;
  relation: string;
  phone: string | null;
  residentId: string;
  createdAt: Date;
};

export const createResidentHelpers = (prisma: PrismaClient) => {
  const resident = {
    listByCompound: async (compoundId: string, opts?: { unitId?: string; buildingId?: string; q?: string }) => {
      const q = opts?.q?.trim();
      return prisma.resident.findMany({
        where: {
          compoundId,
          ...(opts?.unitId ? { unitId: opts.unitId } : {}),
          ...(opts?.buildingId ? { unit: { buildingId: opts.buildingId } } : {}),
          ...(q
            ? {
                user: {
                  OR: [
                    { name: { contains: q, mode: 'insensitive' } },
                    { email: { contains: q, mode: 'insensitive' } },
                  ],
                },
              }
            : {}),
        },
        include: {
          user: { select: { id: true, name: true, email: true } },
          unit: { select: { id: true, number: true, buildingId: true } },
        },
        orderBy: [{ createdAt: 'asc' }],
      }) as unknown as Promise<ResidentDTO[]>;
    },

    findById: async (id: string) => {
      return prisma.resident.findUnique({ where: { id } }) as unknown as Promise<ResidentDTO | null>;
    },

    findByIdWithRelations: async (id: string) => {
      return prisma.resident.findUnique({
        where: { id },
        include: {
          user: { select: { id: true, name: true, email: true } },
          unit: { select: { id: true, number: true, buildingId: true, compoundId: true } },
        },
      }) as unknown as Promise<(ResidentDTO & { unit: { compoundId: string } }) | null>;
    },

    listByUnit: async (unitId: string) => {
      return prisma.resident.findMany({ where: { unitId }, orderBy: [{ createdAt: 'asc' }] }) as unknown as Promise<
        ResidentDTO[]
      >;
    },

    findPrimaryByUnit: async (unitId: string) => {
      return prisma.resident.findFirst({ where: { unitId, isPrimary: true } }) as unknown as Promise<ResidentDTO | null>;
    },

    // Enforces: at most one primary resident per unit.
    // If isPrimary=true, we unset any existing primary for that unit.
    assign: async (data: {
      compoundId: string;
      unitId: string;
      userId: string;
      isPrimary?: boolean;
      moveInDate?: Date | null;
    }) => {
      return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        if (data.isPrimary) {
          await tx.resident.updateMany({ where: { unitId: data.unitId, isPrimary: true }, data: { isPrimary: false } });
        }

        return tx.resident.create({
          data: {
            compoundId: data.compoundId,
            unitId: data.unitId,
            userId: data.userId,
            isPrimary: data.isPrimary ?? false,
            moveInDate: data.moveInDate ?? null,
          },
        }) as unknown as Promise<ResidentDTO>;
      });
    },

    update: async (
      id: string,
      data: { isPrimary?: boolean; moveInDate?: Date | null; moveOutDate?: Date | null; unitId?: string }
    ) => {
      return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        const existing = await tx.resident.findUnique({ where: { id } });
        if (!existing) throw new Error('Resident not found');

        const nextUnitId = data.unitId ?? existing.unitId;
        if (data.isPrimary) {
          await tx.resident.updateMany({ where: { unitId: nextUnitId, isPrimary: true }, data: { isPrimary: false } });
        }

        return tx.resident.update({
          where: { id },
          data: {
            unitId: data.unitId,
            isPrimary: data.isPrimary,
            moveInDate: data.moveInDate,
            moveOutDate: data.moveOutDate,
          },
        }) as unknown as Promise<ResidentDTO>;
      });
    },

    remove: async (id: string) => {
      await prisma.resident.delete({ where: { id } });
    },
  };

  const householdMember = {
    listForResident: async (residentId: string) => {
      return prisma.householdMember.findMany({ where: { residentId }, orderBy: { createdAt: 'asc' } }) as unknown as Promise<
        HouseholdMemberDTO[]
      >;
    },

    create: async (data: { residentId: string; name: string; relation: string; phone?: string | null }) => {
      return prisma.householdMember.create({
        data: {
          residentId: data.residentId,
          name: data.name,
          relation: data.relation,
          phone: data.phone ?? null,
        },
      }) as unknown as Promise<HouseholdMemberDTO>;
    },

    delete: async (id: string) => {
      await prisma.householdMember.delete({ where: { id } });
    },

    findByIdWithResidentCompound: async (id: string) => {
      return prisma.householdMember.findUnique({
        where: { id },
        include: { resident: { select: { compoundId: true } } },
      }) as unknown as Promise<(HouseholdMemberDTO & { resident: { compoundId: string } }) | null>;
    },
  };

  return { resident, householdMember };
};
