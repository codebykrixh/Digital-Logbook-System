import { PrismaClient, UserRole, NotificationType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const DEMO_PASSWORD = 'Password123';

async function ensureNotification(
  userId: string,
  type: NotificationType,
  title: string,
  body?: string,
  link?: string
) {
  const exists = await prisma.notification.findFirst({ where: { userId, title } });
  if (exists) return;
  await prisma.notification.create({ data: { userId, type, title, body, link } });
}

async function main() {
  console.log('🌱 Seeding DigiLog database...');

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);

  // ── Plant ────────────────────────────────────────────────
  const plant = await prisma.plant.upsert({
    where: { code: 'PANIPAT' },
    update: {},
    create: {
      name: 'Panipat Refinery',
      code: 'PANIPAT',
      location: 'Panipat, Haryana',
    },
  });

  // ── Departments ──────────────────────────────────────────
  const departments = await Promise.all(
    [
      { name: 'Crude Distillation', code: 'CDU' },
      { name: 'Boiler & Utilities', code: 'UTIL' },
      { name: 'Health, Safety & Environment', code: 'HSE' },
    ].map((d) =>
      prisma.department.upsert({
        where: { plantId_code: { plantId: plant.id, code: d.code } },
        update: {},
        create: { ...d, plantId: plant.id },
      })
    )
  );

  // ── Machines ─────────────────────────────────────────────
  const machineSeeds = [
    { name: 'Crude Unit A', tag: 'CDU-A-101', type: 'Distillation Column', status: 'RUNNING' as const, healthScore: 96 },
    { name: 'Boiler 3', tag: 'BLR-3', type: 'Steam Boiler', status: 'RUNNING' as const, healthScore: 88 },
    { name: 'Compressor 2', tag: 'CMP-2', type: 'Centrifugal Compressor', status: 'MAINTENANCE' as const, healthScore: 61 },
    { name: 'Reactor R-101', tag: 'RCT-101', type: 'Reactor', status: 'RUNNING' as const, healthScore: 92 },
  ];

  const machines = await Promise.all(
    machineSeeds.map((m, i) =>
      prisma.machine.upsert({
        where: { plantId_tag: { plantId: plant.id, tag: m.tag } },
        update: { status: m.status, healthScore: m.healthScore },
        create: {
          name: m.name,
          tag: m.tag,
          type: m.type,
          status: m.status,
          healthScore: m.healthScore,
          plantId: plant.id,
          departmentId: departments[i % departments.length]!.id,
        },
      })
    )
  );

  // ── Users (one per role) ─────────────────────────────────
  const userSeeds: Array<{
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    deptCode: string;
    jobTitle: string;
  }> = [
    { email: 'admin@digilog.app', firstName: 'Aarav', lastName: 'Nair', role: 'ADMIN', deptCode: 'HSE', jobTitle: 'System Administrator' },
    { email: 'manager@digilog.app', firstName: 'Rajesh', lastName: 'Menon', role: 'MANAGER', deptCode: 'CDU', jobTitle: 'Operations Manager' },
    { email: 'supervisor@digilog.app', firstName: 'Ananya', lastName: 'Deshpande', role: 'SUPERVISOR', deptCode: 'UTIL', jobTitle: 'Shift Supervisor' },
    { email: 'operator@digilog.app', firstName: 'Vikram', lastName: 'Singh', role: 'OPERATOR', deptCode: 'CDU', jobTitle: 'Control Room Operator' },
  ];

  const usersByRole = new Map<UserRole, Awaited<ReturnType<typeof prisma.user.upsert>>>();
  for (const u of userSeeds) {
    const dept = departments.find((d) => d.code === u.deptCode);
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: { role: u.role },
      create: {
        email: u.email,
        passwordHash,
        firstName: u.firstName,
        lastName: u.lastName,
        role: u.role,
        jobTitle: u.jobTitle,
        emailVerified: true,
        departmentId: dept?.id,
      },
    });
    usersByRole.set(u.role, user);
  }

  const admin = usersByRole.get('ADMIN')!;
  const manager = usersByRole.get('MANAGER')!;
  const supervisor = usersByRole.get('SUPERVISOR')!;
  const operator = usersByRole.get('OPERATOR')!;

  // ── Demo shift logs (so the dashboard isn't empty) ───────
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const shiftLogSeeds = [
    { author: operator, dept: departments[0]!, machine: machines[0]!, shiftType: 'MORNING' as const, shiftDate: today, status: 'SIGNED' as const, temperature: 342.5, pressure: 12.4 },
    { author: supervisor, dept: departments[1]!, machine: machines[1]!, shiftType: 'AFTERNOON' as const, shiftDate: today, status: 'SUBMITTED' as const, temperature: 210.1, pressure: 8.7 },
    { author: operator, dept: departments[0]!, machine: machines[3]!, shiftType: 'NIGHT' as const, shiftDate: yesterday, status: 'SIGNED' as const, temperature: 298.0, pressure: 10.2 },
  ];

  for (const s of shiftLogSeeds) {
    const existing = await prisma.shiftLog.findFirst({
      where: { authorId: s.author.id, shiftDate: s.shiftDate, shiftType: s.shiftType },
    });
    if (existing) continue;
    await prisma.shiftLog.create({
      data: {
        authorId: s.author.id,
        plantId: plant.id,
        departmentId: s.dept.id,
        shiftType: s.shiftType,
        shiftDate: s.shiftDate,
        status: s.status,
        equipmentStatus: 'Nominal — no deviations observed',
        temperature: s.temperature,
        pressure: s.pressure,
        productionNotes: `${s.machine.name} running within target throughput.`,
        safetyNotes: 'No safety incidents. PPE compliance verified.',
        signedAt: s.status === 'SIGNED' ? new Date() : null,
      },
    });
  }

  // ── Demo incident + CAPA ──────────────────────────────────
  const incidentTitle = 'Elevated vibration on Compressor 2';
  let incident = await prisma.incident.findFirst({ where: { title: incidentTitle } });

  if (!incident) {
    incident = await prisma.incident.create({
      data: {
        title: incidentTitle,
        description:
          'Vibration sensors flagged levels above the 4.5 mm/s threshold during the afternoon shift inspection.',
        severity: 'HIGH',
        status: 'IN_PROGRESS',
        reporterId: supervisor.id,
        assigneeId: manager.id,
        plantId: plant.id,
        machineId: machines[2]!.id,
      },
    });

    await prisma.capa.create({
      data: {
        incidentId: incident.id,
        type: 'CORRECTIVE',
        action: 'Replace worn compressor bearing and rebalance rotor assembly',
        status: 'IN_PROGRESS',
        ownerId: manager.id,
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      },
    });
  }

  // ── Demo notifications ────────────────────────────────────
  await ensureNotification(
    manager.id,
    'INCIDENT',
    'New incident assigned to you',
    incident.title,
    `/incidents/${incident.id}`
  );
  await ensureNotification(
    admin.id,
    'SYSTEM',
    'Welcome to DigiLog',
    'Your workspace is ready. Explore the dashboard to get started.'
  );
  await ensureNotification(
    operator.id,
    'INFO',
    'Shift log signed',
    'Your morning shift log has been signed and archived.'
  );

  console.log('✅ Seed complete.');
  console.log('   Demo accounts (password for all: %s):', DEMO_PASSWORD);
  userSeeds.forEach((u) => console.log(`   • ${u.role.padEnd(11)} ${u.email}`));
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
