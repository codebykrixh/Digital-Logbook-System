import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess, buildPageMeta } from '../../utils/ApiResponse';
import { ApiError } from '../../utils/ApiError';
import { eventService } from './event.service';
import { commentService } from '../../services/comment.service';
import type { ListEventsQuery } from './event.validation';

export const eventController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    const event = await eventService.create(req.user!.id, req.body);
    sendSuccess(res, event, 'Event created', 201);
  }),

  list: asyncHandler(async (req: Request, res: Response) => {
    const query = req.query as unknown as ListEventsQuery;
    const { items, total, page, limit } = await eventService.list(req.user!.id, query);
    sendSuccess(res, items, 'Success', 200, buildPageMeta(total, page, limit));
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const event = await eventService.getById(req.params.id as string);
    sendSuccess(res, event);
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const event = await eventService.update(req.user!.id, req.user!.role, req.params.id as string, req.body);
    sendSuccess(res, event, 'Event updated');
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    await eventService.remove(req.user!.id, req.user!.role, req.params.id as string);
    sendSuccess(res, null, 'Event deleted');
  }),

  escalate: asyncHandler(async (req: Request, res: Response) => {
    const incident = await eventService.escalate(req.user!.id, req.user!.role, req.params.id as string);
    sendSuccess(res, incident, 'Event escalated to an incident', 201);
  }),

  addAttachment: asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) throw ApiError.badRequest('No file was uploaded');
    const attachment = await eventService.addAttachment(req.user!.id, req.params.id as string, req.file);
    sendSuccess(res, attachment, 'Attachment uploaded', 201);
  }),

  removeAttachment: asyncHandler(async (req: Request, res: Response) => {
    await eventService.removeAttachment(
      req.user!.id,
      req.user!.role,
      req.params.id as string,
      req.params.attachmentId as string
    );
    sendSuccess(res, null, 'Attachment removed');
  }),

  listComments: asyncHandler(async (req: Request, res: Response) => {
    const comments = await commentService.list({ eventId: req.params.id as string });
    sendSuccess(res, comments);
  }),

  addComment: asyncHandler(async (req: Request, res: Response) => {
    const comment = await commentService.add({
      authorId: req.user!.id,
      body: req.body.body,
      mentionedUserIds: req.body.mentionedUserIds,
      eventId: req.params.id as string,
    });
    sendSuccess(res, comment, 'Comment added', 201);
  }),

  removeComment: asyncHandler(async (req: Request, res: Response) => {
    await commentService.remove(req.params.commentId as string, req.user!.id, req.user!.role);
    sendSuccess(res, null, 'Comment removed');
  }),
};
