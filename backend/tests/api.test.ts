import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import request from 'supertest';

jest.mock('../src/config/prisma', () => ({
  prisma: {
    $executeRaw: jest.fn(),
    $queryRaw: jest.fn(),
    $transaction: jest.fn(),
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      create: jest.fn(),
    },
    refreshToken: {
      create: jest.fn(),
      findUnique: jest.fn(),
      deleteMany: jest.fn(),
    },
    passwordResetToken: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    financialRecord: {
      create: jest.fn(),
      createMany: jest.fn(),
      updateMany: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
      aggregate: jest.fn(),
    },
  },
}));

import { prisma } from '../src/config/prisma';
import { app } from '../src/app';

const prismaMock = prisma as unknown as {
  user: {
    findUnique: jest.Mock;
    findMany: jest.Mock;
    count: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
    create: jest.Mock;
  };
  $executeRaw: jest.Mock;
  $queryRaw: jest.Mock;
  $transaction: jest.Mock;
  refreshToken: {
    create: jest.Mock;
    findUnique: jest.Mock;
    deleteMany: jest.Mock;
  };
  passwordResetToken: {
    create: jest.Mock;
    findUnique: jest.Mock;
    update: jest.Mock;
  };
  financialRecord: {
    create: jest.Mock;
    createMany: jest.Mock;
    updateMany: jest.Mock;
    findMany: jest.Mock;
    findFirst: jest.Mock;
    count: jest.Mock;
    update: jest.Mock;
    aggregate: jest.Mock;
  };
};

describe('Finance API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('POST /api/auth/login returns token for valid credentials', async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: 'u1',
      name: 'Admin User',
      email: 'admin@finance.com',
      password: await bcrypt.hash('Admin@123', 10),
      role: 'ADMIN',
      status: 'ACTIVE',
    });
    prismaMock.refreshToken.create.mockResolvedValue({ id: 'rt1' });

    const response = await request(app).post('/api/auth/login').send({
      email: 'admin@finance.com',
      password: 'Admin@123',
    });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.accessToken).toBeDefined();
    expect(response.body.data.refreshToken).toBeDefined();
    expect(response.body.data.user.email).toBe('admin@finance.com');
  });

  it('POST /api/auth/login returns 401 for wrong password', async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: 'u1',
      name: 'Admin User',
      email: 'admin@finance.com',
      password: await bcrypt.hash('Admin@123', 10),
      role: 'ADMIN',
      status: 'ACTIVE',
    });

    const response = await request(app).post('/api/auth/login').send({
      email: 'admin@finance.com',
      password: 'Wrong@123',
    });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('UNAUTHORIZED');
  });

  it('POST /api/records returns 403 for viewer role', async () => {
    const token = jwt.sign(
      { sub: 'viewer-1', email: 'viewer@finance.com', role: 'VIEWER' },
      process.env.JWT_ACCESS_SECRET as string,
    );

    const response = await request(app)
      .post('/api/records')
      .set('Authorization', `Bearer ${token}`)
      .send({
        amount: 120,
        type: 'EXPENSE',
        category: 'Food',
        date: new Date().toISOString(),
        notes: 'Lunch',
      });

    expect(response.status).toBe(403);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('FORBIDDEN');
  });

  it('GET /api/records returns 403 for viewer role', async () => {
    const token = jwt.sign(
      { sub: 'viewer-1', email: 'viewer@finance.com', role: 'VIEWER' },
      process.env.JWT_ACCESS_SECRET as string,
    );

    const response = await request(app).get('/api/records').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(403);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('FORBIDDEN');
  });

  it('POST /api/records creates record for admin role', async () => {
    const token = jwt.sign(
      { sub: 'admin-1', email: 'admin@finance.com', role: 'ADMIN' },
      process.env.JWT_ACCESS_SECRET as string,
    );

    prismaMock.financialRecord.create.mockResolvedValue({
      id: 'rec1',
      amount: 500,
      type: 'INCOME',
      category: 'Freelance',
      date: new Date().toISOString(),
      notes: 'Project payment',
      createdBy: 'admin-1',
      isDeleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const response = await request(app)
      .post('/api/records')
      .set('Authorization', `Bearer ${token}`)
      .send({
        amount: 500,
        type: 'INCOME',
        category: 'Freelance',
        date: new Date().toISOString(),
        notes: 'Project payment',
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.id).toBe('rec1');
  });

  it('GET /api/dashboard/summary returns totals', async () => {
    const token = jwt.sign(
      { sub: 'viewer-1', email: 'viewer@finance.com', role: 'VIEWER' },
      process.env.JWT_ACCESS_SECRET as string,
    );

    prismaMock.financialRecord.aggregate
      .mockResolvedValueOnce({ _sum: { amount: 10000 } })
      .mockResolvedValueOnce({ _sum: { amount: 3500 } });
    prismaMock.financialRecord.count.mockResolvedValue(42);

    const response = await request(app)
      .get('/api/dashboard/summary')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.totalIncome).toBe(10000);
    expect(response.body.data.totalExpenses).toBe(3500);
    expect(response.body.data.netBalance).toBe(6500);
    expect(response.body.data.recordCount).toBe(42);
  });

  it('GET /api/dashboard/summary returns 401 for invalid token', async () => {
    const response = await request(app)
      .get('/api/dashboard/summary')
      .set('Authorization', 'Bearer invalid.token.value');

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('UNAUTHORIZED');
  });

  it('POST /api/auth/forgot-password returns success for existing account', async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: 'u1',
      email: 'admin@finance.com',
    });
    prismaMock.$executeRaw.mockResolvedValue(1);

    const response = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'admin@finance.com' });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.message).toContain('If the account exists');
  });

  it('POST /api/records/import imports records for analyst role', async () => {
    const token = jwt.sign(
      { sub: 'analyst-1', email: 'analyst@finance.com', role: 'ANALYST' },
      process.env.JWT_ACCESS_SECRET as string,
    );

    prismaMock.$transaction.mockImplementation(async (actions: Array<Promise<unknown>>) => Promise.all(actions));
    prismaMock.financialRecord.updateMany.mockResolvedValue({ count: 2 });
    prismaMock.financialRecord.createMany.mockResolvedValue({ count: 1 });

    const payload = JSON.stringify([
      {
        amount: 1200,
        type: 'INCOME',
        category: 'Freelance',
        date: new Date().toISOString(),
        notes: 'Imported row',
      },
    ]);

    const response = await request(app)
      .post('/api/records/import')
      .set('Authorization', `Bearer ${token}`)
      .attach('file', Buffer.from(payload), 'records.json');

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.importedCount).toBe(1);
  });
});
