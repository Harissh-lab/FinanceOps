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
import { EmptyState } from '../components/EmptyState';
import { Card } from '../components/ui/card';
import { Skeleton } from '../components/ui/skeleton';
import { useCategories, useRecent, useSummary, useTrends } from '../hooks/useDashboard';

const COLORS = ['#2d6a4f', '#f77f00', '#1d3557', '#457b9d', '#e76f51', '#8ac926'];

export default function DashboardPage() {
  const summary = useSummary();
  const trends = useTrends();
  const categories = useCategories();
  const recent = useRecent();

  if (summary.isLoading || trends.isLoading || categories.isLoading || recent.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-28" />
        <Skeleton className="h-72" />
      </div>
    );
  }

  const statCards = [
    { label: 'Total Income', value: `$${summary.data?.totalIncome.toLocaleString() ?? '0'}` },
    { label: 'Total Expenses', value: `$${summary.data?.totalExpenses.toLocaleString() ?? '0'}` },
    { label: 'Net Balance', value: `$${summary.data?.netBalance.toLocaleString() ?? '0'}` },
    { label: 'Total Records', value: `${summary.data?.recordCount ?? 0}` },
  ];

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
            <p className="mt-2 font-display text-2xl font-bold">{stat.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
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

        <Card>
          <p className="mb-3 font-semibold">Category Breakdown</p>
          {(categories.data?.length ?? 0) === 0 ? (
            <EmptyState title="No Category Data" description="Create records to see category distribution." />
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categories.data}
                    dataKey="total"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {(categories.data ?? []).map((entry, index) => (
                      <Cell key={entry.category} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
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
                    <td>{record.type}</td>
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
