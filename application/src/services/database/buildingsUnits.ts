import type { PrismaClient } from '@prisma/client';

// Mirror Prisma enums locally so we can type inputs without pulling generated types.
// These must stay in sync with `prisma/schema.prisma`.
export type UnitType = 'APARTMENT' | 'VILLA' | 'TOWNHOUSE' | 'OFFICE' | 'PARKING';
export type UnitStatus = 'VACANT' | 'OCCUPIED' | 'MAINTENANCE' | 'RESERVED';

// Keep these helpers small and Prisma-based; the service factory wraps them.

export type BuildingDTO = {
  id: string;
  name: string;
  compoundId: string;
  createdAt: Date;
  updatedAt: Date;
  _count?: { units: number };
};

export type UnitDTO = {
  id: string;
  number: string;
  type: string;
  status: string;
  buildingId: string;
  compoundId: string;
  createdAt: Date;
  updatedAt: Date;
};

export const createBuildingUnitHelpers = (prisma: PrismaClient) => {
  const building = {
    listByCompound: async (compoundId: string): Promise<BuildingDTO[]> => {
      return prisma.building.findMany({
        where: { compoundId },
        orderBy: { createdAt: 'asc' },
        include: { _count: { select: { units: true } } },
      });
    },
    findById: async (id: string): Promise<BuildingDTO | null> => {
      return prisma.building.findUnique({ where: { id } });
    },
    findByIdWithCounts: async (id: string): Promise<BuildingDTO | null> => {
      return prisma.building.findUnique({ where: { id }, include: { _count: { select: { units: true } } } });
    },
    create: async (data: { compoundId: string; name: string }): Promise<BuildingDTO> => {
      return prisma.building.create({ data: { compoundId: data.compoundId, name: data.name } });
    },
    update: async (id: string, data: { name?: string }): Promise<BuildingDTO> => {
      return prisma.building.update({ where: { id }, data: { name: data.name } });
    },
    delete: async (id: string): Promise<void> => {
      await prisma.building.delete({ where: { id } });
    },
  };

  const unit = {
    listByCompound: async (compoundId: string, opts?: { buildingId?: string }): Promise<UnitDTO[]> => {
      return prisma.unit.findMany({
        where: { compoundId, ...(opts?.buildingId ? { buildingId: opts.buildingId } : {}) },
        orderBy: [{ buildingId: 'asc' }, { number: 'asc' }],
      });
    },
    findById: async (id: string): Promise<UnitDTO | null> => {
      return prisma.unit.findUnique({ where: { id } });
    },
    create: async (data: {
      compoundId: string;
      buildingId: string;
      number: string;
      type: UnitType;
      status?: UnitStatus;
    }): Promise<UnitDTO> => {
      // validate building belongs to compound
      const building = await prisma.building.findUnique({ where: { id: data.buildingId } });
      if (!building || building.compoundId !== data.compoundId) {
        throw new Error('Building not found in this compound');
      }

      return prisma.unit.create({
        data: {
          compoundId: data.compoundId,
          buildingId: data.buildingId,
          number: data.number,
          type: data.type,
          status: data.status ?? undefined,
        },
      });
    },
    update: async (
      id: string,
      data: { number?: string; type?: UnitType; status?: UnitStatus }
    ): Promise<UnitDTO> => {
      return prisma.unit.update({
        where: { id },
        data: {
          number: data.number,
          type: data.type,
          status: data.status,
        },
      });
    },
    delete: async (id: string): Promise<void> => {
      await prisma.unit.delete({ where: { id } });
    },
  };

  return { building, unit };
};
