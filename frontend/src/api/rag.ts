import { apiClient } from './client';
import type { RagAskResponse } from '../types';

export interface RagAskPayload {
  project_id: number;
  question: string;
  model: string;
  top_k: number;
}

export async function askRag(payload: RagAskPayload) {
  const { data } = await apiClient.post<RagAskResponse>('/rag/ask', payload);
  return data;
}
