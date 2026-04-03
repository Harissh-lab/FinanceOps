import { Role } from '@prisma/client';
import type { NextFunction, Request, Response } from 'express';
import { ApiError } from '../utils/apiError';

export function requireRole(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new ApiError(401, 'UNAUTHORIZED', 'Authentication required');
    }

    if (!roles.includes(req.user.role)) {
      throw new ApiError(403, 'FORBIDDEN', 'You do not have permission to perform this action');
    }

    next();
  };
}
