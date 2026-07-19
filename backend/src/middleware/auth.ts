import { Request, Response, NextFunction } from 'express';
import type { UserRole } from '@prisma/client';
import { verifyAccessToken } from '../utils/jwt';
import { ApiError } from '../utils/ApiError';

/** Extract a bearer token from the Authorization header. */
function getBearer(req: Request): string | null {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) return header.slice(7);
  return null;
}

/** Require a valid access token; attaches `req.user`. */
export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const token = getBearer(req);
  if (!token) return next(ApiError.unauthorized('Authentication required'));

  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub, email: payload.email, role: payload.role };
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * Restrict a route to one or more roles. ADMIN always passes.
 * Usage: `router.post('/', authenticate, authorize('MANAGER', 'ADMIN'), handler)`
 */
export function authorize(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(ApiError.unauthorized());
    if (req.user.role === 'ADMIN') return next();
    if (!roles.includes(req.user.role)) {
      return next(
        ApiError.forbidden('You do not have permission to perform this action')
      );
    }
    next();
  };
}
