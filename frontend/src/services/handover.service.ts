import { apiFetch, ApiClientError } from '@/lib/api';
import type { HandoverDetail, HandoverListItem, HandoverFilters, ChecklistItemDto } from '@/types/handover';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

function buildQuery(filters: HandoverFilters = {}): string {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === '' || value === null) return;
    params.set(key, String(value));
  });
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export const handoverApi = {
  list: (filters: HandoverFilters = {}) => apiFetch<HandoverListItem[]>(`/handovers${buildQuery(filters)}`),

  get: (id: string) => apiFetch<HandoverDetail>(`/handovers/${id}`),

  create: (values: { shiftType: string; shiftDate: string; toUserId?: string }) =>
    apiFetch<HandoverDetail>('/handovers', { method: 'POST', body: values }),

  update: (
    id: string,
    values: Partial<{ toUserId: string; summary: string; pendingWork: string; supervisorNote: string; checklist: ChecklistItemDto[] }>
  ) => apiFetch<HandoverDetail>(`/handovers/${id}`, { method: 'PATCH', body: values }),

  remove: (id: string) => apiFetch<null>(`/handovers/${id}`, { method: 'DELETE' }),

  regenerateSummary: (id: string) => apiFetch<HandoverDetail>(`/handovers/${id}/regenerate-summary`, { method: 'POST' }),

  sign: (id: string, signatureData: string) =>
    apiFetch<HandoverDetail>(`/handovers/${id}/sign`, { method: 'POST', body: { signatureData } }),

  acknowledge: (id: string) => apiFetch<HandoverDetail>(`/handovers/${id}/acknowledge`, { method: 'POST' }),

  async downloadPdf(id: string, accessToken: string | null): Promise<void> {
    const res = await fetch(`${API_URL}/handovers/${id}/pdf`, {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
      credentials: 'include',
    });
    if (!res.ok) throw new ApiClientError(res.status, 'Failed to download PDF');
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `handover-${id}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  },
};
