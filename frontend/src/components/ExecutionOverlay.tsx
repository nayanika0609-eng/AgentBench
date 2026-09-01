import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Loader2, CheckCircle2 } from 'lucide-react';

interface ExecutionOverlayProps {
  models: string[];
  useRag: boolean;
}

/**
 * The backend runs the benchmark synchronously and does not stream progress,
 * so we can't show a truthful per-model % complete. Instead we show the
 * pipeline stages that genuinely happen (retrieval only if RAG is enabled,
 * generation, evaluation) with a soft indeterminate animation, plus elapsed
 * time — never fabricated completion percentages.
 */
export default function ExecutionOverlay({ models, useRag }: ExecutionOverlayProps) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const interval = setInterval(() => setElapsed(Math.floor((Date.now() - start) / 1000)), 1000);
    return () => clearInterval(interval);
  }, []);

  const stages = [
    ...(useRag ? [{ label: 'Retrieving context', desc: 'Searching indexed document chunks' }] : []),
    { label: 'Generating responses', desc: `Running ${models.length} model${models.length > 1 ? 's' : ''} sequentially` },
    { label: 'Running evaluation', desc: 'Scoring readability, adherence, completeness & more' },
    { label: 'Finalizing results', desc: 'Calculating overall scores' },
  ];

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="relative h-16 w-16 mb-6">
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-accent-200"
          animate={{ scale: [1, 1.4], opacity: [0.6, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
        />
        <div className="absolute inset-0 rounded-full bg-accent-50 border border-accent-200 flex items-center justify-center">
          <Loader2 className="h-6 w-6 text-accent-500 animate-spin" />
        </div>
      </div>

      <h3 className="text-lg font-display font-semibold text-ink-900">Running your benchmark</h3>
      <p className="text-sm text-ink-500 mt-1 font-mono">{elapsed}s elapsed</p>

      <div className="flex flex-wrap justify-center gap-1.5 mt-4">
        {models.map((m) => (
          <span key={m} className="badge bg-ink-100 text-ink-600 font-mono">{m}</span>
        ))}
      </div>

      <div className="w-full max-w-sm mt-8 space-y-3 text-left">
        {stages.map((stage, i) => (
          <motion.div
            key={stage.label}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.15 }}
            className="flex items-center gap-3"
          >
            <div className="h-6 w-6 rounded-full bg-accent-50 border border-accent-100 flex items-center justify-center shrink-0">
              <motion.div
                className="h-1.5 w-1.5 rounded-full bg-accent-500"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.2 }}
              />
            </div>
            <div>
              <p className="text-sm text-ink-700 font-medium">{stage.label}</p>
              <p className="text-xs text-ink-400">{stage.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <p className="text-[11px] text-ink-400 mt-8 max-w-xs flex items-center gap-1.5">
        <CheckCircle2 className="h-3.5 w-3.5 text-teal-500 shrink-0" />
        This can take a while for larger models — please keep this tab open.
      </p>
    </div>
  );
}
