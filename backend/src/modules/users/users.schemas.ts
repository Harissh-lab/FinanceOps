import { Role, Status } from '@prisma/client';
import { z } from 'zod';

export const createUserSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z
    .string()
    .min(8)
    .max(100)
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  role: z.nativeEnum(Role),
  status: z.nativeEnum(Status).default(Status.ACTIVE),
});

export const userListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
});

export const userIdParamSchema = z.object({
  id: z.string().uuid(),
});

export const updateUserSchema = z
  .object({
    role: z.nativeEnum(Role).optional(),
    status: z.nativeEnum(Status).optional(),
  })
  .refine((data) => data.role || data.status, {
    message: 'At least one field (role or status) must be provided',
  });
