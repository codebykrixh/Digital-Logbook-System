import { Router } from 'express';
import { notificationsController } from './notifications.controller';
import { authenticate } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { listNotificationsSchema, markReadSchema } from './notifications.validation';

const router = Router();
router.use(authenticate);

/**
 * @openapi
 * tags:
 *   - name: Notifications
 *     description: In-app notifications
 */

/**
 * @openapi
 * /notifications:
 *   get:
 *     tags: [Notifications]
 *     summary: List the current user's notifications
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Paginated notifications }
 */
router.get('/', validate(listNotificationsSchema), notificationsController.list);

/**
 * @openapi
 * /notifications/unread-count:
 *   get:
 *     tags: [Notifications]
 *     summary: Get the unread notification count
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Unread count }
 */
router.get('/unread-count', notificationsController.unreadCount);

/**
 * @openapi
 * /notifications/{id}/read:
 *   patch:
 *     tags: [Notifications]
 *     summary: Mark a single notification as read
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Notification marked as read }
 *       404: { description: Notification not found }
 */
router.patch('/:id/read', validate(markReadSchema), notificationsController.markRead);

/**
 * @openapi
 * /notifications/read-all:
 *   patch:
 *     tags: [Notifications]
 *     summary: Mark all notifications as read
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: All notifications marked as read }
 */
router.patch('/read-all', notificationsController.markAllRead);

export default router;
