import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ChevronDown,
  Clock,
  Coins,
  Hash,
  GitCompare,
  FileJson,
  FileSpreadsheet,
  FileDown,
  Loader2,
  BarChart3,
} from 'lucide-react';
import { useAsync } from '../hooks/useAsync';
import { getBenchmarkResults, getBenchmark } from '../api/benchmarks';
import { exportJson, exportCsv, exportPdf } from '../api/export';
import ScoreRing from '../components/ScoreRing';
import MetricBar from '../components/MetricBar';
import EmptyState from '../components/EmptyState';
import { SkeletonList } from '../components/Skeleton';
import PageHeader from '../components/PageHeader';
import { formatLatency, isScored } from '../lib/format';
import { getApiErrorMessage } from '../api/client';
import { useToast } from '../components/Toast';
import type { BenchmarkResult } from '../types';

function ResponseCard({ result, rank }: { result: BenchmarkResult; rank: number }) {
  const [expanded, setExpanded] = useState(rank === 1);
  const evaluation = result.evaluation;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.06, duration: 0.35 }}
      className="panel overflow-hidden"
    >
      <div className="p-5 flex flex-col sm:flex-row sm:items-center gap-5">
        <div className="flex items-center gap-4">
          {rank <= 3 && (
            <div
              className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                rank === 1 ? 'bg-amber-100 text-amber-600' : rank === 2 ? 'bg-ink-100 text-ink-500' : 'bg-amber-50 text-amber-500'
              }`}
            >
              {rank}
            </div>
          )}
          <ScoreRing value={evaluation?.overall_score} size={68} label="Overall" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-mono text-sm font-semibold text-ink-900">{result.model_name}</p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-xs text-ink-500">
            <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {formatLatency(result.latency_ms)}</span>
            {result.tokens_used !== null && (
              <span className="inline-flex items-center gap-1"><Hash className="h-3 w-3" /> {result.tokens_used} tokens</span>
            )}
            {result.cost !== null && (
              <span className="inline-flex items-center gap-1"><Coins className="h-3 w-3" /> ${result.cost?.toFixed(4)}</span>
            )}
          </div>

          {evaluation && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-2 mt-4 max-w-xl">
              <MetricBar label="Readability" value={evaluation.readability_score} compact />
              <MetricBar label="Keyword" value={evaluation.keyword_score} compact />
              <MetricBar label="Adherence" value={evaluation.prompt_adherence} compact />
              <MetricBar label="Completeness" value={evaluation.completeness_score} compact />
            </div>
          )}
        </div>

        <button
          onClick={() => setExpanded((v) => !v)}
          className="btn-ghost !px-3 !py-2 shrink-0 self-start sm:self-center"
          aria-expanded={expanded}
        >
          {expanded ? 'Collapse' : 'Expand'}
          <ChevronDown className={`h-4 w-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </button>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-line-soft"
          >
            <div className="p-5 space-y-5">
              <div>
                <p className="kicker mb-2">Response</p>
                <p className="text-sm text-ink-700 leading-relaxed whitespace-pre-wrap bg-surface-cool rounded-lg p-4 border border-line-soft max-h-80 overflow-y-auto">
                  {result.response}
                </p>
              </div>

              {evaluation && (
                <div>
                  <p className="kicker mb-3">Evaluation Metrics</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <MetricBar label="Semantic Similarity" value={evaluation.semantic_similarity} />
                    <MetricBar label="Hallucination" value={evaluation.hallucination_score} />
                    <MetricBar label="Toxicity" value={evaluation.toxicity_score} />
                    <MetricBar label="Latency Score" value={evaluation.latency} />
                  </div>

                  {(isScored(evaluation.context_relevance_score) ||
                    isScored(evaluation.faithfulness_score) ||
                    isScored(evaluation.answer_relevance_score) ||
                    isScored(evaluation.citation_coverage_score) ||
                    isScored(evaluation.rag_score)) && (
                    <div className="mt-5 pt-5 border-t border-line-soft">
                      <p className="kicker mb-3">RAG Metrics</p>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <MetricBar label="Context Relevance" value={evaluation.context_relevance_score} />
                        <MetricBar label="Faithfulness" value={evaluation.faithfulness_score} />
                        <MetricBar label="Answer Relevance" value={evaluation.answer_relevance_score} />
                        <MetricBar label="Citation Coverage" value={evaluation.citation_coverage_score} />
                        <MetricBar label="RAG Score" value={evaluation.rag_score} />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function BenchmarkResults() {
  const { benchmarkId } = useParams();
  const id = Number(benchmarkId);
  const { push } = useToast();
  const [exporting, setExporting] = useState<string | null>(null);

  const { data: benchmark } = useAsync(() => getBenchmark(id), [id]);
  const { data: results, loading, error } = useAsync(() => getBenchmarkResults(id), [id]);

  const ranked = (results ?? [])
    .slice()
    .sort((a, b) => (b.evaluation?.overall_score ?? -1) - (a.evaluation?.overall_score ?? -1));

  const handleExport = async (kind: 'json' | 'csv' | 'pdf', fn: (id: number) => Promise<void>) => {
    setExporting(kind);
    try {
      await fn(id);
      push(`${kind.toUpperCase()} downloaded.`, 'success');
    } catch (err) {
      push(getApiErrorMessage(err, 'Export failed.'), 'error');
    } finally {
      setExporting(null);
    }
  };

  return (
    <div>
      <Link to={`/projects/${benchmark?.project_id ?? ''}`} className="inline-flex items-center gap-1.5 text-xs text-ink-500 hover:text-ink-800 mb-4">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to project
      </Link>

      <PageHeader
        kicker="Benchmark Results"
        title={benchmark ? benchmark.prompt : 'Loading…'}
        description={ranked.length > 0 ? `${ranked.length} model${ranked.length > 1 ? 's' : ''} evaluated` : undefined}
        action={
          <div className="flex gap-2">
            {benchmark && (
              <Link to={`/benchmarks/${id}/compare`} className="btn-secondary">
                <GitCompare className="h-4 w-4" /> Compare
              </Link>
            )}
            <button className="btn-secondary" onClick={() => handleExport('json', exportJson)} disabled={!!exporting}>
              {exporting === 'json' ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileJson className="h-4 w-4" />}
            </button>
            <button className="btn-secondary" onClick={() => handleExport('csv', exportCsv)} disabled={!!exporting}>
              {exporting === 'csv' ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileSpreadsheet className="h-4 w-4" />}
            </button>
            <button className="btn-secondary" onClick={() => handleExport('pdf', exportPdf)} disabled={!!exporting}>
              {exporting === 'pdf' ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
            </button>
          </div>
        }
      />

      {loading ? (
        <SkeletonList rows={3} />
      ) : error ? (
        <EmptyState icon={BarChart3} title="Couldn't load results" description={error} />
      ) : ranked.length > 0 ? (
        <div className="space-y-3">
          {ranked.map((r, i) => (
            <ResponseCard key={r.id} result={r} rank={i + 1} />
          ))}
        </div>
      ) : (
        <EmptyState icon={BarChart3} title="No responses yet" description="This benchmark hasn't produced any model responses." />
      )}
    </div>
  );
}
