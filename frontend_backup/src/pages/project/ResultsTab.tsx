import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { BarChart3, ArrowRight, GitCompare } from 'lucide-react';
import { useAsync } from '../../hooks/useAsync';
import { listProjectBenchmarks } from '../../api/benchmarks';
import EmptyState from '../../components/EmptyState';
import { SkeletonList } from '../../components/Skeleton';
import Badge from '../../components/Badge';
import { formatDateTime, truncate } from '../../lib/format';

const statusTone: Record<string, 'good' | 'neutral' | 'poor'> = {
  COMPLETED: 'good',
  PENDING: 'neutral',
  FAILED: 'poor',
};

export default function ResultsTab({ projectId }: { projectId: number }) {
  const { data: benchmarks, loading, error } = useAsync(() => listProjectBenchmarks(projectId), [projectId]);
  const completed = (benchmarks ?? []).filter((b) => b.status === 'COMPLETED').sort((a, b) => b.id - a.id);

  return (
    <div>
      <h3 className="text-sm font-semibold text-ink-800 mb-1">Benchmark Results</h3>
      <p className="text-xs text-ink-500 mb-5">Detailed per-model responses, scores, and comparisons.</p>

      {loading ? (
        <SkeletonList rows={4} />
      ) : error ? (
        <EmptyState icon={BarChart3} title="Couldn't load results" description={error} />
      ) : completed.length > 0 ? (
        <div className="space-y-2.5">
          {completed.map((b, i) => (
            <motion.div
              key={b.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="panel p-4 flex items-center gap-4"
            >
              <div className="h-9 w-9 rounded-lg bg-teal-50 flex items-center justify-center shrink-0">
                <BarChart3 className="h-4 w-4 text-teal-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-ink-800 truncate">{truncate(b.prompt, 80)}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge tone={statusTone[b.status] ?? 'neutral'}>{b.status}</Badge>
                  <span className="text-xs text-ink-400 font-mono">{formatDateTime(b.created_at)}</span>
                </div>
              </div>
              <div className="flex gap-1.5 shrink-0">
                <Link to={`/benchmarks/${b.id}/results`} className="btn-secondary !px-3 !py-2 text-xs">
                  Results <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <Link to={`/benchmarks/${b.id}/compare`} className="btn-secondary !px-3 !py-2 text-xs">
                  <GitCompare className="h-3.5 w-3.5" /> Compare
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={BarChart3}
          title="No benchmark results yet"
          description="Run a benchmark from the Benchmarks tab to see results here."
        />
      )}
    </div>
  );
}
