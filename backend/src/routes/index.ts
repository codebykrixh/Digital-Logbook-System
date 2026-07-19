import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes';
import analyticsRoutes from '../modules/analytics/analytics.routes';
import notificationsRoutes from '../modules/notifications/notifications.routes';
import orgRoutes from '../modules/org/org.routes';
import shiftLogRoutes from '../modules/shift-log/shift-log.routes';
import eventRoutes from '../modules/event/event.routes';
import incidentRoutes from '../modules/incident/incident.routes';
import handoverRoutes from '../modules/handover/handover.routes';
import adminRoutes from '../modules/admin/admin.routes';

const router = Router();

/**
 * @openapi
 * /health:
 *   get:
 *     tags: [System]
 *     summary: Liveness probe
 *     responses:
 *       200: { description: Service is healthy }
 */
router.get('/health', (_req, res) => {
  res.json({
    success: true,
    service: 'digilog-api',
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

router.use('/auth', authRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/notifications', notificationsRoutes);
router.use('/org', orgRoutes);
router.use('/shift-logs', shiftLogRoutes);
router.use('/events', eventRoutes);
router.use('/incidents', incidentRoutes);
router.use('/handovers', handoverRoutes);
router.use('/admin', adminRoutes);

export default router;
