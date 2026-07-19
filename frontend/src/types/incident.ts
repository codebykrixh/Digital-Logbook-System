import type { AttachmentDto } from './common';

export type IncidentSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type IncidentStatus = 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'UNDER_REVIEW' | 'RESOLVED' | 'CLOSED';
export type CapaType = 'CORRECTIVE' | 'PREVENTIVE';
export type CapaStatus = 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'VERIFIED';

export interface CapaDto {
  id: string;
  type: CapaType;
  action: string;
  status: CapaStatus;
  dueDate: string | null;
  completedAt: string | null;
  createdAt: string;
  owner: { id: string; firstName: string; lastName: string } | null;
}

export interface IncidentListItem {
  id: string;
  code: string;
  title: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  createdAt: string;
  reporter: { firstName: string; lastName: string };
  assignee: { firstName: string; lastName: string } | null;
  machine: { name: string } | null;
  _count: { comments: number; capas: number };
}

export interface IncidentDetail {
  id: string;
  code: string;
  title: string;
  description: string;
  rootCause: string | null;
  severity: IncidentSeverity;
  status: IncidentStatus;
  escalated: boolean;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
  reporter: { id: string; firstName: string; lastName: string; jobTitle: string | null };
  assignee: { id: string; firstName: string; lastName: string; jobTitle: string | null } | null;
  plant: { id: string; name: string } | null;
  machine: { id: string; name: string; tag: string } | null;
  event: { id: string; title: string } | null;
  capas: CapaDto[];
  attachments: AttachmentDto[];
  _count: { comments: number };
}

export interface IncidentFilters {
  page?: number;
  limit?: number;
  status?: IncidentStatus;
  severity?: IncidentSeverity;
  mine?: boolean;
  assignedToMe?: boolean;
  search?: string;
  sortBy?: 'createdAt' | 'severity' | 'status';
  sortOrder?: 'asc' | 'desc';
}
