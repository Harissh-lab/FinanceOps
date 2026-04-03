import type { NextFunction, Request, Response } from 'express';
import { ApiError } from '../utils/apiError';
import { verifyAccessToken } from '../utils/jwt';

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new ApiError(401, 'UNAUTHORIZED', 'Authentication token is missing');
  }

  const token = authHeader.split(' ')[1];
  const payload = verifyAccessToken(token);

  req.user = {
    id: payload.sub,
    email: payload.email,
    role: payload.role,
  };

  next();
}
