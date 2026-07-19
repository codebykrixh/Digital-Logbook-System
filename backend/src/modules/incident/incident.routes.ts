import { Router } from 'express';
import { incidentController } from './incident.controller';
import { authenticate } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { upload } from '../../middleware/upload';
import {
  createIncidentSchema,
  updateIncidentSchema,
  listIncidentsSchema,
  idParamSchema,
  addCommentSchema,
  commentParamSchema,
  createCapaSchema,
  updateCapaSchema,
  capaParamSchema,
} from './incident.validation';

const router = Router();
router.use(authenticate);

/**
 * @openapi
 * tags:
 *   - name: Incidents
 *     description: Incident management, escalation, and corrective/preventive actions
 */

/**
 * @openapi
 * /incidents:
 *   get:
 *     tags: [Incidents]
 *     summary: List incidents with search, filters, sorting, pagination
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Paginated incidents }
 *   post:
 *     tags: [Incidents]
 *     summary: Report a new incident
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Incident reported }
 */
router.get('/', validate(listIncidentsSchema), incidentController.list);
router.post('/', validate(createIncidentSchema), incidentController.create);

/**
 * @openapi
 * /incidents/{id}:
 *   get:
 *     tags: [Incidents]
 *     summary: Get a single incident with CAPAs and attachments
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Incident }
 *   patch:
 *     tags: [Incidents]
 *     summary: Update an incident (reporter/assignee/admin; assign & review-stage transitions require supervisor+)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Incident updated }
 *   delete:
 *     tags: [Incidents]
 *     summary: Delete an incident (reporter or admin, only while OPEN)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Incident deleted }
 */
router.get('/:id', validate(idParamSchema), incidentController.getById);
router.patch('/:id', validate(updateIncidentSchema), incidentController.update);
router.delete('/:id', validate(idParamSchema), incidentController.remove);

/**
 * @openapi
 * /incidents/{id}/escalate:
 *   post:
 *     tags: [Incidents]
 *     summary: Escalate an incident to management (supervisor, manager, or admin) — notifies + emails on high/critical severity
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Incident escalated }
 */
router.post('/:id/escalate', validate(idParamSchema), incidentController.escalate);

router.post('/:id/attachments', validate(idParamSchema), upload.single('file'), incidentController.addAttachment);
router.delete('/:id/attachments/:attachmentId', incidentController.removeAttachment);

router.get('/:id/comments', validate(idParamSchema), incidentController.listComments);
router.post('/:id/comments', validate(addCommentSchema), incidentController.addComment);
router.delete('/:id/comments/:commentId', validate(commentParamSchema), incidentController.removeComment);

/**
 * @openapi
 * /incidents/{id}/capas:
 *   post:
 *     tags: [Incidents]
 *     summary: Create a corrective or preventive action (supervisor, manager, or admin)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: CAPA created }
 */
router.post('/:id/capas', validate(createCapaSchema), incidentController.createCapa);

/**
 * @openapi
 * /incidents/{id}/capas/{capaId}:
 *   patch:
 *     tags: [Incidents]
 *     summary: Update a CAPA (owner, or supervisor+ to verify)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: CAPA updated }
 *   delete:
 *     tags: [Incidents]
 *     summary: Remove a CAPA (supervisor, manager, or admin)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: CAPA removed }
 */
router.patch('/:id/capas/:capaId', validate(updateCapaSchema), incidentController.updateCapa);
router.delete('/:id/capas/:capaId', validate(capaParamSchema), incidentController.removeCapa);

export default router;
