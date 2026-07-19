export type ShiftType = 'MORNING' | 'AFTERNOON' | 'NIGHT';
export type ShiftLogStatus = 'DRAFT' | 'SUBMITTED' | 'SIGNED' | 'ARCHIVED';

export interface ShiftLogAttachment {
  id: string;
  fileName: string;
  url: string;
  mimeType: string;
  sizeBytes: number;
  uploadedById: string;
  createdAt: string;
}

export interface ShiftLogAuthor {
  firstName: string;
  lastName: string;
  jobTitle?: string | null;
}

export interface ShiftLogListItem {
  id: string;
  code: string;
  shiftType: ShiftType;
  shiftDate: string;
  status: ShiftLogStatus;
  equipmentStatus: string | null;
  createdAt: string;
  author: { firstName: string; lastName: string };
  plant: { name: string };
  department: { name: string } | null;
  _count: { attachments: number };
}

export interface ShiftLogDetail {
  id: string;
  code: string;
  shiftType: ShiftType;
  shiftDate: string;
  status: ShiftLogStatus;
  equipmentStatus: string | null;
  temperature: number | null;
  pressure: number | null;
  productionNotes: string | null;
  safetyNotes: string | null;
  remarks: string | null;
  signedAt: string | null;
  createdAt: string;
  updatedAt: string;
  author: { id: string; firstName: string; lastName: string; jobTitle: string | null };
  plant: { id: string; name: string };
  department: { id: string; name: string; code: string } | null;
  attachments: ShiftLogAttachment[];
}

export interface ShiftLogFilters {
  page?: number;
  limit?: number;
  status?: ShiftLogStatus;
  shiftType?: ShiftType;
  departmentId?: string;
  search?: string;
  from?: string;
  to?: string;
  mine?: boolean;
  sortBy?: 'shiftDate' | 'createdAt' | 'status';
  sortOrder?: 'asc' | 'desc';
}
