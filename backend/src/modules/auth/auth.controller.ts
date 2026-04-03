import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import type { Request, Response } from 'express';
import { Prisma, Role, Status } from '@prisma/client';
import { env } from '../../config/env';
import { prisma } from '../../config/prisma';
import { ApiError } from '../../utils/apiError';
import { sendSuccess } from '../../utils/response';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../utils/jwt';

function setRefreshCookie(res: Response, refreshToken: string): void {
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: env.REFRESH_TOKEN_EXPIRES_IN_DAYS * 24 * 60 * 60 * 1000,
  });
}

export async function register(req: Request, res: Response): Promise<void> {
  const { name, email, password } = req.body;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new ApiError(409, 'CONFLICT', 'Email is already registered');
  }

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: await bcrypt.hash(password, 10),
      role: Role.VIEWER,
      status: Status.ACTIVE,
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

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new ApiError(401, 'UNAUTHORIZED', 'Invalid email or password');
  }

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    throw new ApiError(401, 'UNAUTHORIZED', 'Invalid email or password');
  }

  if (user.status !== Status.ACTIVE) {
    throw new ApiError(403, 'FORBIDDEN', 'User account is inactive');
  }

  const payload = { sub: user.id, email: user.email, role: user.role };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + env.REFRESH_TOKEN_EXPIRES_IN_DAYS * 24 * 60 * 60 * 1000),
    },
  });

  setRefreshCookie(res, refreshToken);

  sendSuccess(res, {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    },
  });
}

export async function refreshToken(req: Request, res: Response): Promise<void> {
  const tokenFromCookie = req.cookies?.refreshToken as string | undefined;
  const tokenFromBody = req.body?.refreshToken as string | undefined;
  const refreshToken = tokenFromCookie ?? tokenFromBody;

  if (!refreshToken) {
    throw new ApiError(401, 'UNAUTHORIZED', 'Refresh token is required');
  }

  const payload = verifyRefreshToken(refreshToken);

  const savedToken = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
  if (!savedToken || savedToken.expiresAt < new Date()) {
    throw new ApiError(401, 'UNAUTHORIZED', 'Invalid refresh token');
  }

  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user || user.status !== Status.ACTIVE) {
    throw new ApiError(401, 'UNAUTHORIZED', 'User is not active');
  }

  const accessToken = signAccessToken({ sub: user.id, email: user.email, role: user.role });

  sendSuccess(res, { accessToken });
}

export async function logout(req: Request, res: Response): Promise<void> {
  const tokenFromCookie = req.cookies?.refreshToken as string | undefined;
  const tokenFromBody = req.body?.refreshToken as string | undefined;
  const refreshToken = tokenFromCookie ?? tokenFromBody;

  if (refreshToken) {
    await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
  }

  res.clearCookie('refreshToken');
  sendSuccess(res, { message: 'Logged out successfully' });
}

export async function forgotPassword(req: Request, res: Response): Promise<void> {
  const { email } = req.body as { email: string };

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    // Never reveal if an account exists.
    sendSuccess(res, {
      message: 'If the account exists, a reset link has been generated.',
    });
    return;
  }

  const rawToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
  const resetId = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

  await prisma.$executeRaw(
    Prisma.sql`
      INSERT INTO "PasswordResetToken" ("id", "userId", "token", "expiresAt", "createdAt")
      VALUES (${resetId}, ${user.id}, ${hashedToken}, ${expiresAt}, ${new Date()})
    `,
  );

  sendSuccess(res, {
    message: 'If the account exists, a reset link has been generated.',
    // For local assessment flow, return token in non-production for easy testing.
    ...(env.NODE_ENV !== 'production' ? { resetToken: rawToken } : {}),
  });
}

export async function resetPassword(req: Request, res: Response): Promise<void> {
  const { token, newPassword } = req.body as { token: string; newPassword: string };

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  const rows = await prisma.$queryRaw<
    Array<{ id: string; userId: string; token: string; expiresAt: Date; usedAt: Date | null }>
  >(
    Prisma.sql`
      SELECT "id", "userId", "token", "expiresAt", "usedAt"
      FROM "PasswordResetToken"
      WHERE "token" = ${hashedToken}
      LIMIT 1
    `,
  );
  const savedToken = rows[0];

  if (!savedToken || savedToken.usedAt || savedToken.expiresAt < new Date()) {
    throw new ApiError(400, 'INVALID_RESET_TOKEN', 'Reset token is invalid or expired');
  }

  await prisma.user.update({
    where: { id: savedToken.userId },
    data: {
      password: await bcrypt.hash(newPassword, 10),
    },
  });

  await prisma.$executeRaw(
    Prisma.sql`
      UPDATE "PasswordResetToken"
      SET "usedAt" = ${new Date()}
      WHERE "id" = ${savedToken.id}
    `,
  );

  sendSuccess(res, { message: 'Password has been reset successfully' });
}
