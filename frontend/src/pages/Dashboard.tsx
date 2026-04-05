import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { EmptyState } from '../components/EmptyState';
import { Badge } from '../components/ui/badge';
import { Card } from '../components/ui/card';
import { Skeleton } from '../components/ui/skeleton';
import { useCategories, useRecent, useSummary, useTrends } from '../hooks/useDashboard';
import type { ApiSuccess } from '../types';

const COLORS = ['#2d6a4f', '#f77f00', '#1d3557', '#457b9d', '#e76f51', '#8ac926'];

type HealthScore = {
  score: number;
  label: 'Poor' | 'Fair' | 'Good' | 'Excellent';
  savingsRate: number;
  expenseRatio: number;
  recordCount: number;
  insights: string[];
};

function formatMoney(value: number) {
  return `$${value.toLocaleString()}`;
}

function getGreetingForHour(hour: number): string {
  if (hour < 12) {
    return 'Good morning';
  }
  if (hour < 18) {
    return 'Good afternoon';
  }
  return 'Good evening';
}

export default function DashboardPage() {
  const { user } = useAuth();
  const summary = useSummary();
  const trends = useTrends();
  const categories = useCategories();
  const recent = useRecent();
  const healthScore = useQuery({
    queryKey: ['health-score'],
    queryFn: async () => {
      const response = await api.get<ApiSuccess<HealthScore>>('/dashboard/health-score');
      return response.data.data;
    },
  });

  if (
    summary.isLoading ||
    trends.isLoading ||
    categories.isLoading ||
    recent.isLoading ||
    healthScore.isLoading
  ) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-20" />
        <Skeleton className="h-28" />
        <Skeleton className="h-72" />
      </div>
    );
  }

  const now = new Date();
  const greeting = getGreetingForHour(now.getHours());
  const todayText = now.toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const summarySavingsRate =
    (summary.data?.totalIncome ?? 0) > 0
      ? (((summary.data?.totalIncome ?? 0) - (summary.data?.totalExpenses ?? 0)) / (summary.data?.totalIncome ?? 1)) * 100
      : 0;
  const trendLabel = summary.data?.trendWindow?.label ?? 'last 30 days vs prior 30 days';

  const statCards = [
    {
      label: 'Total Income',
      value: formatMoney(summary.data?.totalIncome ?? 0),
      change: summary.data?.trendWindow?.incomeChangePct ?? 0,
    },
    {
      label: 'Total Expenses',
      value: formatMoney(summary.data?.totalExpenses ?? 0),
      change: summary.data?.trendWindow?.expenseChangePct ?? 0,
    },
    {
      label: 'Net Balance',
      value: formatMoney(summary.data?.netBalance ?? 0),
      change: summary.data?.trendWindow?.netBalanceChangePct ?? 0,
    },
    {
      label: 'Savings Rate',
      value: `${summarySavingsRate.toFixed(1)}%`,
      change: summary.data?.trendWindow?.savingsRateChangePct ?? 0,
    },
  ];

  return (
    <div className="space-y-4">
      <Card>
        <p className="font-display text-2xl font-bold">
          {greeting}, {user?.name ?? 'there'}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">{todayText}</p>
      </Card>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
            <p className="mt-2 font-display text-2xl font-bold">{stat.value}</p>
            <p
              className={`mt-2 text-xs font-medium ${
                stat.change >= 0 ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {stat.change >= 0 ? '↑' : '↓'} {Math.abs(stat.change).toFixed(1)}% {trendLabel}
            </p>
          </Card>
        ))}
      </div>

      <Card>
        <p className="mb-3 font-semibold">Income vs Expense Trend (6 Months)</p>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trends.data ?? []}>
              <defs>
                <linearGradient id="incomeFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2d6a4f" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#2d6a4f" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="expenseFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#e63946" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#e63946" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="income" stroke="#2d6a4f" fill="url(#incomeFill)" />
              <Area type="monotone" dataKey="expense" stroke="#e63946" fill="url(#expenseFill)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <p className="mb-3 font-semibold">Category Breakdown</p>
          {(categories.data?.length ?? 0) === 0 ? (
            <EmptyState title="No Category Data" description="Create records to see category distribution." />
          ) : (
            <div className="space-y-4">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={categories.data} dataKey="total" nameKey="category" cx="50%" cy="50%" outerRadius={90}>
                      {(categories.data ?? []).map((entry, index) => (
                        <Cell key={entry.category} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatMoney(Number(value))} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="grid gap-2 text-sm">
                {(categories.data ?? []).map((category, index) => (
                  <div key={category.category} className="flex items-center justify-between rounded-md border border-border/60 px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span
                        aria-hidden
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span>{category.category}</span>
                    </div>
                    <span className="font-semibold">{formatMoney(category.total)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>

        <Card>
          <p className="mb-3 font-semibold">Financial Health Score</p>
          <div className="space-y-4">
            <div className="flex items-end justify-between">
              <p className="font-display text-5xl font-bold">{healthScore.data?.score ?? 0}</p>
              <Badge className="bg-slate-200 text-slate-800">{healthScore.data?.label ?? 'Poor'}</Badge>
            </div>

            <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-emerald-600 transition-all duration-500"
                style={{ width: `${Math.max(0, Math.min(100, healthScore.data?.score ?? 0))}%` }}
              />
            </div>

            <div className="grid gap-2 text-sm text-muted-foreground">
              {(healthScore.data?.insights ?? []).slice(0, 4).map((insight) => (
                <p key={insight}>• {insight}</p>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <p className="mb-3 font-semibold">Recent Transactions</p>
        {(recent.data?.length ?? 0) === 0 ? (
          <EmptyState title="No Transactions Yet" description="Recent transactions appear here." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="py-2">Date</th>
                  <th>Type</th>
                  <th>Category</th>
                  <th>Amount</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {(recent.data ?? []).map((record) => (
                  <tr key={record.id} className="border-b border-border/50">
                    <td className="py-2">{new Date(record.date).toLocaleDateString()}</td>
                    <td>
                      <Badge className={record.type === 'INCOME' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}>
                        {record.type}
                      </Badge>
                    </td>
                    <td>{record.category}</td>
                    <td>${Number(record.amount).toLocaleString()}</td>
                    <td>{record.notes ?? '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card>
        <p className="mb-3 font-semibold">Category Income vs Expense (Tabular)</p>
        {(categories.data?.length ?? 0) === 0 ? (
          <EmptyState
            title="No Category Comparison Yet"
            description="Import or add transactions to see category-level financial flow."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="py-2">Category</th>
                  <th>Income</th>
                  <th>Expense</th>
                  <th>Total Flow</th>
                </tr>
              </thead>
              <tbody>
                {(categories.data ?? []).map((category) => (
                  <tr key={category.category} className="border-b border-border/50">
                    <td className="py-2">{category.category}</td>
                    <td className="text-emerald-600">${category.income.toLocaleString()}</td>
                    <td className="text-rose-600">${category.expense.toLocaleString()}</td>
                    <td>${category.total.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
