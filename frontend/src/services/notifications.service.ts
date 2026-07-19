import { apiFetch } from '@/lib/api';
import type { AppNotification } from '@/types/notification';

export const notificationsApi = {
  list: () =>
    apiFetch<{ items: AppNotification[]; total: number }>('/notifications'),

  unreadCount: () => apiFetch<{ count: number }>('/notifications/unread-count'),

  markRead: (id: string) =>
    apiFetch<AppNotification>(`/notifications/${id}/read`, { method: 'PATCH' }),

  markAllRead: () =>
    apiFetch<null>('/notifications/read-all', { method: 'PATCH' }),
};
