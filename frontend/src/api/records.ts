import api from './axios';
import type { ApiSuccess, FinancialRecord, RecordType } from '../types';

export type RecordFilters = {
  type?: RecordType | '';
  category?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  search?: string;
};

export type RecordInput = {
  amount: number;
  type: RecordType;
  category: string;
  date: string;
  notes?: string;
};

export async function getRecords(filters: RecordFilters): Promise<ApiSuccess<FinancialRecord[]>> {
  const params = Object.fromEntries(
    Object.entries(filters).filter(([, value]) => {
      if (value === undefined || value === null) {
        return false;
      }
      if (typeof value === 'string' && value.trim() === '') {
        return false;
      }
      return true;
    }),
  );

  const response = await api.get<ApiSuccess<FinancialRecord[]>>('/records', { params });
  return response.data;
}

export async function createRecord(payload: RecordInput): Promise<FinancialRecord> {
  const response = await api.post<ApiSuccess<FinancialRecord>>('/records', payload);
  return response.data.data;
}

export async function updateRecord(id: string, payload: Partial<RecordInput>): Promise<FinancialRecord> {
  const response = await api.patch<ApiSuccess<FinancialRecord>>(`/records/${id}`, payload);
  return response.data.data;
}

export async function deleteRecord(id: string): Promise<void> {
  await api.delete(`/records/${id}`);
}

export async function importRecords(file: File): Promise<{ importedCount: number; message: string }> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post<ApiSuccess<{ importedCount: number; message: string }>>(
    '/records/import',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  );
  return response.data.data;
}
