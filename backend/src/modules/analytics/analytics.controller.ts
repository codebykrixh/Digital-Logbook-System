import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess, buildPageMeta } from '../../utils/ApiResponse';
import { analyticsService } from './analytics.service';

export const analyticsController = {
  overview: asyncHandler(async (_req: Request, res: Response) => {
    const data = await analyticsService.getOverview();
    sendSuccess(res, data);
  }),

  machineHealth: asyncHandler(async (_req: Request, res: Response) => {
    const data = await analyticsService.getMachineHealth();
    sendSuccess(res, data);
  }),

  incidentsBySeverity: asyncHandler(async (_req: Request, res: Response) => {
    const data = await analyticsService.getIncidentsBySeverity();
    sendSuccess(res, data);
  }),

  auditLog: asyncHandler(async (req: Request, res: Response) => {
    const page = Number(req.query.page ?? 1);
    const limit = Math.min(Number(req.query.limit ?? 50), 100);
    const actorRole = req.query.actorRole as 'OPERATOR' | 'SUPERVISOR' | 'MANAGER' | 'ADMIN' | undefined;
    const { items, total } = await analyticsService.getAuditLog(page, limit, actorRole);
    sendSuccess(res, items, 'Success', 200, buildPageMeta(total, page, limit));
  }),

  adminActivity: asyncHandler(async (req: Request, res: Response) => {
    const page = Number(req.query.page ?? 1);
    const limit = Math.min(Number(req.query.limit ?? 50), 100);
    const { items, total } = await analyticsService.getAuditLog(page, limit, 'ADMIN');
    sendSuccess(res, items, 'Success', 200, buildPageMeta(total, page, limit));
  }),
};
