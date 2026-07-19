import type { NotificationType } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { ApiError } from '../../utils/ApiError';

interface NotifyInput {
  userId: string;
  type?: NotificationType;
  title: string;
  body?: string;
  link?: string;
}

/** Fire-and-forget in-app notification. Never throws into the caller. */
export async function notifyUser(input: NotifyInput): Promise<void> {
  try {
    await prisma.notification.create({
      data: {
        userId: input.userId,
        type: input.type ?? 'INFO',
        title: input.title,
        body: input.body,
        link: input.link,
      },
    });
  } catch {
    // best-effort — never break the primary operation over a notification
  }
}

export const notificationsService = {
  async list(userId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.notification.count({ where: { userId } }),
    ]);
    return { items, total };
  },

  async unreadCount(userId: string) {
    return prisma.notification.count({ where: { userId, isRead: false } });
  },

  async markRead(userId: string, id: string) {
    const notification = await prisma.notification.findUnique({ where: { id } });
    if (!notification || notification.userId !== userId) {
      throw ApiError.notFound('Notification not found');
    }
    return prisma.notification.update({ where: { id }, data: { isRead: true } });
  },

  async markAllRead(userId: string) {
    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  },
};
