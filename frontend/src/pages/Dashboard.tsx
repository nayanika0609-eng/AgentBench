import { useMemo } from 'react';

import { motion } from 'framer-motion';

import {
  FolderKanban,
  Zap,
  MessageSquareText,
  Gauge,
  Crown,
  Rocket,
  ArrowUpRight,
  Activity,
  Database,
} from 'lucide-react';

import { Link } from 'react-router-dom';

import { useAsync } from '../hooks/useAsync';

import {
  getDashboardStats,
} from '../api/dashboard';

import {
  getLeaderboard,
} from '../api/leaderboard';

import {
  listProjects,
} from '../api/projects';

import {
  listProjectBenchmarks,
  getBenchmarkResults,
} from '../api/benchmarks';

import PageHeader from '../components/PageHeader';

import CountUp from '../components/CountUp';

import {
  SkeletonCardGrid,
  SkeletonChart,
} from '../components/Skeleton';

import EmptyState from '../components/EmptyState';

import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

import {
  formatScore,
} from '../lib/format';

import type {
  Benchmark,
} from '../types';

/* =========================================================
   PROJECT CHART PALETTE
   ========================================================= */

const CHART_COLORS = [
  'var(--chart-purple)',
  'var(--chart-cyan)',
  'var(--chart-teal)',
  'var(--chart-slate)',
];

const GRID =
  'var(--chart-grid)';

const MUTED =
  'var(--chart-text)';

const PANEL =
  'var(--chart-panel)';

/* =========================================================
   STAT CARD
   ========================================================= */

function StatCard({
  icon: Icon,
  label,
  value,
  suffix = '',
  decimals = 0,
  tone = 'purple',
  isText = false,
  textValue,
  index,
}: {
  icon: typeof FolderKanban;
  label: string;
  value?: number;
  suffix?: string;
  decimals?: number;
  tone?: 'purple' | 'cyan';
  isText?: boolean;
  textValue?: string | null;
  index: number;
}) {
  const accent =
    tone === 'cyan'
      ? 'var(--chart-cyan)'
      : 'var(--chart-purple)';

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 14,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.35,
        delay: index * 0.06,
        ease: 'easeOut',
      }}
      className="panel p-5 grid-panel relative overflow-hidden"
    >

      {/* subtle decorative glow */}

      <div
        className="absolute right-0 top-0 h-20 w-20 rounded-full blur-3xl"
        style={{
          backgroundColor: accent,
          opacity: 0.06,
        }}
      />

      <div className="flex items-center justify-between mb-5">

        <div
          className="h-9 w-9 border flex items-center justify-center"
          style={{
            borderColor: `color-mix(in srgb, ${accent} 35%, transparent)`,
            backgroundColor: `color-mix(in srgb, ${accent} 8%, transparent)`,
            color: accent,
          }}
        >
          <Icon
            className="h-[17px] w-[17px]"
            strokeWidth={1.7}
          />
        </div>

        <span className="terminal-label">
          METRIC_
          {String(index + 1).padStart(
            2,
            '0',
          )}
        </span>

      </div>

      <p className="label mb-1">
        {label}
      </p>

      {isText ? (

        <p
          className="text-xl font-display font-bold truncate"
          style={{
            color: accent,
          }}
          title={
            textValue ??
            undefined
          }
        >
          {textValue || (
            <span className="text-ink-600 font-normal text-base">
              No data
            </span>
          )}
        </p>

      ) : (

        <p className="text-2xl font-display font-bold text-ink-900">
          <CountUp
            value={
              value ?? 0
            }
            decimals={
              decimals
            }
            suffix={
              suffix
            }
          />
        </p>

      )}

    </motion.div>
  );
}

/* =========================================================
   ACTIVITY
   ========================================================= */

interface ActivityItem {
  id: number;
  prompt: string;
  responses: number;
  created_at: string;
}

async function loadBenchmarkActivity(): Promise<
  ActivityItem[]
> {
  const projects =
    await listProjects();

  const benchmarkGroups =
    await Promise.all(
      projects.map(
        async (
          project,
        ) => {
          try {
            return await listProjectBenchmarks(
              project.id,
            );
          } catch {
            return [];
          }
        },
      ),
    );

  const benchmarks =
    benchmarkGroups
      .flat()
      .sort(
        (a, b) =>
          new Date(
            b.created_at,
          ).getTime() -
          new Date(
            a.created_at,
          ).getTime(),
      )
      .slice(
        0,
        12,
      );

  return await Promise.all(
    benchmarks.map(
      async (
        benchmark: Benchmark,
      ) => {
        try {
          const results =
            await getBenchmarkResults(
              benchmark.id,
            );

          return {
            id: benchmark.id,
            prompt:
              benchmark.prompt,
            responses:
              results.length,
            created_at:
              benchmark.created_at,
          };
        } catch {
          return {
            id: benchmark.id,
            prompt:
              benchmark.prompt,
            responses: 0,
            created_at:
              benchmark.created_at,
          };
        }
      },
    ),
  );
}

/* =========================================================
   DASHBOARD
   ========================================================= */

export default function Dashboard() {

  const {
    data: stats,
    loading: statsLoading,
    error: statsError,
  } = useAsync(
    getDashboardStats,
    [],
  );

  const {
    data: leaderboard,
    loading: lbLoading,
  } = useAsync(
    getLeaderboard,
    [],
  );

  const {
    data: activity,
    loading: activityLoading,
  } = useAsync(
    loadBenchmarkActivity,
    [],
  );

  const hasActivity =
    (stats?.total_benchmarks ??
      0) > 0;

  const topModels =
    (leaderboard ?? [])
      .slice()
      .sort(
        (a, b) =>
          b.average_score -
          a.average_score,
      )
      .slice(
        0,
        6,
      );

  /* =======================================================
     SCORE DATA
     ======================================================= */

  const scoreData =
    useMemo(
      () =>
        topModels.map(
          (model) => ({
            model:
              model.model_name,
            score:
              model.average_score,
          }),
        ),
      [topModels],
    );

  /* =======================================================
     LATENCY DATA
     ======================================================= */

  const latencyData =
    useMemo(
      () =>
        topModels.map(
          (model) => ({
            model:
              model.model_name,
            latency:
              model.average_latency /
              1000,
          }),
        ),
      [topModels],
    );

  /* =======================================================
     RESPONSE SCALE
     ======================================================= */

  const maxResponses =
    Math.max(
      ...(activity ?? []).map(
        (item) =>
          item.responses,
      ),
      1,
    );

  return (
    <div>

      <PageHeader
        kicker="System / Overview"
        title="Dashboard"
        description="Live evaluation telemetry across your AgentBench projects, benchmarks, and models."
        action={
          <Link
            to="/projects"
            className="btn-accent"
          >
            <FolderKanban className="h-4 w-4" />
            View projects
          </Link>
        }
      />

      {/* STATUS */}

      <div className="flex items-center gap-2 mb-4 font-mono text-[10px] text-ink-600">

        <span
          className="h-1.5 w-1.5 rounded-full animate-pulseSoft"
          style={{
            backgroundColor:
              'var(--chart-purple)',
          }}
        />

        NODE ONLINE

        <span className="text-ink-400">
          /
        </span>

        EVALUATION TELEMETRY ACTIVE

      </div>

      {/* =====================================================
          STATISTICS
          ===================================================== */}

      {statsLoading ? (

        <SkeletonCardGrid count={6} />

      ) : statsError ? (

        <EmptyState
          icon={Gauge}
          title="Couldn't load dashboard stats"
          description={
            statsError
          }
        />

      ) : (

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">

          <StatCard
            icon={FolderKanban}
            label="Total Projects"
            value={
              stats?.total_projects
            }
            index={0}
          />

          <StatCard
            icon={Zap}
            label="Total Benchmarks"
            value={
              stats?.total_benchmarks
            }
            index={1}
          />

          <StatCard
            icon={MessageSquareText}
            label="Total Responses"
            value={
              stats?.total_responses
            }
            index={2}
          />

          <StatCard
            icon={Gauge}
            label="Average Score"
            value={
              stats?.average_score
            }
            decimals={1}
            index={3}
          />

          <StatCard
            icon={Crown}
            label="Best Model"
            isText
            textValue={
              stats?.best_model
            }
            index={4}
          />

          <StatCard
            icon={Rocket}
            label="Fastest Model"
            isText
            textValue={
              stats?.fastest_model
            }
            tone="cyan"
            index={5}
          />

        </div>
      )}

      {/* =====================================================
          CHARTS
          ===================================================== */}

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4 mt-5">

        {/* SCORE */}

        <motion.div
          initial={{
            opacity: 0,
            y: 14,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.4,
            delay: 0.15,
          }}
          className="xl:col-span-3 panel p-5"
        >

          <div className="flex items-center justify-between mb-1">

            <div>

              <h3 className="text-base font-bold text-ink-900">
                Model Score Comparison
              </h3>

              <p className="terminal-label mt-1">
                AVERAGE OVERALL SCORE / 0–100
              </p>

            </div>

            <Link
              to="/leaderboard"
              className="text-xs inline-flex items-center gap-1 font-mono"
              style={{
                color:
                  'var(--chart-purple)',
              }}
            >
              LEADERBOARD
              <ArrowUpRight className="h-3 w-3" />
            </Link>

          </div>

          {lbLoading ? (

            <div className="h-64 mt-4">
              <SkeletonChart
                height={240}
              />
            </div>

          ) : topModels.length === 0 ? (

            <div className="mt-4">
              <EmptyState
                icon={Gauge}
                title="No evaluated benchmarks yet"
                description="Run a benchmark to see model score comparisons here."
              />
            </div>

          ) : (

            <ResponsiveContainer
              width="100%"
              height={300}
            >

              <BarChart
                data={
                  scoreData
                }
                margin={{
                  top: 20,
                  right: 20,
                  left: -8,
                  bottom: 8,
                }}
              >

                <CartesianGrid
                  strokeDasharray="2 5"
                  stroke={GRID}
                  vertical={false}
                />

                <XAxis
                  dataKey="model"
                  tick={{
                    fontSize: 11,
                    fill: MUTED,
                  }}
                  axisLine={{
                    stroke:
                      GRID,
                  }}
                  tickLine={false}
                  interval={0}
                />

                <YAxis
                  domain={[
                    0,
                    100,
                  ]}
                  tick={{
                    fontSize: 10,
                    fill: MUTED,
                  }}
                  axisLine={false}
                  tickLine={false}
                  width={32}
                />

                <Tooltip
                  cursor={{
                    fill: 'transparent',
                  }}
                  contentStyle={{
                    background:
                      PANEL,
                    border: `1px solid ${GRID}`,
                    borderRadius: 6,
                    color:
                      'var(--ink-900)',
                    fontSize: 12,
                  }}
                  labelStyle={{
                    color:
                      'var(--ink-900)',
                  }}
                  formatter={(
                    value: unknown,
                  ) => [
                    formatScore(
                      Number(
                        value,
                      ),
                      1,
                    ),
                    'Score',
                  ]}
                />

                <Bar
                  dataKey="score"
                  radius={[
                    5,
                    5,
                    0,
                    0,
                  ]}
                  maxBarSize={76}
                >

                  {scoreData.map(
                    (
                      _,
                      index,
                    ) => (
                      <Cell
                        key={
                          index
                        }
                        fill={
                          CHART_COLORS[
                            index %
                              CHART_COLORS.length
                          ]
                        }
                      />
                    ),
                  )}

                </Bar>

              </BarChart>

            </ResponsiveContainer>

          )}

        </motion.div>

        {/* =================================================
            LATENCY
            ================================================= */}

        <motion.div
          initial={{
            opacity: 0,
            y: 14,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.4,
            delay: 0.22,
          }}
          className="xl:col-span-2 panel p-5"
        >

          <div className="flex items-start justify-between">

            <div>

              <h3 className="text-base font-bold text-ink-900">
                Latency by Model
              </h3>

              <p className="terminal-label mt-1 mb-4">
                AVERAGE RESPONSE LATENCY / SECONDS
              </p>

            </div>

            <span
              className="font-mono text-[10px]"
              style={{
                color:
                  'var(--chart-cyan)',
              }}
            >
              TIME
            </span>

          </div>

          {lbLoading ? (

            <SkeletonChart
              height={240}
            />

          ) : topModels.length === 0 ? (

            <EmptyState
              icon={Zap}
              title="No latency data yet"
              description="Latency appears after your first benchmark run."
            />

          ) : (

            <ResponsiveContainer
              width="100%"
              height={300}
            >

              <BarChart
                data={
                  latencyData
                }
                margin={{
                  top: 20,
                  right: 20,
                  left: -8,
                  bottom: 8,
                }}
              >

                <CartesianGrid
                  strokeDasharray="2 5"
                  stroke={GRID}
                  vertical={false}
                />

                <XAxis
                  dataKey="model"
                  tick={{
                    fontSize: 11,
                    fill: MUTED,
                  }}
                  axisLine={{
                    stroke:
                      GRID,
                  }}
                  tickLine={false}
                  interval={0}
                />

                <YAxis
                  tick={{
                    fontSize: 10,
                    fill: MUTED,
                  }}
                  axisLine={false}
                  tickLine={false}
                  width={42}
                />

                <Tooltip
                  cursor={{
                    fill: 'transparent',
                  }}
                  contentStyle={{
                    background:
                      PANEL,
                    border: `1px solid ${GRID}`,
                    borderRadius: 6,
                    color:
                      'var(--ink-900)',
                    fontSize: 12,
                  }}
                  labelStyle={{
                    color:
                      'var(--ink-900)',
                  }}
                  formatter={(
                    value: unknown,
                  ) => [
                    `${Number(
                      value,
                    ).toFixed(2)} s`,
                    'Latency',
                  ]}
                />

                <Bar
                  dataKey="latency"
                  radius={[
                    5,
                    5,
                    0,
                    0,
                  ]}
                  maxBarSize={76}
                >

                  {latencyData.map(
                    (
                      _,
                      index,
                    ) => (
                      <Cell
                        key={
                          index
                        }
                        fill={
                          CHART_COLORS[
                            index %
                              CHART_COLORS.length
                          ]
                        }
                      />
                    ),
                  )}

                </Bar>

              </BarChart>

            </ResponsiveContainer>

          )}

        </motion.div>

      </div>

      {/* =====================================================
          BENCHMARK RESPONSE GRID
          ===================================================== */}

      <motion.div
        initial={{
          opacity: 0,
          y: 14,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.4,
          delay: 0.28,
        }}
        className="panel p-5 mt-4"
      >

        <div className="flex items-center justify-between mb-5">

          <div>

            <h3 className="text-base font-bold text-ink-900">
              Benchmark Response Grid
            </h3>

            <p className="terminal-label mt-1">
              ACTUAL RESPONSES PER RECENT BENCHMARK / 1 BLOCK = 1 RESPONSE
            </p>

          </div>

          <Activity
            className="h-4 w-4"
            style={{
              color:
                'var(--chart-purple)',
            }}
          />

        </div>

        {activityLoading ? (

          <div className="h-40 animate-pulseSoft border border-line bg-surface-soft" />

        ) : activity &&
          activity.length > 0 ? (

          <div className="space-y-4">

            {activity.map(
              (item) => {

                const blocks =
                  Math.min(
                    item.responses,
                    40,
                  );

                const intensity =
                  0.55 +
                  (item.responses /
                    maxResponses) *
                    0.45;

                return (

                  <div
                    key={
                      item.id
                    }
                    className="grid grid-cols-1 lg:grid-cols-[minmax(280px,0.8fr)_1fr_auto] gap-4 items-center"
                  >

                    <div className="min-w-0">

                      <p
                        className="font-display text-sm text-ink-900 leading-6 truncate"
                        title={
                          item.prompt
                        }
                      >
                        {
                          item.prompt
                        }
                      </p>

                      <p className="terminal-label mt-1">
                        BENCHMARK_
                        {String(
                          item.id,
                        ).padStart(
                          3,
                          '0',
                        )}
                      </p>

                    </div>

                    {/* FILLED RESPONSE BLOCKS */}

                    <div className="flex flex-wrap gap-1.5 min-h-5">

                      {Array.from(
                        {
                          length:
                            blocks,
                        },
                      ).map(
                        (
                          _,
                          index,
                        ) => (

                          <span
                            key={`${item.id}-${index}`}
                            className="benchmark-block"
                            style={{
                              opacity:
                                intensity,
                              backgroundColor:
                                index %
                                  3 ===
                                0
                                  ? 'var(--chart-purple)'
                                  : index %
                                      3 ===
                                    1
                                    ? 'var(--chart-cyan)'
                                    : 'var(--chart-teal)',
                            }}
                            title={`Response ${
                              index +
                              1
                            }`}
                          />

                        ),
                      )}

                      {item.responses >
                        40 && (

                        <span
                          className="font-mono text-[10px] self-center ml-1"
                          style={{
                            color:
                              'var(--chart-purple)',
                          }}
                        >
                          +
                          {item.responses -
                            40}
                        </span>

                      )}

                    </div>

                    <span
                      className="font-mono text-xs whitespace-nowrap"
                      style={{
                        color:
                          'var(--chart-purple)',
                      }}
                    >
                      {
                        item.responses
                      }{' '}
                      RESP.
                    </span>

                  </div>
                );
              },
            )}

          </div>

        ) : (

          <div className="py-10 text-center border border-line bg-surface-soft">

            <Database className="h-5 w-5 text-ink-500 mx-auto mb-2" />

            <p className="font-display text-sm text-ink-700">
              No benchmark responses yet.
            </p>

          </div>

        )}

      </motion.div>

      {!hasActivity &&
        !statsLoading && (

          <div className="mt-4">

            <EmptyState
              icon={Rocket}
              title="Run your first benchmark"
              description="Create a project, upload some documents, and run your first benchmark to start populating this dashboard."
              action={
                <Link
                  to="/projects"
                  className="btn-accent"
                >
                  <FolderKanban className="h-4 w-4" />
                  Go to projects
                </Link>
              }
            />

          </div>

        )}

    </div>
  );
}