// Types mirror the FastAPI Pydantic schemas exactly (see backend/app/schemas).
// Nullable numeric fields stay `number | null` end-to-end so the UI can
// distinguish "0" from "not evaluated" rather than coercing null -> 0.

export interface User {
  id: number;
  username: string;
  email: string;
}

export interface Project {
  id: number;
  name: string;
  description: string;
  owner_id: number;
}

export interface DocumentItem {
  id: number;
  project_id: number;
  filename: string;
  filetype: string;
  uploaded_at: string;
  chunk_count: number;
}

export interface Benchmark {
  id: number;
  project_id: number;
  prompt: string;
  status: string;
  created_at: string;
}

export interface Evaluation {
  overall_score: number | null;
  semantic_similarity: number | null;
  hallucination_score: number | null;
  toxicity_score: number | null;
  json_valid: boolean | null;
  latency: number | null;
  readability_score: number | null;
  keyword_score: number | null;
  prompt_adherence: number | null;
  completeness_score: number | null;
  context_relevance_score: number | null;
  faithfulness_score: number | null;
  answer_relevance_score: number | null;
  citation_coverage_score: number | null;
  rag_score: number | null;
}

export interface BenchmarkResult {
  id: number;
  benchmark_id: number;
  model_name: string;
  response: string;
  latency_ms: number | null;
  tokens_used: number | null;
  cost: number | null;
  created_at: string;
  evaluation: Evaluation | null;
}

export interface ModelComparison {
  model_name: string;
  response: string;
  overall_score: number | null;
  latency: number | null;
  readability_score: number | null;
  keyword_score: number | null;
  prompt_adherence: number | null;
  completeness_score: number | null;
  context_relevance_score?: number | null;
  faithfulness_score?: number | null;
  answer_relevance_score?: number | null;
  citation_coverage_score?: number | null;
  rag_score?: number | null;
}

export interface BenchmarkComparison {
  benchmark_id: number;
  prompt: string;
  models: ModelComparison[];
}

export interface DashboardStats {
  total_projects: number;
  total_benchmarks: number;
  total_responses: number;
  average_score: number;
  best_model: string | null;
  fastest_model: string | null;
}

export interface LeaderboardEntry {
  model_name: string;
  average_score: number;
  average_latency: number;
  total_responses: number;
}

export interface RagSource {
  rank: number;
  document_id: number;
  filename: string;
  chunk_id: number;
  chunk_index: number;
  distance: number;
}

export interface RagMetrics {
  retrieval_time_ms: number;
  generation_time_ms: number;
  total_time_ms: number;
}

export interface RagAskResponse {
  success: boolean;
  message?: string;
  question?: string;
  answer?: string;
  model?: string;
  chunks_used?: number;
  sources?: RagSource[];
  metrics?: RagMetrics;
}

export interface ApiErrorShape {
  detail?: string | { msg: string; loc?: (string | number)[] }[];
}
