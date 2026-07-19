import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import { MulterError } from 'multer';
import { ApiError } from '../utils/ApiError';
import { logger } from '../config/logger';
import { isProd } from '../config/env';

/** Convert any thrown error into a consistent JSON error envelope. */
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
) {
  let statusCode = 500;
  let message = 'Internal server error';
  let details: unknown;

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    details = err.details;
  } else if (err instanceof ZodError) {
    statusCode = 422;
    message = 'Validation failed';
    details = err.flatten().fieldErrors;
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      statusCode = 409;
      const target = (err.meta?.target as string[] | undefined)?.join(', ');
      message = `A record with this ${target ?? 'value'} already exists`;
    } else if (err.code === 'P2025') {
      statusCode = 404;
      message = 'Record not found';
    } else {
      statusCode = 400;
      message = 'Database request error';
    }
  } else if (err instanceof Error && err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  } else if (err instanceof Error && err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  } else if (err instanceof MulterError) {
    statusCode = 400;
    message =
      err.code === 'LIMIT_FILE_SIZE'
        ? 'File is too large'
        : `Upload error: ${err.message}`;
  }

  if (statusCode >= 500) {
    logger.error(err instanceof Error ? err.stack || err.message : String(err));
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(details ? { errors: details } : {}),
    ...(!isProd && err instanceof Error ? { stack: err.stack } : {}),
  });
}
