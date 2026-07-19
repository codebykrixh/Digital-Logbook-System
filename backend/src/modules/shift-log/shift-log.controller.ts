import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess, buildPageMeta } from '../../utils/ApiResponse';
import { ApiError } from '../../utils/ApiError';
import { orgService } from '../org/org.service';
import { shiftLogService } from './shift-log.service';
import type { ListShiftLogsQuery } from './shift-log.validation';

function parseListQuery(req: Request): ListShiftLogsQuery {
  return req.query as unknown as ListShiftLogsQuery;
}

export const shiftLogController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    const { plant } = await orgService.getContextForUser(req.user!.id);
    const log = await shiftLogService.create(req.user!.id, plant.id, req.body);
    sendSuccess(res, log, 'Shift log created', 201);
  }),

  list: asyncHandler(async (req: Request, res: Response) => {
    const query = parseListQuery(req);
    const { items, total, page, limit } = await shiftLogService.list(req.user!.id, query);
    sendSuccess(res, items, 'Success', 200, buildPageMeta(total, page, limit));
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const log = await shiftLogService.getById(req.params.id as string);
    sendSuccess(res, log);
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const log = await shiftLogService.update(
      req.user!.id,
      req.user!.role,
      req.params.id as string,
      req.body
    );
    sendSuccess(res, log, 'Shift log updated');
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    await shiftLogService.remove(req.user!.id, req.user!.role, req.params.id as string);
    sendSuccess(res, null, 'Shift log deleted');
  }),

  submit: asyncHandler(async (req: Request, res: Response) => {
    const log = await shiftLogService.submit(req.user!.id, req.params.id as string);
    sendSuccess(res, log, 'Shift log submitted');
  }),

  sign: asyncHandler(async (req: Request, res: Response) => {
    const log = await shiftLogService.sign(req.user!.id, req.user!.role, req.params.id as string);
    sendSuccess(res, log, 'Shift log signed');
  }),

  addAttachment: asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) throw ApiError.badRequest('No file was uploaded');
    const attachment = await shiftLogService.addAttachment(
      req.user!.id,
      req.params.id as string,
      req.file
    );
    sendSuccess(res, attachment, 'Attachment uploaded', 201);
  }),

  removeAttachment: asyncHandler(async (req: Request, res: Response) => {
    await shiftLogService.removeAttachment(
      req.user!.id,
      req.user!.role,
      req.params.id as string,
      req.params.attachmentId as string
    );
    sendSuccess(res, null, 'Attachment removed');
  }),

  exportCsv: asyncHandler(async (req: Request, res: Response) => {
    const query = parseListQuery(req);
    const csv = await shiftLogService.exportCsv(req.user!.id, query);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="shift-logs-${new Date().toISOString().slice(0, 10)}.csv"`
    );
    res.send(csv);
  }),
};
