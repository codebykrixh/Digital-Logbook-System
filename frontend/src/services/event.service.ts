import { apiFetch } from '@/lib/api';
import type { EventDetail, EventListItem, EventFilters, CommentDto } from '@/types/event';
import type { AttachmentDto } from '@/types/common';
import type { EventFormValues } from '@/lib/validations/event';

function buildQuery(filters: EventFilters = {}): string {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === '' || value === null) return;
    params.set(key, String(value));
  });
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export const eventApi = {
  list: (filters: EventFilters = {}) => apiFetch<EventListItem[]>(`/events${buildQuery(filters)}`),

  get: (id: string) => apiFetch<EventDetail>(`/events/${id}`),

  create: (values: EventFormValues) =>
    apiFetch<EventDetail>('/events', { method: 'POST', body: values }),

  update: (id: string, values: Partial<EventFormValues & { status: string }>) =>
    apiFetch<EventDetail>(`/events/${id}`, { method: 'PATCH', body: values }),

  remove: (id: string) => apiFetch<null>(`/events/${id}`, { method: 'DELETE' }),

  escalate: (id: string) => apiFetch<{ id: string; code: string }>(`/events/${id}/escalate`, { method: 'POST' }),

  uploadAttachment: (id: string, file: File) => {
    const form = new FormData();
    form.append('file', file);
    return apiFetch<AttachmentDto>(`/events/${id}/attachments`, { method: 'POST', body: form });
  },

  removeAttachment: (id: string, attachmentId: string) =>
    apiFetch<null>(`/events/${id}/attachments/${attachmentId}`, { method: 'DELETE' }),

  listComments: (id: string) => apiFetch<CommentDto[]>(`/events/${id}/comments`),

  addComment: (id: string, body: string, mentionedUserIds: string[]) =>
    apiFetch<CommentDto>(`/events/${id}/comments`, {
      method: 'POST',
      body: { body, mentionedUserIds },
    }),

  removeComment: (id: string, commentId: string) =>
    apiFetch<null>(`/events/${id}/comments/${commentId}`, { method: 'DELETE' }),
};
