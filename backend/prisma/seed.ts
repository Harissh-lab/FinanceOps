import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaClient, Role, Status } from '@prisma/client';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  await prisma.passwordResetToken.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.financialRecord.deleteMany();
  await prisma.user.deleteMany();

  await Promise.all([
    prisma.user.create({
      data: {
        name: 'Admin User',
        email: 'admin@finance.com',
        password: await bcrypt.hash('Admin@123', 10),
        role: Role.ADMIN,
        status: Status.ACTIVE,
      },
    }),
    prisma.user.create({
      data: {
        name: 'Analyst User',
        email: 'analyst@finance.com',
        password: await bcrypt.hash('Analyst@123', 10),
        role: Role.ANALYST,
        status: Status.ACTIVE,
      },
    }),
    prisma.user.create({
      data: {
        name: 'Viewer User',
        email: 'viewer@finance.com',
        password: await bcrypt.hash('Viewer@123', 10),
        role: Role.VIEWER,
        status: Status.ACTIVE,
      },
    }),
  ]);

  // eslint-disable-next-line no-console
  console.log('Seed completed successfully (users only, no default financial records)');
}

main()
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
