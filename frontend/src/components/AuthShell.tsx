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
      <div className="hidden lg:flex lg:w-[46%] relative overflow-hidden bg-surface-soft border-r border-line flex-col justify-between p-12">
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(0,255,156,0.18) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,255,156,0.18) 1px, transparent 1px)',
            backgroundSize: '36px 36px',
          }}
        />
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-accent-400/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-accent-400/5 blur-3xl" />

        <div className="relative z-10 flex items-center gap-2.5">
          <div className="h-9 w-9 border border-accent-400/35 bg-accent-50 flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-accent-400" />
          </div>
          <div>
            <span className="font-display font-bold text-lg text-accent-400">AgentBench</span>
            <p className="terminal-label">Evaluation Intelligence</p>
          </div>
        </div>

        <div className="relative z-10 space-y-8">
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl font-display font-bold leading-tight text-accent-400"
          >
            Evaluate every model.
            <br />
            Trust every result.
          </motion.h2>

          <p className="text-ink-600 text-sm max-w-sm leading-relaxed">
            Benchmark LLMs side-by-side, evaluate RAG pipelines with real retrieval metrics,
            and track performance across every project you run.
          </p>

          <div className="grid grid-cols-3 gap-3 pt-2">
            {[
              { icon: BarChart3, label: 'Benchmarks' },
              { icon: GitCompare, label: 'Comparisons' },
              { icon: Activity, label: 'RAG Metrics' },
            ].map((feature) => (
              <div key={feature.label} className="border border-line bg-surface p-3.5">
                <feature.icon className="h-4 w-4 text-accent-400 mb-2" strokeWidth={1.6} />
                <p className="text-xs text-ink-600">{feature.label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-[11px] font-mono text-ink-500">AgentBench · v1.0.0</p>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="w-full max-w-sm"
        >
          <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
            <div className="h-8 w-8 border border-accent-400/35 bg-accent-50 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-accent-400" />
            </div>
            <span className="font-display font-bold text-base text-accent-400">AgentBench</span>
          </div>

          <p className="terminal-label mb-2">AUTHENTICATION / SESSION</p>
          <h1 className="text-3xl font-display font-bold text-accent-400">{title}</h1>
          <p className="text-sm text-ink-500 mt-2 mb-8">{subtitle}</p>

          {children}
        </motion.div>
      </div>
    </div>
  );
}
