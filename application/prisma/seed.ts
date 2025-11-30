import {
  Prisma,
  PrismaClient,
  CompoundRole,
  UnitStatus,
  UnitType,
  ServiceRequestPriority,
  ServiceRequestStatus,
  BookingStatus,
  InvoiceStatus,
  Role,
} from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@compound.com' },
    update: {},
    create: {
      name: 'Compound Admin',
      email: 'admin@compound.com',
      passwordHash: 'admin-password-hash',
      role: Role.ADMIN,
    },
  });

  const residentUser = await prisma.user.upsert({
    where: { email: 'resident@compound.com' },
    update: {},
    create: {
      name: 'Resident User',
      email: 'resident@compound.com',
      passwordHash: 'resident-password-hash',
    },
  });

  const staffUser = await prisma.user.upsert({
    where: { email: 'staff@compound.com' },
    update: {},
    create: {
      name: 'Front Desk',
      email: 'staff@compound.com',
      passwordHash: 'staff-password-hash',
    },
  });

  const greenwood = await prisma.compound.upsert({
    where: { name: 'Greenwood Residences' },
    update: { address: '123 Garden Lane' },
    create: {
      name: 'Greenwood Residences',
      address: '123 Garden Lane',
      roles: {
        create: [
          { userId: adminUser.id, role: CompoundRole.COMPOUND_ADMIN },
          { userId: residentUser.id, role: CompoundRole.RESIDENT_ADMIN },
          { userId: staffUser.id, role: CompoundRole.STAFF },
        ],
      },
    },
  });

  const lakeside = await prisma.compound.upsert({
    where: { name: 'Lakeside Heights' },
    update: { address: '987 Lakeview Blvd' },
    create: {
      name: 'Lakeside Heights',
      address: '987 Lakeview Blvd',
      roles: { create: { userId: adminUser.id, role: CompoundRole.COMPOUND_ADMIN } },
    },
  });

  const towerA = await prisma.building.upsert({
    where: { compoundId_name: { compoundId: greenwood.id, name: 'Tower A' } },
    update: {},
    create: {
      name: 'Tower A',
      compoundId: greenwood.id,
    },
  });

  const towerB = await prisma.building.upsert({
    where: { compoundId_name: { compoundId: greenwood.id, name: 'Tower B' } },
    update: {},
    create: {
      name: 'Tower B',
      compoundId: greenwood.id,
    },
  });

  const lakesideBlock = await prisma.building.upsert({
    where: { compoundId_name: { compoundId: lakeside.id, name: 'Lakeside Block 1' } },
    update: {},
    create: { name: 'Lakeside Block 1', compoundId: lakeside.id },
  });

  const towerAUnit101 = await prisma.unit.upsert({
    where: { buildingId_number: { buildingId: towerA.id, number: 'A-101' } },
    update: {},
    create: {
      number: 'A-101',
      type: UnitType.APARTMENT,
      status: UnitStatus.OCCUPIED,
      buildingId: towerA.id,
      compoundId: greenwood.id,
    },
  });

  const towerAUnit201 = await prisma.unit.upsert({
    where: { buildingId_number: { buildingId: towerA.id, number: 'A-201' } },
    update: {},
    create: {
      number: 'A-201',
      type: UnitType.APARTMENT,
      status: UnitStatus.VACANT,
      buildingId: towerA.id,
      compoundId: greenwood.id,
    },
  });

  const lakesideUnit = await prisma.unit.upsert({
    where: { buildingId_number: { buildingId: lakesideBlock.id, number: 'L-10' } },
    update: {},
    create: {
      number: 'L-10',
      type: UnitType.TOWNHOUSE,
      status: UnitStatus.OCCUPIED,
      buildingId: lakesideBlock.id,
      compoundId: lakeside.id,
    },
  });

  const greenwoodOwner = await prisma.owner.upsert({
    where: { id: 'owner-greenwood' },
    update: {},
    create: {
      id: 'owner-greenwood',
      name: 'Greenwood Holdings',
      email: 'owner@greenwood.com',
      phone: '+1-555-1000',
      compoundId: greenwood.id,
      units: { connect: [{ id: towerAUnit101.id }] },
    },
  });

  await prisma.owner.upsert({
    where: { id: 'owner-lakeside' },
    update: {},
    create: {
      id: 'owner-lakeside',
      name: 'Lakeside Owner',
      email: 'owner@lakeside.com',
      phone: '+1-555-2000',
      compoundId: lakeside.id,
      units: { connect: [{ id: lakesideUnit.id }] },
    },
  });

  const primaryResident = await prisma.resident.upsert({
    where: { compoundId_userId: { compoundId: greenwood.id, userId: residentUser.id } },
    update: {},
    create: {
      userId: residentUser.id,
      unitId: towerAUnit101.id,
      compoundId: greenwood.id,
      isPrimary: true,
      moveInDate: new Date('2024-01-15T00:00:00.000Z'),
    },
  });

  await prisma.householdMember.upsert({
    where: { id: 'household-member-1' },
    update: {},
    create: {
      id: 'household-member-1',
      name: 'Jordan Resident',
      relation: 'Partner',
      phone: '+1-555-3300',
      residentId: primaryResident.id,
    },
  });

  const provider = await prisma.serviceProvider.upsert({
    where: { id: 'provider-maintenance' },
    update: {},
    create: {
      id: 'provider-maintenance',
      name: 'Ace Maintenance',
      email: 'support@acemaintenance.com',
      phone: '+1-555-4100',
      servicesOffered: 'Plumbing, Electrical, General Repairs',
      compoundId: greenwood.id,
    },
  });

  await prisma.serviceRequest.upsert({
    where: { id: 'service-request-1' },
    update: {},
    create: {
      id: 'service-request-1',
      title: 'Leaky faucet in kitchen',
      description: 'Requesting maintenance to fix a persistent leak.',
      priority: ServiceRequestPriority.HIGH,
      status: ServiceRequestStatus.IN_PROGRESS,
      compoundId: greenwood.id,
      unitId: towerAUnit101.id,
      residentId: primaryResident.id,
      providerId: provider.id,
      createdById: residentUser.id,
      scheduledFor: new Date('2024-02-01T15:00:00.000Z'),
    },
  });

  const visitor = await prisma.visitor.upsert({
    where: { id: 'visitor-1' },
    update: {},
    create: {
      id: 'visitor-1',
      name: 'Morgan Guest',
      contactNumber: '+1-555-5200',
      purpose: 'Family visit',
      expectedAt: new Date('2024-03-10T18:00:00.000Z'),
      compoundId: greenwood.id,
      unitId: towerAUnit101.id,
      residentId: primaryResident.id,
    },
  });

  await prisma.accessLog.upsert({
    where: { id: 'access-log-1' },
    update: {},
    create: {
      id: 'access-log-1',
      compoundId: greenwood.id,
      visitorId: visitor.id,
      residentId: primaryResident.id,
      recordedById: staffUser.id,
      entryAt: new Date('2024-03-10T17:55:00.000Z'),
      exitAt: new Date('2024-03-10T21:00:00.000Z'),
      notes: 'Visitor left on schedule.',
    },
  });

  await prisma.facilityBooking.upsert({
    where: { id: 'booking-1' },
    update: {},
    create: {
      id: 'booking-1',
      facilityName: 'Community Hall',
      startTime: new Date('2024-04-05T18:00:00.000Z'),
      endTime: new Date('2024-04-05T21:00:00.000Z'),
      status: BookingStatus.CONFIRMED,
      compoundId: greenwood.id,
      unitId: towerAUnit101.id,
      residentId: primaryResident.id,
      bookedById: residentUser.id,
    },
  });

  await prisma.invoice.upsert({
    where: { id: 'invoice-1' },
    update: {},
    create: {
      id: 'invoice-1',
      description: 'Monthly maintenance fee',
      amount: new Prisma.Decimal('150.00'),
      dueDate: new Date('2024-03-15T00:00:00.000Z'),
      status: InvoiceStatus.SENT,
      issuedAt: new Date('2024-03-01T00:00:00.000Z'),
      compoundId: greenwood.id,
      unitId: towerAUnit101.id,
      residentId: primaryResident.id,
    },
  });

  await prisma.expense.upsert({
    where: { id: 'expense-1' },
    update: {},
    create: {
      id: 'expense-1',
      category: 'Landscaping',
      description: 'Weekly garden maintenance for Tower A common areas',
      amount: new Prisma.Decimal('320.00'),
      incurredAt: new Date('2024-02-28T00:00:00.000Z'),
      compoundId: greenwood.id,
      unitId: towerAUnit201.id,
    },
  });
}

main()
  .catch((error) => {
    console.error('Seeding failed', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
