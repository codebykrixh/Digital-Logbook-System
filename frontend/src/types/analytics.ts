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

export interface RecentShiftLog {
  id: string;
  code: string;
  shiftType: 'MORNING' | 'AFTERNOON' | 'NIGHT';
  shiftDate: string;
  status: 'DRAFT' | 'SUBMITTED' | 'SIGNED' | 'ARCHIVED';
  createdAt: string;
  author: { firstName: string; lastName: string };
  plant: { name: string };
}

export interface RecentIncident {
  id: string;
  code: string;
  title: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'UNDER_REVIEW' | 'RESOLVED' | 'CLOSED';
  createdAt: string;
  reporter: { firstName: string; lastName: string };
}

export interface DashboardOverview {
  kpis: DashboardKpis;
  incidentTrend: IncidentTrendPoint[];
  recentShiftLogs: RecentShiftLog[];
  recentIncidents: RecentIncident[];
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
  createdAt: string;
  actor: { firstName: string; lastName: string } | null;
}
