import { Router } from 'express';
import { eventController } from './event.controller';
import { authenticate } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { upload } from '../../middleware/upload';
import {
  createEventSchema,
  updateEventSchema,
  listEventsSchema,
  idParamSchema,
  addCommentSchema,
  commentParamSchema,
} from './event.validation';

const router = Router();
router.use(authenticate);

/**
 * @openapi
 * tags:
 *   - name: Events
 *     description: Operational event recording
 */

/**
 * @openapi
 * /events:
 *   get:
 *     tags: [Events]
 *     summary: List operational events with search, filters, sorting, pagination
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Paginated events }
 *   post:
 *     tags: [Events]
 *     summary: Create an operational event
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Event created }
 */
router.get('/', validate(listEventsSchema), eventController.list);
router.post('/', validate(createEventSchema), eventController.create);

/**
 * @openapi
 * /events/{id}:
 *   get:
 *     tags: [Events]
 *     summary: Get a single event
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Event }
 *   patch:
 *     tags: [Events]
 *     summary: Update an event (creator or admin; resolve/close requires supervisor+)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Event updated }
 *   delete:
 *     tags: [Events]
 *     summary: Delete an event (creator or admin, while not closed)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Event deleted }
 */
router.get('/:id', validate(idParamSchema), eventController.getById);
router.patch('/:id', validate(updateEventSchema), eventController.update);
router.delete('/:id', validate(idParamSchema), eventController.remove);

/**
 * @openapi
 * /events/{id}/escalate:
 *   post:
 *     tags: [Events]
 *     summary: Escalate an event into an Incident (supervisor, manager, or admin)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Incident created from this event }
 */
router.post('/:id/escalate', validate(idParamSchema), eventController.escalate);

router.post(
  '/:id/attachments',
  validate(idParamSchema),
  upload.single('file'),
  eventController.addAttachment
);
router.delete(
  '/:id/attachments/:attachmentId',
  eventController.removeAttachment
);

/**
 * @openapi
 * /events/{id}/comments:
 *   get:
 *     tags: [Events]
 *     summary: List comments on an event
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Comments }
 *   post:
 *     tags: [Events]
 *     summary: Add a comment, optionally mentioning users
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Comment added }
 */
router.get('/:id/comments', validate(idParamSchema), eventController.listComments);
router.post('/:id/comments', validate(addCommentSchema), eventController.addComment);
router.delete('/:id/comments/:commentId', validate(commentParamSchema), eventController.removeComment);

export default router;
