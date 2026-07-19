import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess, buildPageMeta } from '../../utils/ApiResponse';
import { handoverService } from './handover.service';
import type { ListHandoversQuery } from './handover.validation';

export const handoverController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    const handover = await handoverService.create(req.user!.id, req.body);
    sendSuccess(res, handover, 'Handover created', 201);
  }),

  regenerateSummary: asyncHandler(async (req: Request, res: Response) => {
    const handover = await handoverService.regenerateSummary(req.user!.id, req.params.id as string);
    sendSuccess(res, handover, 'Summary regenerated');
  }),

  list: asyncHandler(async (req: Request, res: Response) => {
    const query = req.query as unknown as ListHandoversQuery;
    const { items, total, page, limit } = await handoverService.list(req.user!.id, query);
    sendSuccess(res, items, 'Success', 200, buildPageMeta(total, page, limit));
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const handover = await handoverService.getById(req.params.id as string);
    sendSuccess(res, handover);
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const handover = await handoverService.update(req.user!.id, req.user!.role, req.params.id as string, req.body);
    sendSuccess(res, handover, 'Handover updated');
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    await handoverService.remove(req.user!.id, req.user!.role, req.params.id as string);
    sendSuccess(res, null, 'Handover deleted');
  }),

  sign: asyncHandler(async (req: Request, res: Response) => {
    const handover = await handoverService.sign(req.user!.id, req.params.id as string, req.body.signatureData);
    sendSuccess(res, handover, 'Handover signed');
  }),

  acknowledge: asyncHandler(async (req: Request, res: Response) => {
    const handover = await handoverService.acknowledge(req.user!.id, req.params.id as string);
    sendSuccess(res, handover, 'Handover acknowledged');
  }),

  exportCsv: asyncHandler(async (req: Request, res: Response) => {
    const query = req.query as unknown as ListHandoversQuery;
    const csv = await handoverService.exportCsv(req.user!.id, query);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="handovers-${new Date().toISOString().slice(0, 10)}.csv"`);
    res.send(csv);
  }),

  exportPdf: asyncHandler(async (req: Request, res: Response) => {
    const buffer = await handoverService.generatePdf(req.params.id as string);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="handover-${req.params.id}.pdf"`);
    res.send(buffer);
  }),
};
