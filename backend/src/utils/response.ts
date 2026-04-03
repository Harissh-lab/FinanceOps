import type { Response } from 'express';

type Meta = {
  page?: number;
  total?: number;
  limit?: number;
};

export function sendSuccess<T>(res: Response, data: T, statusCode = 200, meta?: Meta): Response {
  return res.status(statusCode).json({
    success: true,
    data,
    ...(meta ? { meta } : {}),
  });
}

export function sendError(
  res: Response,
  statusCode: number,
  code: string,
  message: string,
  details?: unknown,
): Response {
  return res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      ...(details ? { details } : {}),
    },
  });
}
