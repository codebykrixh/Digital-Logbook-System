export type NotificationType =
  | 'INFO'
  | 'WARNING'
  | 'INCIDENT'
  | 'MENTION'
  | 'HANDOVER'
  | 'SYSTEM';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string | null;
  link: string | null;
  isRead: boolean;
  createdAt: string;
}
