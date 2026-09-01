import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Zap, FileText, ArrowRight, Database } from 'lucide-react';
import { useAsync } from '../../hooks/useAsync';
import { listProjectBenchmarks } from '../../api/benchmarks';
import { listDocuments } from '../../api/documents';
import { formatDateTime, truncate } from '../../lib/format';
import { SkeletonList } from '../../components/Skeleton';
import EmptyState from '../../components/EmptyState';
import Badge from '../../components/Badge';
import type { Project } from '../../types';

const statusTone: Record<string, 'good' | 'neutral' | 'poor'> = {
  COMPLETED: 'good',
  PENDING: 'neutral',
  FAILED: 'poor',
};

export default function OverviewTab({ project, onNavigateTab }: { project: Project; onNavigateTab: (tab: string) => void }) {
  const { data: benchmarks, loading: bLoading } = useAsync(() => listProjectBenchmarks(project.id), [project.id]);
  const { data: documents, loading: dLoading } = useAsync(() => listDocuments(project.id), [project.id]);

  const recentBenchmarks = (benchmarks ?? []).slice().sort((a, b) => b.id - a.id).slice(0, 5);
  const totalChunks = (documents ?? []).reduce((sum, d) => sum + d.chunk_count, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="panel p-5">
          <div className="h-9 w-9 rounded-lg bg-accent-50 flex items-center justify-center mb-3">
            <Zap className="h-[18px] w-[18px] text-accent-600" strokeWidth={1.8} />
          </div>
          <p className="label mb-1">Benchmarks Run</p>
          <p className="text-2xl font-display font-semibold text-ink-900">{benchmarks?.length ?? 0}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }} className="panel p-5">
          <div className="h-9 w-9 rounded-lg bg-teal-50 flex items-center justify-center mb-3">
            <FileText className="h-[18px] w-[18px] text-teal-600" strokeWidth={1.8} />
          </div>
          <p className="label mb-1">Documents</p>
          <p className="text-2xl font-display font-semibold text-ink-900">{documents?.length ?? 0}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} className="panel p-5">
          <div className="h-9 w-9 rounded-lg bg-amber-50 flex items-center justify-center mb-3">
            <Database className="h-[18px] w-[18px] text-amber-500" strokeWidth={1.8} />
          </div>
          <p className="label mb-1">Chunks Indexed</p>
          <p className="text-2xl font-display font-semibold text-ink-900">{totalChunks}</p>
        </motion.div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-ink-800">Recent Benchmarks</h3>
          <button onClick={() => onNavigateTab('benchmarks')} className="text-xs text-accent-600 hover:underline inline-flex items-center gap-0.5">
            View all <ArrowRight className="h-3 w-3" />
          </button>
        </div>

        {bLoading ? (
          <SkeletonList rows={3} />
        ) : recentBenchmarks.length > 0 ? (
          <div className="space-y-2">
            {recentBenchmarks.map((b) => (
              <Link
                key={b.id}
                to={`/benchmarks/${b.id}/results`}
                className="panel p-4 flex items-center gap-3.5 hover:shadow-lift transition-shadow"
              >
                <div className="h-9 w-9 rounded-lg bg-accent-50 flex items-center justify-center shrink-0">
                  <Zap className="h-4 w-4 text-accent-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-ink-800 truncate">{truncate(b.prompt, 80)}</p>
                  <p className="text-xs text-ink-400 mt-0.5 font-mono">{formatDateTime(b.created_at)}</p>
                </div>
                <Badge tone={statusTone[b.status] ?? 'neutral'}>{b.status}</Badge>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Zap}
            title="Run your first benchmark"
            description="Head to the Benchmarks tab to configure and run one."
            action={
              <button className="btn-accent" onClick={() => onNavigateTab('benchmarks')}>
                Go to benchmarks
              </button>
            }
          />
        )}
      </div>

      {!dLoading && (documents?.length ?? 0) === 0 && (
        <EmptyState
          icon={Database}
          title="Upload documents to enable RAG"
          description="RAG benchmarks and retrieval evaluation require at least one indexed document."
          action={
            <button className="btn-secondary" onClick={() => onNavigateTab('documents')}>
              Go to Documents
            </button>
          }
        />
      )}
    </div>
  );
}
