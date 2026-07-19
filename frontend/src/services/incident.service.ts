import { apiFetch } from '@/lib/api';
import type { IncidentDetail, IncidentListItem, IncidentFilters, CapaDto } from '@/types/incident';
import type { CommentDto } from '@/types/event';
import type { AttachmentDto } from '@/types/common';
import type { IncidentFormValues, CapaFormValues } from '@/lib/validations/incident';

function buildQuery(filters: IncidentFilters = {}): string {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === '' || value === null) return;
    params.set(key, String(value));
  });
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export const incidentApi = {
  list: (filters: IncidentFilters = {}) => apiFetch<IncidentListItem[]>(`/incidents${buildQuery(filters)}`),

  get: (id: string) => apiFetch<IncidentDetail>(`/incidents/${id}`),

  create: (values: IncidentFormValues) => apiFetch<IncidentDetail>('/incidents', { method: 'POST', body: values }),

  update: (id: string, values: Partial<IncidentFormValues & { status: string; assigneeId: string; rootCause: string }>) =>
    apiFetch<IncidentDetail>(`/incidents/${id}`, { method: 'PATCH', body: values }),

  remove: (id: string) => apiFetch<null>(`/incidents/${id}`, { method: 'DELETE' }),

  escalate: (id: string) => apiFetch<IncidentDetail>(`/incidents/${id}/escalate`, { method: 'POST' }),

  uploadAttachment: (id: string, file: File) => {
    const form = new FormData();
    form.append('file', file);
    return apiFetch<AttachmentDto>(`/incidents/${id}/attachments`, { method: 'POST', body: form });
  },
  removeAttachment: (id: string, attachmentId: string) =>
    apiFetch<null>(`/incidents/${id}/attachments/${attachmentId}`, { method: 'DELETE' }),

  listComments: (id: string) => apiFetch<CommentDto[]>(`/incidents/${id}/comments`),
  addComment: (id: string, body: string, mentionedUserIds: string[]) =>
    apiFetch<CommentDto>(`/incidents/${id}/comments`, { method: 'POST', body: { body, mentionedUserIds } }),
  removeComment: (id: string, commentId: string) =>
    apiFetch<null>(`/incidents/${id}/comments/${commentId}`, { method: 'DELETE' }),

  createCapa: (id: string, values: CapaFormValues) =>
    apiFetch<CapaDto>(`/incidents/${id}/capas`, { method: 'POST', body: values }),
  updateCapa: (id: string, capaId: string, values: Partial<CapaFormValues & { status: string }>) =>
    apiFetch<CapaDto>(`/incidents/${id}/capas/${capaId}`, { method: 'PATCH', body: values }),
  removeCapa: (id: string, capaId: string) =>
    apiFetch<null>(`/incidents/${id}/capas/${capaId}`, { method: 'DELETE' }),
};
