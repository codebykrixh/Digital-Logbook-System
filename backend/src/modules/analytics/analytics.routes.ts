import { Router } from 'express';
import { analyticsController } from './analytics.controller';
import { authenticate, authorize } from '../../middleware/auth';

const router = Router();

/**
 * @openapi
 * tags:
 *   - name: Analytics
 *     description: Operational KPIs and dashboard aggregates
 */

/**
 * @openapi
 * /analytics/overview:
 *   get:
 *     tags: [Analytics]
 *     summary: Get the executive dashboard KPI overview
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Aggregated dashboard metrics }
 *       401: { description: Not authenticated }
 */
router.get('/overview', authenticate, analyticsController.overview);

/**
 * @openapi
 * /analytics/machine-health:
 *   get:
 *     tags: [Analytics]
 *     summary: Per-machine health score and incident/event frequency
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Machine health rows, worst health first }
 */
router.get('/machine-health', authenticate, analyticsController.machineHealth);

/**
 * @openapi
 * /analytics/incidents-by-severity:
 *   get:
 *     tags: [Analytics]
 *     summary: Incident counts grouped by severity
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Severity breakdown }
 */
router.get('/incidents-by-severity', authenticate, analyticsController.incidentsBySeverity);

/**
 * @openapi
 * /analytics/audit-log:
 *   get:
 *     tags: [Analytics]
 *     summary: Paginated system-wide audit trail (manager or admin only)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Paginated audit log entries }
 *       403: { description: Manager or admin role required }
 */
router.get('/audit-log', authenticate, authorize('MANAGER', 'ADMIN'), analyticsController.auditLog);

/**
 * @openapi
 * /analytics/admin-activity:
 *   get:
 *     tags: [Analytics]
 *     summary: Audit trail filtered to actions taken by admins — peer oversight so no admin acts unwatched
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Paginated admin-only audit log entries }
 *       403: { description: Manager or admin role required }
 */
router.get('/admin-activity', authenticate, authorize('MANAGER', 'ADMIN'), analyticsController.adminActivity);

export default router;
