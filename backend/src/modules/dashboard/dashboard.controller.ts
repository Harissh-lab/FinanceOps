import { RecordType } from '@prisma/client';
import type { Request, Response } from 'express';
import { prisma } from '../../config/prisma';
import { lastNMonths, monthLabel } from '../../utils/date';
import { sendSuccess } from '../../utils/response';

export async function getSummary(_req: Request, res: Response): Promise<void> {
  const now = new Date();
  const currentWindowStart = new Date(now);
  currentWindowStart.setDate(currentWindowStart.getDate() - 30);

  const priorWindowStart = new Date(currentWindowStart);
  priorWindowStart.setDate(priorWindowStart.getDate() - 30);

  const [incomeAgg, expenseAgg, recordCount, currentIncomeAgg, currentExpenseAgg, priorIncomeAgg, priorExpenseAgg] = await Promise.all([
    prisma.financialRecord.aggregate({
      where: { isDeleted: false, type: RecordType.INCOME },
      _sum: { amount: true },
    }),
    prisma.financialRecord.aggregate({
      where: { isDeleted: false, type: RecordType.EXPENSE },
      _sum: { amount: true },
    }),
    prisma.financialRecord.count({ where: { isDeleted: false } }),
    prisma.financialRecord.aggregate({
      where: {
        isDeleted: false,
        type: RecordType.INCOME,
        date: {
          gte: currentWindowStart,
          lte: now,
        },
      },
      _sum: { amount: true },
    }),
    prisma.financialRecord.aggregate({
      where: {
        isDeleted: false,
        type: RecordType.EXPENSE,
        date: {
          gte: currentWindowStart,
          lte: now,
        },
      },
      _sum: { amount: true },
    }),
    prisma.financialRecord.aggregate({
      where: {
        isDeleted: false,
        type: RecordType.INCOME,
        date: {
          gte: priorWindowStart,
          lt: currentWindowStart,
        },
      },
      _sum: { amount: true },
    }),
    prisma.financialRecord.aggregate({
      where: {
        isDeleted: false,
        type: RecordType.EXPENSE,
        date: {
          gte: priorWindowStart,
          lt: currentWindowStart,
        },
      },
      _sum: { amount: true },
    }),
  ]);

  const totalIncome = Number(incomeAgg._sum.amount ?? 0);
  const totalExpenses = Number(expenseAgg._sum.amount ?? 0);
  const currentIncome = Number(currentIncomeAgg._sum.amount ?? 0);
  const currentExpenses = Number(currentExpenseAgg._sum.amount ?? 0);
  const priorIncome = Number(priorIncomeAgg._sum.amount ?? 0);
  const priorExpenses = Number(priorExpenseAgg._sum.amount ?? 0);

  const currentNet = currentIncome - currentExpenses;
  const priorNet = priorIncome - priorExpenses;

  const currentSavingsRate = currentIncome > 0 ? (currentNet / currentIncome) * 100 : 0;
  const priorSavingsRate = priorIncome > 0 ? (priorNet / priorIncome) * 100 : 0;

  const changePct = (currentValue: number, priorValue: number): number => {
    if (priorValue === 0) {
      return currentValue === 0 ? 0 : 100;
    }
    return ((currentValue - priorValue) / Math.abs(priorValue)) * 100;
  };

  sendSuccess(res, {
    totalIncome,
    totalExpenses,
    netBalance: totalIncome - totalExpenses,
    recordCount,
    trendWindow: {
      label: 'last 30 days vs prior 30 days',
      incomeChangePct: Number(changePct(currentIncome, priorIncome).toFixed(2)),
      expenseChangePct: Number(changePct(currentExpenses, priorExpenses).toFixed(2)),
      netBalanceChangePct: Number(changePct(currentNet, priorNet).toFixed(2)),
      savingsRateChangePct: Number(changePct(currentSavingsRate, priorSavingsRate).toFixed(2)),
    },
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

export async function getHealthScore(_req: Request, res: Response): Promise<void> {
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

  const income = Number(incomeAgg._sum.amount ?? 0);
  const expenses = Number(expenseAgg._sum.amount ?? 0);
  const savingsRate = income > 0 ? ((income - expenses) / income) * 100 : 0;
  const expenseRatio = income > 0 ? (expenses / income) * 100 : 100;

  const savingsComponent = Math.max(0, Math.min(55, savingsRate * 1.1));
  const expenseComponent = Math.max(0, Math.min(30, 30 - Math.max(0, expenseRatio - 60)));
  const recordComponent = Math.max(0, Math.min(15, recordCount >= 100 ? 15 : (recordCount / 100) * 15));
  const score = Math.round(Math.max(0, Math.min(100, savingsComponent + expenseComponent + recordComponent)));

  let label = 'Poor';
  if (score >= 80) {
    label = 'Excellent';
  } else if (score >= 65) {
    label = 'Good';
  } else if (score >= 45) {
    label = 'Fair';
  }

  const insights: string[] = [];
  insights.push(`Savings rate is ${savingsRate.toFixed(1)}% of income.`);
  insights.push(`Expenses consume ${expenseRatio.toFixed(1)}% of income.`);
  insights.push(`Score confidence uses ${recordCount} active records.`);
  insights.push(
    savingsRate >= 20
      ? 'Strong cushion: continue investing and keep fixed costs stable.'
      : 'Opportunity: reduce high-frequency expenses to improve monthly cushion.',
  );

  sendSuccess(res, {
    score,
    label,
    savingsRate: Number(savingsRate.toFixed(2)),
    expenseRatio: Number(expenseRatio.toFixed(2)),
    recordCount,
    insights,
  });
}
