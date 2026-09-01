import { apiClient } from './client';
import type { BenchmarkComparison } from '../types';

export async function getComparison(benchmarkId: number) {
  const { data } = await apiClient.get<BenchmarkComparison>(`/comparison/${benchmarkId}`);
  return data;
}
