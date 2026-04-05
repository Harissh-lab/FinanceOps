import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { EmptyState } from '../components/EmptyState';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Skeleton } from '../components/ui/skeleton';
import { useAuth } from '../context/AuthContext';
import { useRecords } from '../hooks/useRecords';
import type { RecordType } from '../types';

type HistoryFilters = {
  type: RecordType | '';
  category: string;
  search: string;
  page: number;
  limit: number;
};

type MonthlyHistory = {
  month: string;
  recordCount: number;
  income: number;
  expense: number;
  net: number;
};

type ReportSnapshot = {
  id: string;
  name: string;
  createdAt: string;
  filters: Pick<HistoryFilters, 'type' | 'category' | 'search' | 'limit'>;
};

const SNAPSHOT_STORAGE_KEY = 'financeops.report-snapshots.v1';

export default function ReportsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [snapshotName, setSnapshotName] = useState('');
  const [selectedSnapshotId, setSelectedSnapshotId] = useState('');
  const [snapshots, setSnapshots] = useState<ReportSnapshot[]>([]);
  const [filters, setFilters] = useState<HistoryFilters>({
    type: '',
    category: '',
    search: '',
    page: 1,
    limit: 50,
  });

  const reportsQuery = useRecords(filters);
  const records = reportsQuery.data?.data ?? [];
  const canCreate = user?.role === 'ADMIN' || user?.role === 'ANALYST';

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SNAPSHOT_STORAGE_KEY);
      if (!raw) {
        return;
      }
      const parsed = JSON.parse(raw) as ReportSnapshot[];
      if (Array.isArray(parsed)) {
        setSnapshots(parsed);
      }
    } catch {
      setSnapshots([]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(SNAPSHOT_STORAGE_KEY, JSON.stringify(snapshots));
  }, [snapshots]);

  const monthlyHistory = useMemo<MonthlyHistory[]>(() => {
    const byMonth = new Map<string, MonthlyHistory>();

    for (const record of records) {
      const date = new Date(record.date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthLabel = date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
      const amount = Number(record.amount);

      const existing = byMonth.get(key) ?? {
        month: monthLabel,
        recordCount: 0,
        income: 0,
        expense: 0,
        net: 0,
      };

      existing.recordCount += 1;
      if (record.type === 'INCOME') {
        existing.income += amount;
      } else {
        existing.expense += amount;
      }
      existing.net = existing.income - existing.expense;

      byMonth.set(key, existing);
    }

    return Array.from(byMonth.entries())
      .sort((a, b) => (a[0] < b[0] ? 1 : -1))
      .map(([, value]) => value);
  }, [records]);

  const totalPages = useMemo(() => {
    const total = reportsQuery.data?.meta?.total ?? 0;
    return Math.max(1, Math.ceil(total / filters.limit));
  }, [filters.limit, reportsQuery.data?.meta?.total]);

  const saveSnapshot = () => {
    const name = snapshotName.trim();
    if (!name) {
      toast.error('Enter a report snapshot name');
      return;
    }

    const snapshot: ReportSnapshot = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      name,
      createdAt: new Date().toISOString(),
      filters: {
        type: filters.type,
        category: filters.category,
        search: filters.search,
        limit: filters.limit,
      },
    };

    setSnapshots((prev) => [snapshot, ...prev]);
    setSelectedSnapshotId(snapshot.id);
    setSnapshotName('');
    toast.success('Report snapshot saved');
  };

  const applySnapshot = (id: string) => {
    setSelectedSnapshotId(id);
    if (!id) {
      return;
    }

    const snapshot = snapshots.find((item) => item.id === id);
    if (!snapshot) {
      return;
    }

    setFilters((prev) => ({
      ...prev,
      ...snapshot.filters,
      page: 1,
    }));
    toast.success(`Applied snapshot: ${snapshot.name}`);
  };

  const deleteSnapshot = () => {
    if (!selectedSnapshotId) {
      toast.error('Select a snapshot to delete');
      return;
    }

    setSnapshots((prev) => prev.filter((item) => item.id !== selectedSnapshotId));
    setSelectedSnapshotId('');
    toast.success('Snapshot deleted');
  };

  return (
    <div className="space-y-4">
      <Card className="space-y-3">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-display text-xl font-bold">Reports History</h2>
            <p className="text-sm text-muted-foreground">
              Monthly finance report history from all active records.
            </p>
          </div>
          {canCreate && (
            <Button onClick={() => navigate('/records?new=1')}>Create New Finance Report</Button>
          )}
        </div>

        <div className="grid gap-2 md:grid-cols-4">
          <select
            className="h-10 rounded-xl border border-border bg-background px-3 text-sm"
            value={filters.type}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, type: e.target.value as RecordType | '', page: 1 }))
            }
          >
            <option value="">All Types</option>
            <option value="INCOME">Income</option>
            <option value="EXPENSE">Expense</option>
          </select>
          <Input
            placeholder="Category"
            value={filters.category}
            onChange={(e) => setFilters((prev) => ({ ...prev, category: e.target.value, page: 1 }))}
          />
          <Input
            placeholder="Search notes/category"
            value={filters.search}
            onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value, page: 1 }))}
          />
          <Button variant="secondary" onClick={() => navigate('/records')}>
            Open Records Manager
          </Button>
        </div>

        <div className="grid gap-2 md:grid-cols-[1.2fr_1fr_auto_auto]">
          <Input
            placeholder="Snapshot name (example: Q2 Pattern Review)"
            value={snapshotName}
            onChange={(e) => setSnapshotName(e.target.value)}
          />
          <select
            className="h-10 rounded-xl border border-border bg-background px-3 text-sm"
            value={selectedSnapshotId}
            onChange={(e) => applySnapshot(e.target.value)}
          >
            <option value="">Select saved snapshot</option>
            {snapshots.map((snapshot) => (
              <option key={snapshot.id} value={snapshot.id}>
                {snapshot.name}
              </option>
            ))}
          </select>
          <Button variant="secondary" onClick={saveSnapshot}>
            Save Snapshot
          </Button>
          <Button variant="destructive" onClick={deleteSnapshot}>
            Delete Snapshot
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Snapshots save current report filters so admins can quickly switch report versions.
        </p>
      </Card>

      <Card>
        <p className="mb-3 text-sm font-semibold">Monthly Report History</p>
        {reportsQuery.isLoading ? (
          <Skeleton className="h-44" />
        ) : monthlyHistory.length === 0 ? (
          <EmptyState title="No Report History" description="Create or import records to build report history." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="py-2">Month</th>
                  <th>Records</th>
                  <th>Income</th>
                  <th>Expense</th>
                  <th>Net</th>
                </tr>
              </thead>
              <tbody>
                {monthlyHistory.map((item) => (
                  <tr key={item.month} className="border-b border-border/50">
                    <td className="py-2">{item.month}</td>
                    <td>{item.recordCount}</td>
                    <td className="text-emerald-600">${item.income.toLocaleString()}</td>
                    <td className="text-rose-600">${item.expense.toLocaleString()}</td>
                    <td className={item.net >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                      ${item.net.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card>
        <p className="mb-3 text-sm font-semibold">Report Data Records</p>
        {reportsQuery.isLoading ? (
          <Skeleton className="h-60" />
        ) : records.length === 0 ? (
          <EmptyState title="No Records Found" description="No active records match your filters." />
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
                {records.map((record) => (
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

        <div className="mt-4 flex items-center justify-between">
          <Button
            variant="secondary"
            onClick={() => setFilters((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
            disabled={filters.page <= 1}
          >
            Prev
          </Button>
          <p className="text-sm text-muted-foreground">
            Page {filters.page} of {totalPages}
          </p>
          <Button
            variant="secondary"
            onClick={() => setFilters((prev) => ({ ...prev, page: Math.min(totalPages, prev.page + 1) }))}
            disabled={filters.page >= totalPages}
          >
            Next
          </Button>
        </div>
      </Card>
    </div>
  );
}
