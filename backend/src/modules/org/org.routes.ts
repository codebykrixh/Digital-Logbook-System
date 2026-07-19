import { Router } from 'express';
import { orgController } from './org.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

/**
 * @openapi
 * tags:
 *   - name: Org
 *     description: Organization context (plant, departments, machines)
 */

/**
 * @openapi
 * /org/context:
 *   get:
 *     tags: [Org]
 *     summary: Get the current user's plant, departments, and machines
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Organization context }
 *       401: { description: Not authenticated }
 */
router.get('/context', authenticate, orgController.context);

export default router;
