import { RecordType } from '@prisma/client';
import type { Request, Response } from 'express';
import { prisma } from '../../config/prisma';
import { lastNMonths, monthLabel } from '../../utils/date';
import { sendSuccess } from '../../utils/response';

export async function getSummary(_req: Request, res: Response): Promise<void> {
  const [incomeAgg, expenseAgg, recordCount] = await Promise.all([
    prisma.financialRecord.aggregate({
      where: { isDeleted: false, type: RecordType.INCOME },
      _sum: { amount: true },
    }),
    prisma.financialRecord.aggregate({
      where: { isDeleted: false, type: RecordType.EXPENSE },
      _sum: { amount: true },
    }),
    prisma.financialRecord.count({ where: { isDeleted: false } }),
  ]);

  const totalIncome = Number(incomeAgg._sum.amount ?? 0);
  const totalExpenses = Number(expenseAgg._sum.amount ?? 0);

  sendSuccess(res, {
    totalIncome,
    totalExpenses,
    netBalance: totalIncome - totalExpenses,
    recordCount,
  });
}

export async function getTrends(_req: Request, res: Response): Promise<void> {
  const start = new Date();
  start.setMonth(start.getMonth() - 5);
  start.setDate(1);

  const records = await prisma.financialRecord.findMany({
    where: {
      isDeleted: false,
      date: { gte: start },
    },
    select: {
      date: true,
      type: true,
      amount: true,
    },
    orderBy: { date: 'asc' },
  });

  const labels = lastNMonths(6);
  const map = new Map(labels.map((label) => [label, { month: label, income: 0, expense: 0 }]));

  for (const record of records) {
    const label = monthLabel(record.date);
    const slot = map.get(label);
    if (!slot) {
      continue;
    }

    if (record.type === RecordType.INCOME) {
      slot.income += Number(record.amount);
    } else {
      slot.expense += Number(record.amount);
    }
  }

  sendSuccess(res, Array.from(map.values()));
}

export async function getCategoryBreakdown(_req: Request, res: Response): Promise<void> {
  const records = await prisma.financialRecord.findMany({
    where: { isDeleted: false },
    select: {
      category: true,
      type: true,
      amount: true,
    },
  });

  const grouped = new Map<string, { category: string; income: number; expense: number; total: number }>();

  for (const record of records) {
    const existing = grouped.get(record.category) ?? {
      category: record.category,
      income: 0,
      expense: 0,
      total: 0,
    };

    const amount = Number(record.amount);
    if (record.type === RecordType.INCOME) {
      existing.income += amount;
    } else {
      existing.expense += amount;
    }
    existing.total += amount;

    grouped.set(record.category, existing);
  }

  sendSuccess(res, Array.from(grouped.values()));
}

export async function getRecentTransactions(_req: Request, res: Response): Promise<void> {
  const records = await prisma.financialRecord.findMany({
    where: { isDeleted: false },
    orderBy: { date: 'desc' },
    take: 10,
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  });

  sendSuccess(res, records);
}
