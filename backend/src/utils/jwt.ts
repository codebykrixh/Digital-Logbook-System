import jwt, { SignOptions } from 'jsonwebtoken';
import type { UserRole } from '@prisma/client';
import { env } from '../config/env';

export interface AccessTokenPayload {
  sub: string; // user id
  email: string;
  role: UserRole;
}

export interface RefreshTokenPayload {
  sub: string;
  tokenId: string; // RefreshToken row id, for rotation/revocation
}

export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES,
  } as SignOptions);
}

export function signRefreshToken(payload: RefreshTokenPayload): string {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES,
  } as SignOptions);
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshTokenPayload;
}
