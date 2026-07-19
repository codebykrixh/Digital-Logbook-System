import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess, buildPageMeta } from '../../utils/ApiResponse';
import { notificationsService } from './notifications.service';

export const notificationsController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const { items, total } = await notificationsService.list(req.user!.id, page, limit);
    sendSuccess(res, { items, total }, 'Success', 200, buildPageMeta(total, page, limit));
  }),

  unreadCount: asyncHandler(async (req: Request, res: Response) => {
    const count = await notificationsService.unreadCount(req.user!.id);
    sendSuccess(res, { count });
  }),

  markRead: asyncHandler(async (req: Request, res: Response) => {
    const notification = await notificationsService.markRead(req.user!.id, req.params.id as string);
    sendSuccess(res, notification, 'Marked as read');
  }),

  markAllRead: asyncHandler(async (req: Request, res: Response) => {
    await notificationsService.markAllRead(req.user!.id);
    sendSuccess(res, null, 'All notifications marked as read');
  }),
};
