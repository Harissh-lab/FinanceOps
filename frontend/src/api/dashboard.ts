import api from './axios';
import type { ApiSuccess, CategoryPoint, FinancialRecord, Summary, TrendPoint } from '../types';

export async function getSummary(): Promise<Summary> {
  const response = await api.get<ApiSuccess<Summary>>('/dashboard/summary');
  return response.data.data;
}

export async function getTrends(): Promise<TrendPoint[]> {
  const response = await api.get<ApiSuccess<TrendPoint[]>>('/dashboard/trends');
  return response.data.data;
}

export async function getCategories(): Promise<CategoryPoint[]> {
  const response = await api.get<ApiSuccess<CategoryPoint[]>>('/dashboard/categories');
  return response.data.data;
}

export async function getRecent(): Promise<FinancialRecord[]> {
  const response = await api.get<ApiSuccess<FinancialRecord[]>>('/dashboard/recent');
  return response.data.data;
}
