import type { AttachmentDto } from './common';

export type EventPriority = 'ROUTINE' | 'MAINTENANCE' | 'EMERGENCY';
export type EventStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

export interface CommentDto {
  id: string;
  body: string;
  mentions: string[];
  createdAt: string;
  author: { id: string; firstName: string; lastName: string; jobTitle: string | null };
}

export interface EventListItem {
  id: string;
  title: string;
  priority: EventPriority;
  status: EventStatus;
  occurredAt: string;
  createdAt: string;
  creator: { firstName: string; lastName: string };
  machine: { name: string } | null;
  _count: { comments: number; attachments: number };
}

export interface EventDetail {
  id: string;
  title: string;
  description: string;
  priority: EventPriority;
  status: EventStatus;
  occurredAt: string;
  createdAt: string;
  updatedAt: string;
  creator: { id: string; firstName: string; lastName: string; jobTitle: string | null };
  machine: { id: string; name: string; tag: string } | null;
  incident: { id: string; code: string; status: string } | null;
  attachments: AttachmentDto[];
  _count: { comments: number };
}

export interface EventFilters {
  page?: number;
  limit?: number;
  status?: EventStatus;
  priority?: EventPriority;
  machineId?: string;
  search?: string;
  mine?: boolean;
  sortBy?: 'occurredAt' | 'createdAt' | 'priority' | 'status';
  sortOrder?: 'asc' | 'desc';
}
