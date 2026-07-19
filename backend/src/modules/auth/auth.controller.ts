import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess } from '../../utils/ApiResponse';
import {
  setRefreshCookie,
  clearRefreshCookie,
  REFRESH_COOKIE,
} from '../../utils/cookies';
import { authService } from './auth.service';

function ctxFrom(req: Request) {
  return {
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  };
}

export const authController = {
  register: asyncHandler(async (req: Request, res: Response) => {
    const { user, accessToken, refreshToken } = await authService.register(
      req.body,
      ctxFrom(req)
    );
    setRefreshCookie(res, refreshToken);
    sendSuccess(
      res,
      { user, accessToken },
      'Account created. Please verify your email.',
      201
    );
  }),

  login: asyncHandler(async (req: Request, res: Response) => {
    const { user, accessToken, refreshToken } = await authService.login(
      req.body,
      ctxFrom(req)
    );
    setRefreshCookie(res, refreshToken);
    sendSuccess(res, { user, accessToken }, 'Signed in successfully');
  }),

  refresh: asyncHandler(async (req: Request, res: Response) => {
    const token = req.cookies?.[REFRESH_COOKIE] as string | undefined;
    if (!token) {
      res.status(401).json({ success: false, message: 'No active session' });
      return;
    }
    const { user, accessToken, refreshToken } = await authService.refresh(
      token,
      ctxFrom(req)
    );
    setRefreshCookie(res, refreshToken);
    sendSuccess(res, { user, accessToken }, 'Session refreshed');
  }),

  logout: asyncHandler(async (req: Request, res: Response) => {
    const token = req.cookies?.[REFRESH_COOKIE] as string | undefined;
    await authService.logout(token);
    clearRefreshCookie(res);
    sendSuccess(res, null, 'Signed out');
  }),

  me: asyncHandler(async (req: Request, res: Response) => {
    const user = await authService.me(req.user!.id);
    sendSuccess(res, { user });
  }),

  forgotPassword: asyncHandler(async (req: Request, res: Response) => {
    await authService.forgotPassword(req.body.email);
    sendSuccess(
      res,
      null,
      'If an account exists for that email, a reset link is on its way.'
    );
  }),

  resetPassword: asyncHandler(async (req: Request, res: Response) => {
    await authService.resetPassword(req.body.token, req.body.password);
    sendSuccess(res, null, 'Password updated. You can now sign in.');
  }),

  verifyEmail: asyncHandler(async (req: Request, res: Response) => {
    await authService.verifyEmail(req.body.token);
    sendSuccess(res, null, 'Email verified successfully');
  }),
};
