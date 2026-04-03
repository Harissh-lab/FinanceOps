import type { NextFunction, Request, Response } from 'express';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import { ApiError } from '../utils/apiError';
import { sendError } from '../utils/response';

export function notFoundHandler(_req: Request, res: Response): void {
  sendError(res, 404, 'NOT_FOUND', 'Resource not found');
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof ApiError) {
    sendError(res, err.statusCode, err.code, err.message, err.details);
    return;
  }

  if (err instanceof ZodError) {
    sendError(res, 400, 'VALIDATION_ERROR', 'Request validation failed', err.issues);
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
    sendError(res, 409, 'CONFLICT', 'A record with this unique value already exists');
    return;
  }

  if (err instanceof JsonWebTokenError || err instanceof TokenExpiredError) {
    sendError(res, 401, 'UNAUTHORIZED', 'Invalid or expired authentication token');
    return;
  }

  sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'An unexpected error occurred');
}
