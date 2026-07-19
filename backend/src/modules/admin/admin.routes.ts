import { Router } from 'express';
import { adminController } from './admin.controller';
import { authenticate, authorize } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import {
  listUsersSchema,
  inviteUserSchema,
  updateUserSchema,
  idParamSchema,
  createDepartmentSchema,
  updateDepartmentSchema,
  createMachineSchema,
  updateMachineSchema,
  updatePlantSchema,
} from './admin.validation';

const router = Router();
router.use(authenticate, authorize('ADMIN'));

/**
 * @openapi
 * tags:
 *   - name: Admin
 *     description: User, department, machine, and plant administration (admin only)
 */

/**
 * @openapi
 * /admin/users:
 *   get:
 *     tags: [Admin]
 *     summary: List users with search, role, and status filters
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Paginated users }
 *       403: { description: Admin role required }
 */
router.get('/users', validate(listUsersSchema), adminController.listUsers);

/**
 * @openapi
 * /admin/users/invite:
 *   post:
 *     tags: [Admin]
 *     summary: Invite a new user — emails them a link to set their own password
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: User invited }
 */
router.post('/users/invite', validate(inviteUserSchema), adminController.inviteUser);

/**
 * @openapi
 * /admin/users/{id}:
 *   patch:
 *     tags: [Admin]
 *     summary: Update a user's role, status, department, or job title
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: User updated }
 *   delete:
 *     tags: [Admin]
 *     summary: Deactivate a user (soft — preserves their historical records)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: User deactivated }
 */
router.patch('/users/:id', validate(updateUserSchema), adminController.updateUser);
router.delete('/users/:id', validate(idParamSchema), adminController.deactivateUser);

router.get('/departments', adminController.listDepartments);
router.post('/departments', validate(createDepartmentSchema), adminController.createDepartment);
router.patch('/departments/:id', validate(updateDepartmentSchema), adminController.updateDepartment);
router.delete('/departments/:id', validate(idParamSchema), adminController.removeDepartment);

router.get('/machines', adminController.listMachines);
router.post('/machines', validate(createMachineSchema), adminController.createMachine);
router.patch('/machines/:id', validate(updateMachineSchema), adminController.updateMachine);
router.delete('/machines/:id', validate(idParamSchema), adminController.removeMachine);

router.get('/plants', adminController.listPlants);
router.patch('/plants/:id', validate(updatePlantSchema), adminController.updatePlant);

export default router;
