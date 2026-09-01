import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Zap, Trash2, ArrowRight, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAsync } from '../../hooks/useAsync';
import { listProjectBenchmarks, createBenchmark, deleteBenchmark } from '../../api/benchmarks';
import EmptyState from '../../components/EmptyState';
import { SkeletonList } from '../../components/Skeleton';
import Modal from '../../components/Modal';
import BenchmarkForm, { type BenchmarkFormValues } from '../../components/BenchmarkForm';
import ExecutionOverlay from '../../components/ExecutionOverlay';
import Badge from '../../components/Badge';
import { formatDateTime, truncate } from '../../lib/format';
import { getApiErrorMessage } from '../../api/client';
import { useToast } from '../../components/Toast';

const statusTone: Record<string, 'good' | 'neutral' | 'poor' | 'ok'> = {
  COMPLETED: 'good',
  PENDING: 'neutral',
  FAILED: 'poor',
};

export default function BenchmarksTab({ projectId, hasDocuments }: { projectId: number; hasDocuments: boolean }) {
  const { data: benchmarks, loading, error, refetch } = useAsync(() => listProjectBenchmarks(projectId), [projectId]);
  const { push } = useToast();
  const navigate = useNavigate();

  const [createOpen, setCreateOpen] = useState(false);
  const [running, setRunning] = useState<{ models: string[]; useRag: boolean } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleRun = async (values: BenchmarkFormValues) => {
    setRunning({ models: values.models, useRag: values.use_rag });
    try {
      const benchmark = await createBenchmark(projectId, values);
      push('Benchmark completed.', 'success');
      setCreateOpen(false);
      setRunning(null);
      refetch();
      navigate(`/benchmarks/${benchmark.id}/results`);
    } catch (err) {
      push(getApiErrorMessage(err, 'Benchmark run failed.'), 'error');
      setRunning(null);
    }
  };

  const handleDelete = async () => {
    if (deleteTarget === null) return;
    setDeleting(true);
    try {
      await deleteBenchmark(deleteTarget);
      push('Benchmark deleted.', 'success');
      setDeleteTarget(null);
      refetch();
    } catch (err) {
      push(getApiErrorMessage(err, 'Could not delete benchmark.'), 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-semibold text-ink-800">Benchmark Runs</h3>
          <p className="text-xs text-ink-500 mt-0.5">Every run executes your selected models against this prompt.</p>
        </div>
        <button className="btn-accent" onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" /> New benchmark
        </button>
      </div>

      {loading ? (
        <SkeletonList rows={3} />
      ) : error ? (
        <EmptyState icon={Zap} title="Couldn't load benchmarks" description={error} />
      ) : benchmarks && benchmarks.length > 0 ? (
        <div className="space-y-2.5">
          {benchmarks
            .slice()
            .sort((a, b) => b.id - a.id)
            .map((b, i) => (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="panel p-4 flex items-center gap-4 group"
              >
                <div className="h-10 w-10 rounded-lg bg-accent-50 flex items-center justify-center shrink-0">
                  <Zap className="h-[18px] w-[18px] text-accent-600" strokeWidth={1.8} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink-800 truncate">{truncate(b.prompt, 90)}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge tone={statusTone[b.status] ?? 'neutral'}>{b.status}</Badge>
                    <span className="text-xs text-ink-400 font-mono">{formatDateTime(b.created_at)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Link
                    to={`/benchmarks/${b.id}/results`}
                    className="btn-secondary !py-2 !px-3 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    Results <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                  <button
                    onClick={() => setDeleteTarget(b.id)}
                    aria-label="Delete benchmark"
                    className="h-8 w-8 rounded-md flex items-center justify-center text-ink-400 hover:bg-rose-50 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </motion.div>
            ))}
        </div>
      ) : (
        <EmptyState
          icon={Zap}
          title="Run your first benchmark"
          description="Configure a prompt, choose your models, and compare results side-by-side."
          action={
            <button className="btn-accent" onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" /> New benchmark
            </button>
          }
        />
      )}

      <Modal
        open={createOpen}
        onClose={() => {
          if (!running) setCreateOpen(false);
        }}
        title={running ? 'Running benchmark' : 'Configure benchmark'}
        maxWidth="max-w-2xl"
      >
        {running ? (
          <ExecutionOverlay models={running.models} useRag={running.useRag} />
        ) : (
          <BenchmarkForm onSubmit={handleRun} submitting={!!running} hasDocuments={hasDocuments} />
        )}
      </Modal>

      <Modal open={deleteTarget !== null} onClose={() => setDeleteTarget(null)} title="Delete benchmark">
        <p className="text-sm text-ink-600">
          This will permanently remove this benchmark run and all of its responses and evaluations.
        </p>
        <div className="flex gap-2 mt-5">
          <button className="btn-secondary flex-1" onClick={() => setDeleteTarget(null)}>Cancel</button>
          <button className="btn-danger flex-1" onClick={handleDelete} disabled={deleting}>
            {deleting && <Loader2 className="h-4 w-4 animate-spin" />} Delete
          </button>
        </div>
      </Modal>
    </div>
  );
}
