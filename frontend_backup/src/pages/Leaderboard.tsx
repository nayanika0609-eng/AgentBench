import { motion } from 'framer-motion';
import { Trophy, Medal, Gauge } from 'lucide-react';
import { useAsync } from '../hooks/useAsync';
import { getLeaderboard } from '../api/leaderboard';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';
import { SkeletonList } from '../components/Skeleton';
import { formatLatency, formatScore, scoreTone, toneClasses } from '../lib/format';

const podiumStyles = [
  { bg: 'bg-amber-50', border: 'border-amber-200', badge: 'bg-amber-400 text-white', label: '1st' },
  { bg: 'bg-ink-100/60', border: 'border-line-strong', badge: 'bg-ink-400 text-white', label: '2nd' },
  { bg: 'bg-amber-50/50', border: 'border-amber-100', badge: 'bg-amber-300 text-white', label: '3rd' },
];

export default function Leaderboard() {
  const { data: entries, loading, error } = useAsync(getLeaderboard, []);
  const ranked = (entries ?? []).slice().sort((a, b) => b.average_score - a.average_score);

  return (
    <div>
      <PageHeader
        kicker="Rankings"
        title="Model Leaderboard"
        description="Aggregate performance across every benchmark you've run, ranked by average score."
      />

      {loading ? (
        <SkeletonList rows={6} />
      ) : error ? (
        <EmptyState icon={Trophy} title="Couldn't load leaderboard" description={error} />
      ) : ranked.length === 0 ? (
        <EmptyState
          icon={Trophy}
          title="No ranked models yet"
          description="Run and evaluate a benchmark to populate the leaderboard."
        />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {ranked.slice(0, 3).map((entry, i) => {
              const style = podiumStyles[i];
              return (
                <motion.div
                  key={entry.model_name}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.4 }}
                  className={`panel p-5 border ${style.border} ${style.bg}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-[11px] font-semibold px-2 py-1 rounded-full ${style.badge}`}>{style.label}</span>
                    <Medal className="h-4 w-4 text-ink-400" />
                  </div>
                  <p className="font-mono text-sm font-semibold text-ink-900 truncate">{entry.model_name}</p>
                  <p className="text-2xl font-display font-semibold text-ink-900 mt-2">{formatScore(entry.average_score, 1)}</p>
                  <p className="text-xs text-ink-500 mt-1">avg. score · {formatLatency(entry.average_latency)} avg latency</p>
                </motion.div>
              );
            })}
          </div>

          <div className="panel overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line-soft text-left">
                  <th className="px-5 py-3 font-medium text-ink-500 text-xs uppercase tracking-wide w-16">Rank</th>
                  <th className="px-5 py-3 font-medium text-ink-500 text-xs uppercase tracking-wide">Model</th>
                  <th className="px-5 py-3 font-medium text-ink-500 text-xs uppercase tracking-wide">Avg. Score</th>
                  <th className="px-5 py-3 font-medium text-ink-500 text-xs uppercase tracking-wide">Avg. Latency</th>
                  <th className="px-5 py-3 font-medium text-ink-500 text-xs uppercase tracking-wide">Responses</th>
                </tr>
              </thead>
              <tbody>
                {ranked.map((entry, i) => {
                  const tone = scoreTone(entry.average_score);
                  const colors = toneClasses[tone];
                  return (
                    <motion.tr
                      key={entry.model_name}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className="border-b border-line-soft last:border-0 hover:bg-surface-soft transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        <span className="font-mono text-xs text-ink-400">{String(i + 1).padStart(2, '0')}</span>
                      </td>
                      <td className="px-5 py-3.5 font-mono text-sm text-ink-800">{entry.model_name}</td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 font-medium ${colors.text}`}>
                          <Gauge className="h-3.5 w-3.5" /> {formatScore(entry.average_score, 1)}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-mono text-xs text-ink-600">{formatLatency(entry.average_latency)}</td>
                      <td className="px-5 py-3.5 font-mono text-xs text-ink-600">{entry.total_responses}</td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
