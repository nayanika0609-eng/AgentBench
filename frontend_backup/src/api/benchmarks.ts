import { apiClient } from './client';
import type { Benchmark, BenchmarkResult } from '../types';

export interface BenchmarkCreatePayload {
  prompt: string;
  models: string[];
  use_rag: boolean;
  top_k: number;
}

export async function listProjectBenchmarks(projectId: number) {
  const { data } = await apiClient.get<Benchmark[]>(`/projects/${projectId}/benchmarks`);
  return data;
}

export async function getBenchmark(benchmarkId: number) {
  const { data } = await apiClient.get<Benchmark>(`/benchmarks/${benchmarkId}`);
  return data;
}

export async function createBenchmark(projectId: number, payload: BenchmarkCreatePayload) {
  // Note: the backend runs every model synchronously inside this request
  // (no background job / websocket), so this call blocks until every
  // selected model has generated a response and been evaluated.
  const { data } = await apiClient.post<Benchmark>(`/projects/${projectId}/benchmarks`, payload);
  return data;
}

export async function deleteBenchmark(benchmarkId: number) {
  await apiClient.delete(`/benchmarks/${benchmarkId}`);
}

export async function getBenchmarkResults(benchmarkId: number) {
  const { data } = await apiClient.get<BenchmarkResult[]>(`/results/${benchmarkId}`);
  return data;
}
