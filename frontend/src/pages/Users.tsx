import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Skeleton } from '../components/ui/skeleton';
import { useAuth } from '../context/AuthContext';
import { useUserMutations, useUsers } from '../hooks/useUsers';
import type { Role, Status } from '../types';
import { useState } from 'react';

const roles: Role[] = ['VIEWER', 'ANALYST', 'ADMIN'];

const initialCreateForm = {
  name: '',
  email: '',
  password: '',
  role: 'VIEWER' as Role,
};

export default function UsersPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const [search, setSearch] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [createForm, setCreateForm] = useState(initialCreateForm);
  const usersQuery = useUsers({ page: 1, limit: 50, search });
  const { createMutation, updateMutation, deleteMutation } = useUserMutations();

  const users = usersQuery.data?.data ?? [];
  const shownCount = users.length;
  const totalCount = usersQuery.data?.meta?.total ?? shownCount;

  const updateRole = async (id: string, role: Role) => {
    try {
      await updateMutation.mutateAsync({ id, role });
      toast.success('Role updated');
    } catch {
      toast.error('Role update failed');
    }
  };

  const updateStatus = async (id: string, status: Status) => {
    try {
      await updateMutation.mutateAsync({ id, status });
      toast.success('Status updated');
    } catch {
      toast.error('Status update failed');
    }
  };

  const submitCreateUser = async () => {
    if (!createForm.name.trim() || !createForm.email.trim() || !createForm.password.trim()) {
      toast.error('Name, email, and password are required');
      return;
    }

    try {
      await createMutation.mutateAsync({
        name: createForm.name.trim(),
        email: createForm.email.trim(),
        password: createForm.password,
        role: createForm.role,
      });
      toast.success('User created successfully');
      setIsAddOpen(false);
      setCreateForm(initialCreateForm);
    } catch {
      toast.error('Failed to create user');
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <Input
            placeholder="Search users by name or email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {isAdmin && (
            <Button onClick={() => setIsAddOpen(true)} className="w-full md:w-auto">
              Add User
            </Button>
          )}
        </div>
      </Card>
      <Card>
        {usersQuery.isLoading ? (
          <Skeleton className="h-56" />
        ) : shownCount === 0 ? (
          <div className="flex min-h-44 items-center justify-center">
            <p className="text-sm text-muted-foreground">No users match your search.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="py-2">Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-border/50">
                      <td className="py-2">{user.name}</td>
                      <td>{user.email}</td>
                      <td>
                        <select
                          className="h-9 rounded-lg border border-border bg-background px-2"
                          value={user.role}
                          onChange={(e) => updateRole(user.id, e.target.value as Role)}
                        >
                          {roles.map((role) => (
                            <option key={role} value={role}>
                              {role}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <Button
                          size="sm"
                          variant={user.status === 'ACTIVE' ? 'secondary' : 'destructive'}
                          onClick={() => updateStatus(user.id, user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE')}
                        >
                          {user.status}
                        </Button>
                      </td>
                      <td>
                        <Button variant="destructive" size="sm" onClick={() => deleteMutation.mutate(user.id)}>
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-xs text-muted-foreground">Showing {shownCount} of {totalCount} users</p>
          </div>
        )}
      </Card>

      {isAdmin && isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <Card className="w-full max-w-md space-y-3">
            <p className="font-semibold">Add User</p>
            <Input
              placeholder="Full name"
              value={createForm.name}
              onChange={(e) => setCreateForm((prev) => ({ ...prev, name: e.target.value }))}
            />
            <Input
              type="email"
              placeholder="Email"
              value={createForm.email}
              onChange={(e) => setCreateForm((prev) => ({ ...prev, email: e.target.value }))}
            />
            <Input
              type="password"
              placeholder="Password"
              value={createForm.password}
              onChange={(e) => setCreateForm((prev) => ({ ...prev, password: e.target.value }))}
            />
            <select
              className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm"
              value={createForm.role}
              onChange={(e) => setCreateForm((prev) => ({ ...prev, role: e.target.value as Role }))}
            >
              {roles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>

            <div className="flex justify-end gap-2">
              <Button
                variant="secondary"
                onClick={() => {
                  setIsAddOpen(false);
                  setCreateForm(initialCreateForm);
                }}
              >
                Cancel
              </Button>
              <Button onClick={submitCreateUser} disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Creating...' : 'Create User'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
