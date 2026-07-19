import type { Prisma } from '@prisma/client';
import { prisma } from '../../config/prisma';

export interface DashboardKpis {
  activeMachines: number;
  totalMachines: number;
  avgMachineHealth: number;
  openIncidents: number;
  totalIncidents: number;
  shiftLogsToday: number;
  capaCompletionRate: number;
}

export interface IncidentTrendPoint {
  date: string;
  count: number;
}

function getRecentShiftLogs() {
  return prisma.shiftLog.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      code: true,
      shiftType: true,
      shiftDate: true,
      status: true,
      createdAt: true,
      author: { select: { firstName: true, lastName: true } },
      plant: { select: { name: true } },
    },
  });
}

function getRecentIncidents() {
  return prisma.incident.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      code: true,
      title: true,
      severity: true,
      status: true,
      createdAt: true,
      reporter: { select: { firstName: true, lastName: true } },
    },
  });
}

export interface DashboardOverview {
  kpis: DashboardKpis;
  incidentTrend: IncidentTrendPoint[];
  recentShiftLogs: Awaited<ReturnType<typeof getRecentShiftLogs>>;
  recentIncidents: Awaited<ReturnType<typeof getRecentIncidents>>;
}

export interface MachineHealthRow {
  id: string;
  name: string;
  tag: string;
  status: string;
  healthScore: number;
  incidentCount: number;
  eventCount: number;
}

export interface SeverityBreakdown {
  severity: string;
  count: number;
}

export interface AuditLogRow {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  createdAt: Date;
  actor: { firstName: string; lastName: string } | null;
}

export const analyticsService = {
  /**
   * Aggregate everything the executive dashboard needs in one round trip.
   * Every query is written to return a sane zero value on an empty database
   * rather than throwing, so a freshly-seeded plant renders a real (if quiet)
   * dashboard instead of an error.
   */
  async getOverview(): Promise<DashboardOverview> {
    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);
    const sevenDaysAgo = new Date(startOfToday);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

    const [
      activeMachines,
      totalMachines,
      machineHealth,
      openIncidents,
      totalIncidents,
      shiftLogsToday,
      capaTotal,
      capaDone,
      recentShiftLogs,
      recentIncidents,
      incidentsLast7,
    ] = await Promise.all([
      prisma.machine.count({ where: { status: 'RUNNING' } }),
      prisma.machine.count(),
      prisma.machine.aggregate({ _avg: { healthScore: true } }),
      prisma.incident.count({ where: { status: { notIn: ['RESOLVED', 'CLOSED'] } } }),
      prisma.incident.count(),
      prisma.shiftLog.count({ where: { shiftDate: { gte: startOfToday } } }),
      prisma.capa.count(),
      prisma.capa.count({ where: { status: { in: ['COMPLETED', 'VERIFIED'] } } }),
      getRecentShiftLogs(),
      getRecentIncidents(),
      prisma.incident.findMany({
        where: { createdAt: { gte: sevenDaysAgo } },
        select: { createdAt: true },
      }),
    ]);

    const incidentTrend: IncidentTrendPoint[] = [];
    for (let i = 6; i >= 0; i--) {
      const day = new Date(startOfToday);
      day.setDate(day.getDate() - i);
      const dayKey = day.toISOString().slice(0, 10);
      const count = incidentsLast7.filter(
        (inc) => inc.createdAt.toISOString().slice(0, 10) === dayKey
      ).length;
      incidentTrend.push({ date: dayKey, count });
    }

    return {
      kpis: {
        activeMachines,
        totalMachines,
        avgMachineHealth: Math.round(machineHealth._avg.healthScore ?? 0),
        openIncidents,
        totalIncidents,
        shiftLogsToday,
        capaCompletionRate: capaTotal === 0 ? 0 : Math.round((capaDone / capaTotal) * 100),
      },
      incidentTrend,
      recentShiftLogs,
      recentIncidents,
    };
  },

  /** Per-machine health + incident/event frequency — a proxy for downtime, since raw uptime isn't tracked. */
  async getMachineHealth(): Promise<MachineHealthRow[]> {
    const machines = await prisma.machine.findMany({
      orderBy: { healthScore: 'asc' },
      include: { _count: { select: { incidents: true, events: true } } },
    });
    return machines.map((m) => ({
      id: m.id,
      name: m.name,
      tag: m.tag,
      status: m.status,
      healthScore: m.healthScore,
      incidentCount: m._count.incidents,
      eventCount: m._count.events,
    }));
  },

  async getIncidentsBySeverity(): Promise<SeverityBreakdown[]> {
    const grouped = await prisma.incident.groupBy({
      by: ['severity'],
      _count: { _all: true },
    });
    return grouped.map((g) => ({ severity: g.severity, count: g._count._all }));
  },

  /**
   * `actorRole: 'ADMIN'` powers the Admin Activity view — lets any admin see
   * exactly what every OTHER admin has done, independent of the peer-notify
   * alerts (which are best-effort and could theoretically be missed).
   */
  async getAuditLog(
    page: number,
    limit: number,
    actorRole?: 'OPERATOR' | 'SUPERVISOR' | 'MANAGER' | 'ADMIN'
  ): Promise<{ items: AuditLogRow[]; total: number }> {
    const skip = (page - 1) * limit;
    const where: Prisma.AuditLogWhereInput = actorRole ? { actor: { role: actorRole } } : {};
    const [items, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: { actor: { select: { firstName: true, lastName: true } } },
      }),
      prisma.auditLog.count({ where }),
    ]);
    return { items, total };
  },
};
