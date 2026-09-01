import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileJson, FileSpreadsheet, FileDown, Loader2, Download, Zap } from 'lucide-react';
import { useAsync } from '../../hooks/useAsync';
import { listProjectBenchmarks } from '../../api/benchmarks';
import { exportJson, exportCsv, exportPdf } from '../../api/export';
import EmptyState from '../../components/EmptyState';
import { SkeletonList } from '../../components/Skeleton';
import { formatDateTime, truncate } from '../../lib/format';
import { getApiErrorMessage } from '../../api/client';
import { useToast } from '../../components/Toast';

type Kind = 'json' | 'csv' | 'pdf';

const kindMeta: Record<Kind, { icon: typeof FileJson; label: string; fn: (id: number) => Promise<void> }> = {
  json: { icon: FileJson, label: 'JSON', fn: exportJson },
  csv: { icon: FileSpreadsheet, label: 'CSV', fn: exportCsv },
  pdf: { icon: FileDown, label: 'PDF', fn: exportPdf },
};

export default function ReportsTab({ projectId }: { projectId: number }) {
  const { data: benchmarks, loading, error } = useAsync(() => listProjectBenchmarks(projectId), [projectId]);
  const { push } = useToast();
  const [pending, setPending] = useState<string | null>(null);

  const handleExport = async (benchmarkId: number, kind: Kind) => {
    const key = `${benchmarkId}-${kind}`;
    setPending(key);
    try {
      await kindMeta[kind].fn(benchmarkId);
      push(`${kindMeta[kind].label} report downloaded.`, 'success');
    } catch (err) {
      push(getApiErrorMessage(err, 'Export failed.'), 'error');
    } finally {
      setPending(null);
    }
  };

  const completed = (benchmarks ?? []).filter((b) => b.status === 'COMPLETED').sort((a, b) => b.id - a.id);

  return (
    <div>
      <h3 className="text-sm font-semibold text-ink-800 mb-1">Export Reports</h3>
      <p className="text-xs text-ink-500 mb-5">Download benchmark results as JSON, CSV, or a formatted PDF report.</p>

      {loading ? (
        <SkeletonList rows={3} />
      ) : error ? (
        <EmptyState icon={FileDown} title="Couldn't load benchmarks" description={error} />
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
              <div className="h-9 w-9 rounded-lg bg-accent-50 flex items-center justify-center shrink-0">
                <Zap className="h-4 w-4 text-accent-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-ink-800 truncate">{truncate(b.prompt, 70)}</p>
                <p className="text-xs text-ink-400 font-mono mt-0.5">{formatDateTime(b.created_at)}</p>
              </div>
              <div className="flex gap-1.5 shrink-0">
                {(Object.keys(kindMeta) as Kind[]).map((kind) => {
                  const meta = kindMeta[kind];
                  const key = `${b.id}-${kind}`;
                  const isPending = pending === key;
                  return (
                    <button
                      key={kind}
                      onClick={() => handleExport(b.id, kind)}
                      disabled={!!pending}
                      className="btn-secondary !px-3 !py-2 text-xs"
                    >
                      {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <meta.icon className="h-3.5 w-3.5" />}
                      {meta.label}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Download}
          title="No completed benchmarks to export"
          description="Once a benchmark finishes running, its report becomes available here."
        />
      )}
    </div>
  );
}
