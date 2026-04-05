import type { NextFunction, Request, Response } from 'express';
import type { ZodSchema } from 'zod';
import { ApiError } from '../utils/apiError';

type ValidationSchemas = {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
};

export function validateRequest(schemas: ValidationSchemas) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const entries: Array<keyof ValidationSchemas> = ['body', 'query', 'params'];

    const validated = { ...(req.validated ?? {}) } as NonNullable<Request['validated']>;

    for (const key of entries) {
      const schema = schemas[key];
      if (!schema) {
        continue;
      }

      const result = schema.safeParse(req[key]);
      if (!result.success) {
        throw new ApiError(400, 'VALIDATION_ERROR', 'Request validation failed', result.error.issues);
      }

      validated[key] = result.data;

      if (key === 'query') {
        continue;
      }

      try {
        (req as any)[key] = result.data;
      } catch {
        // Some request properties can be read-only depending on runtime/framework internals.
      }
    }

    req.validated = validated;

    next();
  };
}
