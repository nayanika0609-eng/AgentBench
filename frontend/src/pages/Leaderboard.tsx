import { motion } from 'framer-motion';

import {
  Trophy,
  Medal,
  Gauge,
  Zap,
  Users,
  Crown,
} from 'lucide-react';

import { useAsync } from '../hooks/useAsync';

import { getLeaderboard } from '../api/leaderboard';

import PageHeader from '../components/PageHeader';

import EmptyState from '../components/EmptyState';

import { SkeletonList } from '../components/Skeleton';

import {
  formatLatency,
  formatScore,
} from '../lib/format';

/* =========================================================
   LEADERBOARD PALETTE
   ========================================================= */

const TIER = [
  {
    badge: '01',
    label: 'CHAMPION',
    color: 'var(--chart-purple)',
    background:
      'var(--leader-purple-bg)',
    border:
      'var(--leader-purple-border)',
  },

  {
    badge: '02',
    label: 'RUNNER-UP',
    color: 'var(--chart-cyan)',
    background:
      'var(--leader-cyan-bg)',
    border:
      'var(--leader-cyan-border)',
  },

  {
    badge: '03',
    label: 'BRONZE',
    color: 'var(--chart-slate)',
    background:
      'var(--leader-slate-bg)',
    border:
      'var(--leader-slate-border)',
  },
];

/* =========================================================
   RANK TILE
   ========================================================= */

function RankTile({
  entry,
  rank,
  maxScore,
}: {
  entry: {
    model_name: string;
    average_score: number;
    average_latency: number;
    total_responses: number;
  };

  rank: number;

  maxScore: number;
}) {

  const t =
    TIER[rank - 1];

  const isTop =
    rank === 1;

  return (

    <motion.div
      initial={{
        opacity: 0,
        y: 18,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        delay:
          (rank - 1) *
          0.1,
        duration: 0.4,
      }}
      className="panel p-5 relative overflow-hidden"
      style={{
        background:
          t.background,
        borderColor:
          t.border,
      }}
    >

      {isTop && (

        <div
          className="absolute -right-10 -top-10 h-32 w-32 rounded-full blur-3xl"
          style={{
            backgroundColor:
              t.color,
            opacity: 0.07,
          }}
        />

      )}

      {/* TOP */}

      <div className="relative flex items-start justify-between mb-5">

        <div
          className="h-11 w-11 border-2 flex items-center justify-center font-mono font-bold text-lg"
          style={{
            borderColor:
              t.color,
            color:
              t.color,
            backgroundColor:
              'var(--surface)',
          }}
        >
          {t.badge}
        </div>

        <div
          className="flex items-center gap-1.5 font-mono text-[10px] font-semibold"
          style={{
            color:
              t.color,
          }}
        >

          {isTop ? (

            <Crown
              className="h-3.5 w-3.5"
              strokeWidth={1.8}
            />

          ) : (

            <Medal
              className="h-3.5 w-3.5"
              strokeWidth={1.8}
            />

          )}

          {t.label}

        </div>

      </div>

      {/* MODEL */}

      <p
        className="font-mono text-sm font-semibold text-ink-900 truncate"
        title={
          entry.model_name
        }
      >
        {entry.model_name}
      </p>

      {/* SCORE */}

      <div className="flex items-end justify-between mt-2">

        <p
          className="text-3xl font-display font-bold"
          style={{
            color:
              t.color,
          }}
        >
          {formatScore(
            entry.average_score,
            1,
          )}
        </p>

        <span className="font-mono text-[10px] text-ink-600">
          AVG SCORE
        </span>

      </div>

      {/* PERFORMANCE */}

      <div className="mt-4">

        <div
          className="h-2 w-full overflow-hidden"
          style={{
            backgroundColor:
              'var(--progress-track)',
            border:
              '1px solid var(--line-soft)',
          }}
        >

          <motion.div
            initial={{
              width: 0,
            }}
            animate={{
              width: `${
                Math.max(
                  0,
                  Math.min(
                    100,
                    (entry.average_score /
                      maxScore) *
                      100,
                  ),
                )
              }%`,
            }}
            transition={{
              duration: 0.9,
              delay:
                0.2 +
                (rank - 1) *
                  0.1,
            }}
            className="h-full"
            style={{
              backgroundColor:
                t.color,
              boxShadow:
                isTop
                  ? `0 0 12px color-mix(in srgb, ${t.color} 35%, transparent)`
                  : 'none',
            }}
          />

        </div>

        <div className="flex justify-between mt-2 font-mono text-[10px] text-ink-600">

          <span>
            PERFORMANCE
          </span>

          <span>
            {formatLatency(
              entry.average_latency,
            )}{' '}
            AVG LATENCY
          </span>

        </div>

      </div>

    </motion.div>
  );
}

/* =========================================================
   MAIN
   ========================================================= */

export default function Leaderboard() {

  const {
    data: entries,
    loading,
    error,
  } = useAsync(
    getLeaderboard,
    [],
  );

  const ranked =
    (entries ?? [])
      .slice()
      .sort(
        (a, b) =>
          b.average_score -
          a.average_score,
      );

  const maxScore =
    Math.max(
      ...ranked.map(
        (entry) =>
          entry.average_score,
      ),
      1,
    );

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

        <EmptyState
          icon={Trophy}
          title="Couldn't load leaderboard"
          description={
            error
          }
        />

      ) : ranked.length === 0 ? (

        <EmptyState
          icon={Trophy}
          title="No ranked models yet"
          description="Run and evaluate a benchmark to populate the leaderboard."
        />

      ) : (

        <>

          {/* =================================================
              PERFORMANCE ARENA
              ================================================= */}

          <div className="panel p-4 mb-4 grid-panel">

            <div className="flex items-center justify-between border-b border-line-soft pb-3 mb-4">

              <div>

                <p className="terminal-label">
                  GLOBAL RANKING
                </p>

                <p
                  className="font-display text-lg font-bold mt-1"
                  style={{
                    color:
                      'var(--chart-purple)',
                  }}
                >
                  MODEL PERFORMANCE ARENA
                </p>

              </div>

              <Trophy
                className="h-5 w-5"
                style={{
                  color:
                    'var(--chart-purple)',
                }}
              />

            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

              {ranked
                .slice(0, 3)
                .map(
                  (
                    entry,
                    index,
                  ) => (

                    <RankTile
                      key={
                        entry.model_name
                      }
                      entry={
                        entry
                      }
                      rank={
                        index + 1
                      }
                      maxScore={
                        maxScore
                      }
                    />

                  ),
                )}

            </div>

          </div>

          {/* =================================================
              FULL STANDINGS
              ================================================= */}

          <div className="panel overflow-hidden">

            <div className="px-5 pt-5 pb-3 border-b border-line-soft">

              <p className="terminal-label">
                FULL STANDINGS
              </p>

            </div>

            <div className="overflow-x-auto">

              <table className="w-full text-sm">

                <thead>

                  <tr className="border-b border-line-soft text-left">

                    <th className="px-5 py-3 font-medium text-ink-600 text-[10px] uppercase tracking-[0.12em] w-20">
                      Rank
                    </th>

                    <th className="px-5 py-3 font-medium text-ink-600 text-[10px] uppercase tracking-[0.12em]">
                      Model
                    </th>

                    <th className="px-5 py-3 font-medium text-ink-600 text-[10px] uppercase tracking-[0.12em]">
                      Avg. Score
                    </th>

                    <th className="px-5 py-3 font-medium text-ink-600 text-[10px] uppercase tracking-[0.12em]">
                      Progress
                    </th>

                    <th className="px-5 py-3 font-medium text-ink-600 text-[10px] uppercase tracking-[0.12em]">
                      Avg. Latency
                    </th>

                    <th className="px-5 py-3 font-medium text-ink-600 text-[10px] uppercase tracking-[0.12em]">
                      Responses
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {ranked.map(
                    (
                      entry,
                      index,
                    ) => {

                      const rank =
                        index + 1;

                      const accent =
                        rank === 1
                          ? 'var(--chart-purple)'
                          : rank === 2
                            ? 'var(--chart-cyan)'
                            : rank === 3
                              ? 'var(--chart-slate)'
                              : 'var(--chart-purple)';

                      return (

                        <motion.tr
                          key={
                            entry.model_name
                          }
                          initial={{
                            opacity: 0,
                          }}
                          animate={{
                            opacity: 1,
                          }}
                          transition={{
                            delay:
                              index *
                              0.03,
                          }}
                          className="border-b border-line-soft last:border-0"
                        >

                          {/* RANK */}

                          <td className="px-5 py-3.5">

                            <span
                              className="inline-flex h-7 w-7 items-center justify-center border font-mono text-xs font-bold"
                              style={{
                                borderColor:
                                  `color-mix(in srgb, ${accent} 45%, transparent)`,
                                color:
                                  accent,
                                backgroundColor:
                                  'var(--surface)',
                              }}
                            >
                              {String(
                                rank,
                              ).padStart(
                                2,
                                '0',
                              )}
                            </span>

                          </td>

                          {/* MODEL */}

                          <td className="px-5 py-3.5 font-mono text-sm text-ink-900">
                            {
                              entry.model_name
                            }
                          </td>

                          {/* SCORE */}

                          <td className="px-5 py-3.5">

                            <span
                              className="inline-flex items-center gap-1.5 font-mono font-semibold"
                              style={{
                                color:
                                  accent,
                              }}
                            >

                              <Gauge
                                className="h-3.5 w-3.5"
                                strokeWidth={
                                  1.8
                                }
                              />

                              {formatScore(
                                entry.average_score,
                                1,
                              )}

                            </span>

                          </td>

                          {/* PROGRESS */}

                          <td className="px-5 py-3.5 min-w-[180px]">

                            <div
                              className="h-1.5 overflow-hidden"
                              style={{
                                backgroundColor:
                                  'var(--progress-track)',
                              }}
                            >

                              <div
                                className="h-full"
                                style={{
                                  width: `${
                                    Math.max(
                                      0,
                                      Math.min(
                                        100,
                                        (entry.average_score /
                                          maxScore) *
                                          100,
                                      ),
                                    )
                                  }%`,
                                  backgroundColor:
                                    accent,
                                }}
                              />

                            </div>

                          </td>

                          {/* LATENCY */}

                          <td className="px-5 py-3.5 font-mono text-xs text-ink-700">
                            {formatLatency(
                              entry.average_latency,
                            )}
                          </td>

                          {/* RESPONSES */}

                          <td className="px-5 py-3.5 font-mono text-xs text-ink-700">

                            <span className="inline-flex items-center gap-1.5">

                              <Users
                                className="h-3 w-3"
                                style={{
                                  color:
                                    'var(--chart-purple)',
                                }}
                              />

                              {
                                entry.total_responses
                              }

                            </span>

                          </td>

                        </motion.tr>

                      );
                    },
                  )}

                </tbody>

              </table>

            </div>

          </div>

          {/* FOOTER */}

          <div className="mt-4 flex items-center gap-2 font-mono text-[10px] text-ink-600">

            <Zap
              className="h-3 w-3"
              style={{
                color:
                  'var(--chart-cyan)',
              }}
            />

            Rankings are calculated from the recorded average score and latency data.

          </div>

        </>

      )}

    </div>
  );
}