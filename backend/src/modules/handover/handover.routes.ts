import { Router } from 'express';
import { handoverController } from './handover.controller';
import { authenticate } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import {
  createHandoverSchema,
  updateHandoverSchema,
  signHandoverSchema,
  listHandoversSchema,
  idParamSchema,
} from './handover.validation';

const router = Router();
router.use(authenticate);

/**
 * @openapi
 * tags:
 *   - name: Handover
 *     description: Structured shift-to-shift handover with auto-summary, checklist, and digital signature
 */

/**
 * @openapi
 * /handovers:
 *   get:
 *     tags: [Handover]
 *     summary: List handovers (mine, or addressed to me)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Paginated handovers }
 *   post:
 *     tags: [Handover]
 *     summary: Create a draft handover with an auto-generated summary
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Handover created }
 */
router.get('/', validate(listHandoversSchema), handoverController.list);
router.post('/', validate(createHandoverSchema), handoverController.create);

router.get('/export', validate(listHandoversSchema), handoverController.exportCsv);

/**
 * @openapi
 * /handovers/{id}:
 *   get:
 *     tags: [Handover]
 *     summary: Get a single handover
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Handover }
 *   patch:
 *     tags: [Handover]
 *     summary: Update a draft handover
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Handover updated }
 *   delete:
 *     tags: [Handover]
 *     summary: Delete a draft handover
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Handover deleted }
 */
router.get('/:id', validate(idParamSchema), handoverController.getById);
router.patch('/:id', validate(updateHandoverSchema), handoverController.update);
router.delete('/:id', validate(idParamSchema), handoverController.remove);

router.post('/:id/regenerate-summary', validate(idParamSchema), handoverController.regenerateSummary);

/**
 * @openapi
 * /handovers/{id}/sign:
 *   post:
 *     tags: [Handover]
 *     summary: Sign the handover with a captured signature (outgoing operator only)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Handover signed, moved to PENDING_ACK }
 */
router.post('/:id/sign', validate(signHandoverSchema), handoverController.sign);

/**
 * @openapi
 * /handovers/{id}/acknowledge:
 *   post:
 *     tags: [Handover]
 *     summary: Acknowledge receipt of a handover (incoming operator only)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Handover acknowledged }
 */
router.post('/:id/acknowledge', validate(idParamSchema), handoverController.acknowledge);

/**
 * @openapi
 * /handovers/{id}/pdf:
 *   get:
 *     tags: [Handover]
 *     summary: Download the handover as a signed PDF
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: PDF file }
 */
router.get('/:id/pdf', validate(idParamSchema), handoverController.exportPdf);

export default router;
