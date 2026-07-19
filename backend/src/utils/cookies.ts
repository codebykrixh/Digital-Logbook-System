import { Response } from 'express';
import { env, isProd } from '../config/env';
import { parseDurationMs } from './time';

export const REFRESH_COOKIE = 'digilog_rt';

export function setRefreshCookie(res: Response, token: string) {
  res.cookie(REFRESH_COOKIE, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    domain: env.COOKIE_DOMAIN,
    maxAge: parseDurationMs(env.JWT_REFRESH_EXPIRES),
    path: '/api/auth',
  });
}

export function clearRefreshCookie(res: Response) {
  res.clearCookie(REFRESH_COOKIE, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    domain: env.COOKIE_DOMAIN,
    path: '/api/auth',
  });
}
