import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess, buildPageMeta } from '../../utils/ApiResponse';
import { adminUserService, adminOrgService } from './admin.service';
import { orgService } from '../org/org.service';
import type { ListUsersQuery } from './admin.validation';

async function currentPlantId(userId: string): Promise<string> {
  const { plant } = await orgService.getContextForUser(userId);
  return plant.id;
}

export const adminController = {
  listUsers: asyncHandler(async (req: Request, res: Response) => {
    const query = req.query as unknown as ListUsersQuery;
    const { items, total, page, limit } = await adminUserService.list(query);
    sendSuccess(res, items, 'Success', 200, buildPageMeta(total, page, limit));
  }),

  inviteUser: asyncHandler(async (req: Request, res: Response) => {
    const user = await adminUserService.invite(req.user!.id, req.body);
    sendSuccess(res, user, 'Invitation sent', 201);
  }),

  updateUser: asyncHandler(async (req: Request, res: Response) => {
    const user = await adminUserService.update(req.user!.id, req.params.id as string, req.body);
    sendSuccess(res, user, 'User updated');
  }),

  deactivateUser: asyncHandler(async (req: Request, res: Response) => {
    await adminUserService.deactivate(req.user!.id, req.params.id as string);
    sendSuccess(res, null, 'User deactivated');
  }),

  listDepartments: asyncHandler(async (req: Request, res: Response) => {
    const plantId = await currentPlantId(req.user!.id);
    sendSuccess(res, await adminOrgService.listDepartments(plantId));
  }),
  createDepartment: asyncHandler(async (req: Request, res: Response) => {
    const plantId = await currentPlantId(req.user!.id);
    const dept = await adminOrgService.createDepartment(req.user!.id, plantId, req.body);
    sendSuccess(res, dept, 'Department created', 201);
  }),
  updateDepartment: asyncHandler(async (req: Request, res: Response) => {
    const dept = await adminOrgService.updateDepartment(req.user!.id, req.params.id as string, req.body);
    sendSuccess(res, dept, 'Department updated');
  }),
  removeDepartment: asyncHandler(async (req: Request, res: Response) => {
    await adminOrgService.removeDepartment(req.user!.id, req.params.id as string);
    sendSuccess(res, null, 'Department deleted');
  }),

  listMachines: asyncHandler(async (req: Request, res: Response) => {
    const plantId = await currentPlantId(req.user!.id);
    sendSuccess(res, await adminOrgService.listMachines(plantId));
  }),
  createMachine: asyncHandler(async (req: Request, res: Response) => {
    const plantId = await currentPlantId(req.user!.id);
    const machine = await adminOrgService.createMachine(req.user!.id, plantId, req.body);
    sendSuccess(res, machine, 'Machine created', 201);
  }),
  updateMachine: asyncHandler(async (req: Request, res: Response) => {
    const machine = await adminOrgService.updateMachine(req.user!.id, req.params.id as string, req.body);
    sendSuccess(res, machine, 'Machine updated');
  }),
  removeMachine: asyncHandler(async (req: Request, res: Response) => {
    await adminOrgService.removeMachine(req.user!.id, req.params.id as string);
    sendSuccess(res, null, 'Machine deleted');
  }),

  listPlants: asyncHandler(async (_req: Request, res: Response) => {
    sendSuccess(res, await adminOrgService.listPlants());
  }),
  updatePlant: asyncHandler(async (req: Request, res: Response) => {
    const plant = await adminOrgService.updatePlant(req.user!.id, req.params.id as string, req.body);
    sendSuccess(res, plant, 'Plant updated');
  }),
};
