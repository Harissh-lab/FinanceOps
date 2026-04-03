import { useQuery } from '@tanstack/react-query';
import { getCategories, getRecent, getSummary, getTrends } from '../api/dashboard';

export function useSummary() {
  return useQuery({ queryKey: ['summary'], queryFn: getSummary });
}

export function useTrends() {
  return useQuery({ queryKey: ['trends'], queryFn: getTrends });
}

export function useCategories() {
  return useQuery({ queryKey: ['categories'], queryFn: getCategories });
}

export function useRecent() {
  return useQuery({ queryKey: ['recent'], queryFn: getRecent });
}
