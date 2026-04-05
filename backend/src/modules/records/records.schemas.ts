import { RecordType } from '@prisma/client';
import { z } from 'zod';

export const recordIdParamSchema = z.object({
  id: z.string().uuid(),
});

export const createRecordSchema = z.object({
  amount: z.number().positive('Amount must be a positive number'),
  type: z.nativeEnum(RecordType),
  category: z.string().min(2).max(100),
  date: z.coerce.date(),
  notes: z.string().max(500).optional(),
});

export const updateRecordSchema = createRecordSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  'At least one field is required',
);

export const recordListQuerySchema = z.object({
  type: z.nativeEnum(RecordType).optional(),
  category: z.string().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
});

export const importOptionsSchema = z.object({
  allowReplaceExisting: z
    .union([z.boolean(), z.enum(['true', 'false'])])
    .optional()
    .transform((value) => {
      if (value === undefined) {
        return false;
      }
      if (typeof value === 'boolean') {
        return value;
      }
      return value === 'true';
    }),
});
