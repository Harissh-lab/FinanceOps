import bcrypt from 'bcryptjs';
import type { Request, Response } from 'express';
import { prisma } from '../../config/prisma';
import { ApiError } from '../../utils/apiError';
import { getPagination } from '../../utils/pagination';
import { sendSuccess } from '../../utils/response';

export async function createUser(req: Request, res: Response): Promise<void> {
  const { name, email, password, role, status } = req.body as {
    name: string;
    email: string;
    password: string;
    role: 'VIEWER' | 'ANALYST' | 'ADMIN';
    status: 'ACTIVE' | 'INACTIVE';
  };

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new ApiError(409, 'CONFLICT', 'Email is already registered');
  }

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: await bcrypt.hash(password, 10),
      role,
      status,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  sendSuccess(res, user, 201);
}

export async function listUsers(req: Request, res: Response): Promise<void> {
  const { page, limit, search } = req.query as unknown as {
    page: number;
    limit: number;
    search?: string;
  };
  const { skip, take } = getPagination(page, limit);

  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { email: { contains: search, mode: 'insensitive' as const } },
        ],
      }
    : {};

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.user.count({ where }),
  ]);

  sendSuccess(res, users, 200, { page, limit, total });
}

export async function getUserById(req: Request, res: Response): Promise<void> {
  const { id } = req.params as { id: string };

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new ApiError(404, 'NOT_FOUND', 'User not found');
  }

  sendSuccess(res, user);
}

export async function updateUser(req: Request, res: Response): Promise<void> {
  const { id } = req.params as { id: string };

  const exists = await prisma.user.findUnique({ where: { id } });
  if (!exists) {
    throw new ApiError(404, 'NOT_FOUND', 'User not found');
  }

  const user = await prisma.user.update({
    where: { id },
    data: req.body,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  sendSuccess(res, user);
}

export async function deleteUser(req: Request, res: Response): Promise<void> {
  const { id } = req.params as { id: string };

  const exists = await prisma.user.findUnique({ where: { id } });
  if (!exists) {
    throw new ApiError(404, 'NOT_FOUND', 'User not found');
  }

  await prisma.user.delete({ where: { id } });
  sendSuccess(res, { message: 'User deleted successfully' });
}
