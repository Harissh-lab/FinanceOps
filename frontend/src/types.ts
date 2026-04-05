export type Role = 'VIEWER' | 'ANALYST' | 'ADMIN';
export type Status = 'ACTIVE' | 'INACTIVE';
export type RecordType = 'INCOME' | 'EXPENSE';

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: Status;
};

export type ApiSuccess<T> = {
  success: true;
  data: T;
  meta?: {
    page: number;
    total: number;
    limit: number;
  };
};

export type FinancialRecord = {
  id: string;
  amount: number;
  type: RecordType;
  category: string;
  date: string;
  notes?: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  creator?: User;
};

export type Summary = {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  recordCount: number;
  trendWindow?: {
    label: string;
    incomeChangePct: number;
    expenseChangePct: number;
    netBalanceChangePct: number;
    savingsRateChangePct: number;
  };
};

export type TrendPoint = {
  month: string;
  income: number;
  expense: number;
};

export type CategoryPoint = {
  category: string;
  income: number;
  expense: number;
  total: number;
};
