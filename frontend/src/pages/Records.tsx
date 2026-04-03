import { useMemo, useState } from 'react';
import type { AxiosError } from 'axios';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { toast } from 'sonner';
import { EmptyState } from '../components/EmptyState';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Skeleton } from '../components/ui/skeleton';
import { useAuth } from '../context/AuthContext';
import { useRecordMutations, useRecords } from '../hooks/useRecords';
import type { FinancialRecord, RecordType } from '../types';

type Filters = {
  type: RecordType | '';
  category: string;
  startDate: string;
  endDate: string;
  search: string;
  page: number;
  limit: number;
};

const initialForm = {
  amount: 0,
  type: 'EXPENSE' as RecordType,
  category: '',
  date: new Date().toISOString().slice(0, 10),
  notes: '',
};

export default function RecordsPage() {
  const { user } = useAuth();
  const [filters, setFilters] = useState<Filters>({
    type: '',
    category: '',
    startDate: '',
    endDate: '',
    search: '',
    page: 1,
    limit: 10,
  });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<FinancialRecord | null>(null);
  const [form, setForm] = useState(initialForm);
  const [importFile, setImportFile] = useState<File | null>(null);

  const recordsQuery = useRecords(filters);
  const { createMutation, updateMutation, deleteMutation, importMutation } = useRecordMutations();

  const canCreate = user?.role === 'ADMIN' || user?.role === 'ANALYST';
  const canEdit = user?.role === 'ADMIN';

  const totalPages = useMemo(() => {
    const total = recordsQuery.data?.meta?.total ?? 0;
    return Math.max(1, Math.ceil(total / filters.limit));
  }, [filters.limit, recordsQuery.data?.meta?.total]);

  const records = recordsQuery.data?.data ?? [];

  const flowSummary = useMemo(() => {
    const income = records
      .filter((record) => record.type === 'INCOME')
      .reduce((sum, record) => sum + Number(record.amount), 0);
    const expense = records
      .filter((record) => record.type === 'EXPENSE')
      .reduce((sum, record) => sum + Number(record.amount), 0);

    return {
      income,
      expense,
      chart: [
        { name: 'Income', value: income },
        { name: 'Expense', value: expense },
      ],
    };
  }, [records]);

  const openCreate = () => {
    setEditing(null);
    setForm(initialForm);
    setDrawerOpen(true);
  };

  const openEdit = (record: FinancialRecord) => {
    setEditing(record);
    setForm({
      amount: Number(record.amount),
      type: record.type,
      category: record.category,
      date: record.date.slice(0, 10),
      notes: record.notes ?? '',
    });
    setDrawerOpen(true);
  };

  const submitForm = async () => {
    try {
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.id, payload: { ...form } });
        toast.success('Record updated successfully');
      } else {
        await createMutation.mutateAsync({ ...form });
        toast.success('Record created successfully');
      }
      setDrawerOpen(false);
    } catch {
      toast.error('Action failed. Please check your permissions and input.');
    }
  };

  const removeRecord = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success('Record deleted');
    } catch {
      toast.error('Delete failed');
    }
  };

  const importFromFile = async () => {
    if (!importFile) {
      toast.error('Select an import file first');
      return;
    }

    try {
      const result = await importMutation.mutateAsync(importFile);
      toast.success(`Imported ${result.importedCount} records successfully`);
      setImportFile(null);
    } catch (error) {
      const err = error as AxiosError<{ error?: { message?: string } }>;
      const message =
        err.response?.data?.error?.message ??
        'Import failed. Ensure file columns are: amount,type,category,date,notes';
      toast.error(message);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="space-y-3">
        <div className="grid gap-2 md:grid-cols-5">
          <select
            className="h-10 rounded-xl border border-border bg-background px-3 text-sm"
            value={filters.type}
            onChange={(e) => setFilters((prev) => ({ ...prev, type: e.target.value as RecordType | '' }))}
          >
            <option value="">All Types</option>
            <option value="INCOME">Income</option>
            <option value="EXPENSE">Expense</option>
          </select>
          <Input
            placeholder="Category"
            value={filters.category}
            onChange={(e) => setFilters((prev) => ({ ...prev, category: e.target.value }))}
          />
          <Input
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters((prev) => ({ ...prev, startDate: e.target.value }))}
          />
          <Input
            type="date"
            value={filters.endDate}
            onChange={(e) => setFilters((prev) => ({ ...prev, endDate: e.target.value }))}
          />
          <Input
            placeholder="Search notes/category"
            value={filters.search}
            onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
          />
        </div>
        {canCreate && (
          <div className="flex flex-col gap-2 md:flex-row md:items-center">
            <Button onClick={openCreate} className="w-full md:w-auto">
              Add Record
            </Button>
            <Input
              type="file"
              accept=".xlsx,.xls,.csv,.json"
              className="md:w-[280px]"
              onChange={(e) => setImportFile(e.target.files?.[0] ?? null)}
            />
            <Button
              variant="secondary"
              className="w-full md:w-auto"
              onClick={importFromFile}
              disabled={!importFile || importMutation.isPending}
            >
              {importMutation.isPending ? 'Importing...' : 'Import File'}
            </Button>
          </div>
        )}
        <p className="text-xs text-muted-foreground">
          Import supports .xlsx, .xls, .csv, .json with columns: amount, type, category, date, notes. Each import replaces the currently active dataset.
        </p>
      </Card>

      <Card>
        <div className="mb-4 grid gap-4 lg:grid-cols-2">
          <div>
            <p className="text-sm font-semibold">Current View Summary</p>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              <div className="rounded-xl border border-border bg-muted/30 p-3">
                <p className="text-xs text-muted-foreground">Income</p>
                <p className="text-lg font-bold text-emerald-600">${flowSummary.income.toLocaleString()}</p>
              </div>
              <div className="rounded-xl border border-border bg-muted/30 p-3">
                <p className="text-xs text-muted-foreground">Expense</p>
                <p className="text-lg font-bold text-rose-600">${flowSummary.expense.toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="h-36">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={flowSummary.chart}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#1f7a8c" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {recordsQuery.isLoading ? (
          <Skeleton className="h-56" />
        ) : (recordsQuery.data?.data.length ?? 0) === 0 ? (
          <EmptyState title="No Records Found" description="Try adjusting filters or adding a new transaction." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="py-2">Date</th>
                  <th>Type</th>
                  <th>Category</th>
                  <th>Income</th>
                  <th>Expense</th>
                  <th>Notes</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {(recordsQuery.data?.data ?? []).map((record) => (
                  <tr key={record.id} className="border-b border-border/50">
                    <td className="py-2">{new Date(record.date).toLocaleDateString()}</td>
                    <td>{record.type}</td>
                    <td>{record.category}</td>
                    <td>{record.type === 'INCOME' ? `$${Number(record.amount).toLocaleString()}` : '-'}</td>
                    <td>{record.type === 'EXPENSE' ? `$${Number(record.amount).toLocaleString()}` : '-'}</td>
                    <td>{record.notes ?? '-'}</td>
                    <td className="space-x-2">
                      {canEdit && (
                        <>
                          <Button variant="secondary" size="sm" onClick={() => openEdit(record)}>
                            Edit
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => removeRecord(record.id)}>
                            Delete
                          </Button>
                        </>
                      )}
                    </td>
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

      <div
        className={`fixed inset-y-0 right-0 z-30 w-full max-w-md border-l border-border bg-card p-5 shadow-panel transition-transform duration-300 ${
          drawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <h3 className="font-display text-xl font-bold">{editing ? 'Edit Record' : 'Add Record'}</h3>
        <div className="mt-4 space-y-3">
          <Input
            type="number"
            placeholder="Amount"
            value={form.amount}
            onChange={(e) => setForm((prev) => ({ ...prev, amount: Number(e.target.value) }))}
          />
          <select
            className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm"
            value={form.type}
            onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value as RecordType }))}
          >
            <option value="INCOME">Income</option>
            <option value="EXPENSE">Expense</option>
          </select>
          <Input
            placeholder="Category"
            value={form.category}
            onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
          />
          <Input
            type="date"
            value={form.date}
            onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
          />
          <Input
            placeholder="Notes"
            value={form.notes}
            onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
          />

          <div className="flex gap-2 pt-2">
            <Button onClick={submitForm}>Save</Button>
            <Button variant="secondary" onClick={() => setDrawerOpen(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
