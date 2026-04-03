import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { deleteUser, getUsers, updateUser } from '../api/users';
import type { Role, Status } from '../types';

export function useUsers(params: { page?: number; limit?: number; search?: string }) {
  return useQuery({
    queryKey: ['users', params],
    queryFn: () => getUsers(params),
  });
}

export function useUserMutations() {
  const queryClient = useQueryClient();

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['users'] });

  return {
    updateMutation: useMutation({
      mutationFn: ({ id, role, status }: { id: string; role?: Role; status?: Status }) =>
        updateUser(id, { role, status }),
      onSuccess: invalidate,
    }),
    deleteMutation: useMutation({
      mutationFn: (id: string) => deleteUser(id),
      onSuccess: invalidate,
    }),
  };
}
