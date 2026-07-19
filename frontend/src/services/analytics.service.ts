import { apiFetch } from '@/lib/api';
import type { DashboardOverview, MachineHealthRow, SeverityBreakdown, AuditLogRow } from '@/types/analytics';

export const analyticsApi = {
  overview: () => apiFetch<DashboardOverview>('/analytics/overview'),
  machineHealth: () => apiFetch<MachineHealthRow[]>('/analytics/machine-health'),
  incidentsBySeverity: () => apiFetch<SeverityBreakdown[]>('/analytics/incidents-by-severity'),
  auditLog: (page: number, limit = 25) => apiFetch<AuditLogRow[]>(`/analytics/audit-log?page=${page}&limit=${limit}`),
  adminActivity: (page: number, limit = 25) => apiFetch<AuditLogRow[]>(`/analytics/admin-activity?page=${page}&limit=${limit}`),
};
