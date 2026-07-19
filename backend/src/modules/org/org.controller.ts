import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess } from '../../utils/ApiResponse';
import { orgService } from './org.service';

export const orgController = {
  context: asyncHandler(async (req: Request, res: Response) => {
    const data = await orgService.getContextForUser(req.user!.id);
    sendSuccess(res, data);
  }),
};
