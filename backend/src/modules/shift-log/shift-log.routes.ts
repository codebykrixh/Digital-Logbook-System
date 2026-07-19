import { Router } from 'express';
import { shiftLogController } from './shift-log.controller';
import { authenticate } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { upload } from '../../middleware/upload';
import {
  createShiftLogSchema,
  updateShiftLogSchema,
  listShiftLogsSchema,
  idParamSchema,
  attachmentParamSchema,
} from './shift-log.validation';

const router = Router();
router.use(authenticate);

/**
 * @openapi
 * tags:
 *   - name: Shift Logbook
 *     description: Digital shift logbook entries
 */

/**
 * @openapi
 * /shift-logs:
 *   get:
 *     tags: [Shift Logbook]
 *     summary: List shift logs with search, filters, sorting, and pagination
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Paginated shift logs }
 *   post:
 *     tags: [Shift Logbook]
 *     summary: Create a new draft shift log
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Shift log created }
 */
router.get('/', validate(listShiftLogsSchema), shiftLogController.list);
router.post('/', validate(createShiftLogSchema), shiftLogController.create);

/**
 * @openapi
 * /shift-logs/export:
 *   get:
 *     tags: [Shift Logbook]
 *     summary: Export shift logs matching the current filters as CSV
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: CSV file }
 */
router.get('/export', validate(listShiftLogsSchema), shiftLogController.exportCsv);

/**
 * @openapi
 * /shift-logs/{id}:
 *   get:
 *     tags: [Shift Logbook]
 *     summary: Get a single shift log
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Shift log }
 *       404: { description: Not found }
 *   patch:
 *     tags: [Shift Logbook]
 *     summary: Update a shift log (author or admin, while editable)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Shift log updated }
 *   delete:
 *     tags: [Shift Logbook]
 *     summary: Delete a shift log (author or admin, while editable)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Shift log deleted }
 */
router.get('/:id', validate(idParamSchema), shiftLogController.getById);
router.patch('/:id', validate(updateShiftLogSchema), shiftLogController.update);
router.delete('/:id', validate(idParamSchema), shiftLogController.remove);

/**
 * @openapi
 * /shift-logs/{id}/submit:
 *   post:
 *     tags: [Shift Logbook]
 *     summary: Submit a draft shift log for supervisor sign-off
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Shift log submitted }
 */
router.post('/:id/submit', validate(idParamSchema), shiftLogController.submit);

/**
 * @openapi
 * /shift-logs/{id}/sign:
 *   post:
 *     tags: [Shift Logbook]
 *     summary: Sign a submitted shift log (supervisor, manager, or admin)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Shift log signed }
 */
router.post('/:id/sign', validate(idParamSchema), shiftLogController.sign);

/**
 * @openapi
 * /shift-logs/{id}/attachments:
 *   post:
 *     tags: [Shift Logbook]
 *     summary: Upload an attachment to a shift log
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file: { type: string, format: binary }
 *     responses:
 *       201: { description: Attachment uploaded }
 */
router.post(
  '/:id/attachments',
  validate(idParamSchema),
  upload.single('file'),
  shiftLogController.addAttachment
);

/**
 * @openapi
 * /shift-logs/{id}/attachments/{attachmentId}:
 *   delete:
 *     tags: [Shift Logbook]
 *     summary: Remove an attachment from a shift log
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Attachment removed }
 */
router.delete(
  '/:id/attachments/:attachmentId',
  validate(attachmentParamSchema),
  shiftLogController.removeAttachment
);

export default router;
