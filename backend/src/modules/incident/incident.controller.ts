import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess, buildPageMeta } from '../../utils/ApiResponse';
import { ApiError } from '../../utils/ApiError';
import { incidentService, capaService } from './incident.service';
import { commentService } from '../../services/comment.service';
import type { ListIncidentsQuery } from './incident.validation';

export const incidentController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    const incident = await incidentService.create(req.user!.id, req.body);
    sendSuccess(res, incident, 'Incident reported', 201);
  }),

  list: asyncHandler(async (req: Request, res: Response) => {
    const query = req.query as unknown as ListIncidentsQuery;
    const { items, total, page, limit } = await incidentService.list(req.user!.id, query);
    sendSuccess(res, items, 'Success', 200, buildPageMeta(total, page, limit));
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const incident = await incidentService.getById(req.params.id as string);
    sendSuccess(res, incident);
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const incident = await incidentService.update(req.user!.id, req.user!.role, req.params.id as string, req.body);
    sendSuccess(res, incident, 'Incident updated');
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    await incidentService.remove(req.user!.id, req.user!.role, req.params.id as string);
    sendSuccess(res, null, 'Incident deleted');
  }),

  escalate: asyncHandler(async (req: Request, res: Response) => {
    const incident = await incidentService.escalate(req.user!.id, req.user!.role, req.params.id as string);
    sendSuccess(res, incident, 'Incident escalated');
  }),

  addAttachment: asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) throw ApiError.badRequest('No file was uploaded');
    const attachment = await incidentService.addAttachment(req.user!.id, req.params.id as string, req.file);
    sendSuccess(res, attachment, 'Attachment uploaded', 201);
  }),

  removeAttachment: asyncHandler(async (req: Request, res: Response) => {
    await incidentService.removeAttachment(
      req.user!.id,
      req.user!.role,
      req.params.id as string,
      req.params.attachmentId as string
    );
    sendSuccess(res, null, 'Attachment removed');
  }),

  listComments: asyncHandler(async (req: Request, res: Response) => {
    const comments = await commentService.list({ incidentId: req.params.id as string });
    sendSuccess(res, comments);
  }),

  addComment: asyncHandler(async (req: Request, res: Response) => {
    const comment = await commentService.add({
      authorId: req.user!.id,
      body: req.body.body,
      mentionedUserIds: req.body.mentionedUserIds,
      incidentId: req.params.id as string,
    });
    sendSuccess(res, comment, 'Comment added', 201);
  }),

  removeComment: asyncHandler(async (req: Request, res: Response) => {
    await commentService.remove(req.params.commentId as string, req.user!.id, req.user!.role);
    sendSuccess(res, null, 'Comment removed');
  }),

  createCapa: asyncHandler(async (req: Request, res: Response) => {
    const capa = await capaService.create(req.user!.id, req.user!.role, req.params.id as string, req.body);
    sendSuccess(res, capa, 'Corrective action created', 201);
  }),

  updateCapa: asyncHandler(async (req: Request, res: Response) => {
    const capa = await capaService.update(
      req.user!.id,
      req.user!.role,
      req.params.id as string,
      req.params.capaId as string,
      req.body
    );
    sendSuccess(res, capa, 'Corrective action updated');
  }),

  removeCapa: asyncHandler(async (req: Request, res: Response) => {
    await capaService.remove(req.user!.role, req.params.id as string, req.params.capaId as string);
    sendSuccess(res, null, 'Corrective action removed');
  }),
};
