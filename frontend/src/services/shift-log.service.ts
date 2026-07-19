import { apiFetch, ApiClientError } from '@/lib/api';
import type {
  ShiftLogDetail,
  ShiftLogListItem,
  ShiftLogFilters,
  ShiftLogAttachment,
} from '@/types/shift-log';
import type { ShiftLogFormValues } from '@/lib/validations/shift-log';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

function buildQuery(filters: ShiftLogFilters = {}): string {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === '' || value === null) return;
    params.set(key, String(value));
  });
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

function toPayload(values: Partial<ShiftLogFormValues>) {
  return {
    ...values,
    equipmentStatus: values.equipmentStatus || undefined,
    productionNotes: values.productionNotes || undefined,
    safetyNotes: values.safetyNotes || undefined,
    remarks: values.remarks || undefined,
  };
}

export const shiftLogApi = {
  list: (filters: ShiftLogFilters = {}) =>
    apiFetch<ShiftLogListItem[]>(`/shift-logs${buildQuery(filters)}`),

  get: (id: string) => apiFetch<ShiftLogDetail>(`/shift-logs/${id}`),

  create: (values: Partial<ShiftLogFormValues>) =>
    apiFetch<ShiftLogDetail>('/shift-logs', {
      method: 'POST',
      body: toPayload(values),
    }),

  update: (id: string, values: Partial<ShiftLogFormValues>) =>
    apiFetch<ShiftLogDetail>(`/shift-logs/${id}`, {
      method: 'PATCH',
      body: toPayload(values),
    }),

  remove: (id: string) => apiFetch<null>(`/shift-logs/${id}`, { method: 'DELETE' }),

  submit: (id: string) =>
    apiFetch<ShiftLogDetail>(`/shift-logs/${id}/submit`, { method: 'POST' }),

  sign: (id: string) =>
    apiFetch<ShiftLogDetail>(`/shift-logs/${id}/sign`, { method: 'POST' }),

  uploadAttachment: (id: string, file: File) => {
    const form = new FormData();
    form.append('file', file);
    return apiFetch<ShiftLogAttachment>(`/shift-logs/${id}/attachments`, {
      method: 'POST',
      body: form,
    });
  },

  removeAttachment: (id: string, attachmentId: string) =>
    apiFetch<null>(`/shift-logs/${id}/attachments/${attachmentId}`, {
      method: 'DELETE',
    }),

  /** Downloads the filtered CSV export by triggering a browser save. */
  async exportCsv(filters: ShiftLogFilters, accessToken: string | null): Promise<void> {
    const res = await fetch(`${API_URL}/shift-logs/export${buildQuery(filters)}`, {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
      credentials: 'include',
    });
    if (!res.ok) {
      throw new ApiClientError(res.status, 'Failed to export shift logs');
    }
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shift-logs-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  },
};
