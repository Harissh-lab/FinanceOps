import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createRecord,
  deleteRecord,
  getRecords,
  importRecords,
  updateRecord,
  type RecordFilters,
  type RecordInput,
} from '../api/records';

export function useRecords(filters: RecordFilters) {
  return useQuery({
    queryKey: ['records', filters],
    queryFn: () => getRecords(filters),
  });
}

export function useRecordMutations() {
  const queryClient = useQueryClient();

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['records'] });

  return {
    createMutation: useMutation({
      mutationFn: (payload: RecordInput) => createRecord(payload),
      onSuccess: invalidate,
    }),
    updateMutation: useMutation({
      mutationFn: ({ id, payload }: { id: string; payload: Partial<RecordInput> }) =>
        updateRecord(id, payload),
      onSuccess: invalidate,
    }),
    deleteMutation: useMutation({
      mutationFn: (id: string) => deleteRecord(id),
      onSuccess: invalidate,
    }),
    importMutation: useMutation({
      mutationFn: (file: File) => importRecords(file),
      onSuccess: invalidate,
    }),
  };
}
