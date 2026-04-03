import { toast } from 'sonner';
import { EmptyState } from '../components/EmptyState';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Skeleton } from '../components/ui/skeleton';
import { useUserMutations, useUsers } from '../hooks/useUsers';
import type { Role, Status } from '../types';
import { useState } from 'react';

const roles: Role[] = ['VIEWER', 'ANALYST', 'ADMIN'];

export default function UsersPage() {
  const [search, setSearch] = useState('');
  const usersQuery = useUsers({ page: 1, limit: 50, search });
  const { updateMutation, deleteMutation } = useUserMutations();

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

  return (
    <div className="space-y-4">
      <Card>
        <Input placeholder="Search users by name or email" value={search} onChange={(e) => setSearch(e.target.value)} />
      </Card>
      <Card>
        {usersQuery.isLoading ? (
          <Skeleton className="h-56" />
        ) : (usersQuery.data?.data.length ?? 0) === 0 ? (
          <EmptyState title="No Users Found" description="No users match your search criteria." />
        ) : (
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
                {(usersQuery.data?.data ?? []).map((user) => (
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
        )}
      </Card>
    </div>
  );
}
