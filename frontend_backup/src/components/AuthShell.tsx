import { motion } from 'framer-motion';
import { Sparkles, Activity, BarChart3, GitCompare } from 'lucide-react';
import type { ReactNode } from 'react';

export default function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen flex bg-canvas bg-noise">
      {/* Left: brand / visual panel */}
      <div className="hidden lg:flex lg:w-[46%] relative overflow-hidden bg-ink-900 text-white flex-col justify-between p-12">
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)',
            backgroundSize: '36px 36px',
          }}
        />
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-accent-500/20 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-teal-400/10 blur-3xl" />

        <div className="relative z-10 flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="font-display font-semibold text-lg">AgentBench</span>
        </div>

        <div className="relative z-10 space-y-8">
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-display font-semibold leading-tight text-white"
          >
            Evaluate every model.
            <br />
            Trust every result.
          </motion.h2>
          <p className="text-white/60 text-sm max-w-sm leading-relaxed">
            Benchmark LLMs side-by-side, evaluate RAG pipelines with real retrieval
            metrics, and track performance across every project you run.
          </p>

          <div className="grid grid-cols-3 gap-3 pt-2">
            {[
              { icon: BarChart3, label: 'Benchmarks' },
              { icon: GitCompare, label: 'Comparisons' },
              { icon: Activity, label: 'RAG Metrics' },
            ].map((f) => (
              <div key={f.label} className="rounded-xl border border-white/10 bg-white/5 p-3.5">
                <f.icon className="h-4 w-4 text-white/70 mb-2" strokeWidth={1.6} />
                <p className="text-xs text-white/70">{f.label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-[11px] font-mono text-white/30">AgentBench · v1.0.0</p>
      </div>

      {/* Right: form panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="w-full max-w-sm"
        >
          <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
            <div className="h-8 w-8 rounded-lg bg-ink-900 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="font-display font-semibold text-base">AgentBench</span>
          </div>

          <h1 className="text-2xl font-display font-semibold text-ink-900">{title}</h1>
          <p className="text-sm text-ink-500 mt-1.5 mb-8">{subtitle}</p>

          {children}
        </motion.div>
      </div>
    </div>
  );
}
