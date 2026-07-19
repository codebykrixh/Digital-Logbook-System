export type HandoverStatus = 'DRAFT' | 'PENDING_ACK' | 'ACKNOWLEDGED';

export interface ChecklistItemDto {
  id: string;
  label: string;
  done: boolean;
}

export interface HandoverListItem {
  id: string;
  code: string;
  shiftType: string;
  shiftDate: string;
  status: HandoverStatus;
  fromUser: { firstName: string; lastName: string };
  toUser: { firstName: string; lastName: string } | null;
}

export interface HandoverDetail {
  id: string;
  code: string;
  shiftType: string;
  shiftDate: string;
  status: HandoverStatus;
  summary: string | null;
  pendingWork: string | null;
  supervisorNote: string | null;
  checklist: ChecklistItemDto[] | null;
  signatureData: string | null;
  signedAt: string | null;
  acknowledgedAt: string | null;
  createdAt: string;
  fromUser: { id: string; firstName: string; lastName: string; jobTitle: string | null };
  toUser: { id: string; firstName: string; lastName: string; jobTitle: string | null } | null;
}

export interface HandoverFilters {
  page?: number;
  limit?: number;
  status?: HandoverStatus;
  mine?: boolean;
  forMe?: boolean;
}
