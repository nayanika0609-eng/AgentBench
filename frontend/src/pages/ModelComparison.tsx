import { useMemo } from 'react';

import {
  useParams,
  Link,
} from 'react-router-dom';

import { motion } from 'framer-motion';

import {
  ArrowLeft,
  GitCompare,
  Trophy,
  Zap,
  BookOpenCheck,
  Target,
  ListChecks,
} from 'lucide-react';

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

import {
  useAsync,
} from '../hooks/useAsync';

import {
  getComparison,
} from '../api/comparison';

import PageHeader from '../components/PageHeader';

import EmptyState from '../components/EmptyState';

import {
  SkeletonChart,
} from '../components/Skeleton';

import {
  formatLatency,
  formatScore,
  isScored,
  truncate,
} from '../lib/format';

import type {
  ModelComparison,
} from '../types';

/* =========================================================
   PROJECT THEME
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
   RAG TYPE
   ========================================================= */

type ComparisonWithRag =
  ModelComparison & {
    context_relevance_score?:
      number | null;

    faithfulness_score?:
      number | null;

    answer_relevance_score?:
      number | null;

    citation_coverage_score?:
      number | null;

    rag_score?:
      number | null;
  };

/* =========================================================
   FIND BEST
   ========================================================= */

function findBest(
  models: ModelComparison[],
  key: keyof ModelComparison,
  lowerIsBetter = false,
): ModelComparison[] {

  const scored =
    models.filter(
      (model) =>
        isScored(
          model[key] as
            | number
            | null,
        ),
    );

  if (
    scored.length ===
    0
  ) {
    return [];
  }

  const values =
    scored.map(
      (model) =>
        model[key] as number,
    );

  const bestValue =
    lowerIsBetter
      ? Math.min(
          ...values,
        )
      : Math.max(
          ...values,
        );

  return scored.filter(
    (model) =>
      (model[key] as number) ===
      bestValue,
  );
}

/* =========================================================
   WINNER CARD
   ========================================================= */

function WinnerCard({
  icon: Icon,
  label,
  models,
  value,
  color,
}: {
  icon: typeof Trophy;
  label: string;
  models: ModelComparison[];
  value: string;
  color: string;
}) {

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 12,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      className="panel p-4 relative overflow-hidden"
      style={{
        borderColor:
          `color-mix(in srgb, ${color} 32%, transparent)`,
      }}
    >

      <div
        className="absolute top-0 right-0 h-20 w-20 rounded-full blur-3xl"
        style={{
          backgroundColor:
            color,
          opacity: 0.07,
        }}
      />

      <div
        className="h-9 w-9 border flex items-center justify-center mb-3"
        style={{
          borderColor:
            `color-mix(in srgb, ${color} 38%, transparent)`,
          backgroundColor:
            `color-mix(in srgb, ${color} 7%, transparent)`,
          color,
        }}
      >

        <Icon
          className="h-[17px] w-[17px]"
          strokeWidth={1.7}
        />

      </div>

      <p className="terminal-label mb-1">
        {label}
      </p>

      {models.length > 0 ? (

        <>

          {models.length === 1 ? (

            <p className="font-mono text-sm font-semibold text-ink-900 truncate">
              {
                models[0]
                  .model_name
              }
            </p>

          ) : (

            <>

              <p
                className="font-mono text-sm font-semibold"
                style={{
                  color,
                }}
              >
                TIE / {models.length} MODELS
              </p>

              <p className="text-[11px] text-ink-700 mt-1 truncate">
                {models
                  .map(
                    (
                      model,
                    ) =>
                      model.model_name,
                  )
                  .join(
                    ' · ',
                  )}
              </p>

            </>

          )}

          <p
            className="font-mono text-xs mt-1"
            style={{
              color,
            }}
          >
            {value}
          </p>

        </>

      ) : (

        <p className="text-sm text-ink-600">
          Not available
        </p>

      )}

    </motion.div>
  );
}

/* =========================================================
   MAIN
   ========================================================= */

export default function ModelComparison() {

  const {
    benchmarkId,
  } = useParams();

  const id =
    Number(benchmarkId);

  const {
    data,
    loading,
    error,
  } = useAsync(
    () =>
      getComparison(id),
    [id],
  );

  const models =
    data?.models ?? [];

  const ragModels =
    models as ComparisonWithRag[];

  /* =======================================================
     WINNERS
     ======================================================= */

  const bestOverall =
    useMemo(
      () =>
        findBest(
          models,
          'overall_score',
        ),
      [models],
    );

  const fastest =
    useMemo(
      () =>
        findBest(
          models,
          'latency',
          true,
        ),
      [models],
    );

  const mostReadable =
    useMemo(
      () =>
        findBest(
          models,
          'readability_score',
        ),
      [models],
    );

  const bestAdherence =
    useMemo(
      () =>
        findBest(
          models,
          'prompt_adherence',
        ),
      [models],
    );

  const bestRag =
    useMemo(() => {

      const scored =
        ragModels.filter(
          (model) =>
            isScored(
              model.rag_score ??
                null,
            ),
        );

      if (
        scored.length ===
        0
      ) {
        return [];
      }

      const bestValue =
        Math.max(
          ...scored.map(
            (model) =>
              model.rag_score as number,
          ),
        );

      return scored.filter(
        (model) =>
          model.rag_score ===
          bestValue,
      );

    }, [ragModels]);

  /* =======================================================
     RAG
     ======================================================= */

  const hasRagData =
    ragModels.some(
      (model) =>
        isScored(
          model.rag_score ??
            null,
        ) ||
        isScored(
          model.context_relevance_score ??
            null,
        ) ||
        isScored(
          model.faithfulness_score ??
            null,
        ) ||
        isScored(
          model.answer_relevance_score ??
            null,
        ) ||
        isScored(
          model.citation_coverage_score ??
            null,
        ),
    );

  /* =======================================================
     RADAR
     ======================================================= */

  const radarData =
    useMemo(() => {

      const metrics = [
        {
          key:
            'readability_score' as const,
          label:
            'Readability',
        },
        {
          key:
            'keyword_score' as const,
          label:
            'Keyword',
        },
        {
          key:
            'prompt_adherence' as const,
          label:
            'Adherence',
        },
        {
          key:
            'completeness_score' as const,
          label:
            'Completeness',
        },
      ].filter(
        (metric) =>
          models.some(
            (model) =>
              isScored(
                model[
                  metric.key
                ],
              ),
          ),
      );

      return metrics.map(
        (metric) => {

          const row: Record<
            string,
            string | number
          > = {
            metric:
              metric.label,
          };

          models.forEach(
            (model) => {

              const value =
                model[
                  metric.key
                ];

              if (
                isScored(value)
              ) {
                row[
                  model.model_name
                ] = value;
              }

            },
          );

          return row;
        },
      );

    }, [models]);

  /* =======================================================
     SCORE
     ======================================================= */

  const scoreData =
    useMemo(
      () =>
        models.map(
          (model) => ({
            model:
              model.model_name,
            score:
              model.overall_score,
          }),
        ),
      [models],
    );

  /* =======================================================
     LATENCY
     ======================================================= */

  const latencyData =
    useMemo(
      () =>
        models.map(
          (model) => ({
            model:
              model.model_name,
            latency:
              model.latency !=
              null
                ? model.latency /
                  1000
                : null,
          }),
        ),
      [models],
    );

  return (
    <div>

      {/* BACK */}

      <Link
        to={`/benchmarks/${id}/results`}
        className="inline-flex items-center gap-1.5 text-xs text-ink-700 hover:text-accent-400 mb-5 font-mono"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        BACK TO RESULTS
      </Link>

      {/* HEADER */}

      <PageHeader
        kicker="Evaluation / Model Comparison"
        title={
          data
            ? truncate(
                data.prompt,
                90,
              )
            : 'Loading…'
        }
        description={
          models.length >
          0
            ? `Comparing ${models.length} models head-to-head using the recorded evaluation metrics.`
            : undefined
        }
      />

      {/* STATES */}

      {loading ? (

        <SkeletonChart
          height={320}
        />

      ) : error ? (

        <EmptyState
          icon={GitCompare}
          title="Couldn't load comparison"
          description={
            error
          }
        />

      ) : models.length === 0 ? (

        <EmptyState
          icon={GitCompare}
          title="Nothing to compare"
          description="This benchmark has no model responses yet."
        />

      ) : (

        <div className="space-y-4">

          {/* =================================================
              WINNER CARDS
              ================================================= */}

          <div
            className={`grid grid-cols-1 sm:grid-cols-2 ${
              hasRagData
                ? 'lg:grid-cols-5'
                : 'lg:grid-cols-4'
            } gap-3`}
          >

            <WinnerCard
              icon={Trophy}
              label="Best Overall"
              models={
                bestOverall
              }
              value={
                bestOverall.length
                  ? formatScore(
                      bestOverall[0]
                        .overall_score,
                      1,
                    )
                  : ''
              }
              color="var(--chart-purple)"
            />

            <WinnerCard
              icon={Zap}
              label="Fastest"
              models={
                fastest
              }
              value={
                fastest.length
                  ? formatLatency(
                      fastest[0]
                        .latency,
                    )
                  : ''
              }
              color="var(--chart-cyan)"
            />

            <WinnerCard
              icon={
                BookOpenCheck
              }
              label="Most Readable"
              models={
                mostReadable
              }
              value={
                mostReadable.length
                  ? formatScore(
                      mostReadable[0]
                        .readability_score,
                      1,
                    )
                  : ''
              }
              color="var(--chart-teal)"
            />

            <WinnerCard
              icon={Target}
              label="Best Adherence"
              models={
                bestAdherence
              }
              value={
                bestAdherence.length
                  ? formatScore(
                      bestAdherence[0]
                        .prompt_adherence,
                      1,
                    )
                  : ''
              }
              color="var(--chart-purple)"
            />

            {hasRagData && (

              <WinnerCard
                icon={
                  ListChecks
                }
                label="Best for RAG"
                models={
                  bestRag
                }
                value={
                  bestRag.length
                    ? formatScore(
                        bestRag[0]
                          .rag_score,
                        1,
                      )
                    : ''
                }
                color="var(--chart-cyan)"
              />

            )}

          </div>

          {/* =================================================
              BAR CHARTS
              ================================================= */}

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">

            {/* SCORE */}

            <div className="panel p-5">

              <div className="flex items-start justify-between">

                <div>

                  <h3 className="text-base font-bold text-ink-900">
                    Overall Score
                  </h3>

                  <p className="terminal-label mt-1">
                    HIGHER IS BETTER / 0–100
                  </p>

                </div>

                <span
                  className="font-mono text-[10px]"
                  style={{
                    color:
                      'var(--chart-purple)',
                  }}
                >
                  SCORE
                </span>

              </div>

              <ResponsiveContainer
                width="100%"
                height={320}
              >

                <BarChart
                  data={
                    scoreData
                  }
                  margin={{
                    top: 25,
                    right: 20,
                    left: -5,
                    bottom: 10,
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
                    width={30}
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
                      6,
                      6,
                      0,
                      0,
                    ]}
                    maxBarSize={85}
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

            </div>

            {/* LATENCY */}

            <div className="panel p-5">

              <div className="flex items-start justify-between">

                <div>

                  <h3 className="text-base font-bold text-ink-900">
                    Latency
                  </h3>

                  <p className="terminal-label mt-1">
                    LOWER IS BETTER / SECONDS
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

              <ResponsiveContainer
                width="100%"
                height={320}
              >

                <BarChart
                  data={
                    latencyData
                  }
                  margin={{
                    top: 25,
                    right: 20,
                    left: -5,
                    bottom: 10,
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
                      6,
                      6,
                      0,
                      0,
                    ]}
                    maxBarSize={85}
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

            </div>

          </div>

          {/* =================================================
              RADAR
              ================================================= */}

          {radarData.length >
            0 && (

            <div className="panel p-5">

              <div className="flex items-start justify-between">

                <div>

                  <h3 className="text-base font-bold text-ink-900">
                    Metric Radar
                  </h3>

                  <p className="terminal-label mt-1">
                    {radarData
                      .map(
                        (
                          item,
                        ) =>
                          item.metric,
                      )
                      .join(
                        ' · ',
                      )}
                  </p>

                </div>

                <span
                  className="font-mono text-[10px]"
                  style={{
                    color:
                      'var(--chart-purple)',
                  }}
                >
                  MULTI-METRIC
                </span>

              </div>

              <ResponsiveContainer
                width="100%"
                height={430}
              >

                <RadarChart
                  data={
                    radarData
                  }
                  outerRadius="70%"
                >

                  <PolarGrid
                    stroke={
                      'var(--radar-grid)'
                    }
                    strokeWidth={1}
                  />

                  <PolarAngleAxis
                    dataKey="metric"
                    tick={{
                      fontSize: 12,
                      fill:
                        'var(--radar-text)',
                    }}
                  />

                  <PolarRadiusAxis
                    domain={[
                      0,
                      100,
                    ]}
                    tick={{
                      fontSize: 10,
                      fill:
                        'var(--radar-text)',
                    }}
                    axisLine={false}
                    tickCount={5}
                  />

                  {models.map(
                    (
                      model,
                      index,
                    ) => {

                      const color =
                        CHART_COLORS[
                          index %
                            CHART_COLORS.length
                        ];

                      return (

                        <Radar
                          key={
                            model.model_name
                          }
                          name={
                            model.model_name
                          }
                          dataKey={
                            model.model_name
                          }
                          stroke={
                            color
                          }
                          fill={
                            color
                          }
                          fillOpacity={
                            0.16
                          }
                          strokeWidth={
                            2.5
                          }
                          animationDuration={
                            900
                          }
                          connectNulls={
                            false
                          }
                        />

                      );
                    },
                  )}

                  <Legend
                    wrapperStyle={{
                      fontSize: 12,
                      paddingTop: 10,
                      color:
                        'var(--radar-text)',
                    }}
                  />

                  <Tooltip
                    contentStyle={{
                      background:
                        PANEL,
                      border: `1px solid ${GRID}`,
                      borderRadius: 6,
                      color:
                        'var(--ink-900)',
                      fontSize: 12,
                    }}
                  />

                </RadarChart>

              </ResponsiveContainer>

            </div>

          )}

          {/* =================================================
              TABLE
              ================================================= */}

          <div className="panel overflow-x-auto">

            <div className="px-5 pt-5 pb-3">

              <h3 className="text-base font-bold text-ink-900">
                Metric Comparison
              </h3>

              <p className="terminal-label mt-1">
                RECORDED EVALUATION DATA
              </p>

            </div>

            <table className="w-full text-sm">

              <thead>

                <tr className="border-y border-line-soft text-left">

                  {[
                    'Model',
                    'Overall',
                    'Latency',
                    'Readability',
                    'Keyword',
                    'Adherence',
                    'Completeness',
                  ].map(
                    (label) => (

                      <th
                        key={
                          label
                        }
                        className="px-5 py-3 font-medium text-ink-600 text-[10px] uppercase tracking-[0.12em] whitespace-nowrap"
                      >
                        {
                          label
                        }
                      </th>

                    ),
                  )}

                  {hasRagData && (

                    <>
                      {[
                        'Context',
                        'Faithfulness',
                        'Answer Relevance',
                        'Citation',
                        'RAG',
                      ].map(
                        (label) => (

                          <th
                            key={
                              label
                            }
                            className="px-5 py-3 font-medium text-ink-600 text-[10px] uppercase tracking-[0.12em] whitespace-nowrap"
                          >
                            {
                              label
                            }
                          </th>

                        ),
                      )}
                    </>

                  )}

                </tr>

              </thead>

              <tbody>

                {ragModels.map(
                  (
                    model,
                    index,
                  ) => {

                    const color =
                      CHART_COLORS[
                        index %
                          CHART_COLORS.length
                      ];

                    return (

                      <tr
                        key={
                          model.model_name
                        }
                        className="border-b border-line-soft last:border-0"
                      >

                        <td
                          className="px-5 py-3.5 font-mono text-xs whitespace-nowrap font-semibold"
                          style={{
                            color,
                          }}
                        >
                          {
                            model.model_name
                          }
                        </td>

                        <td className="px-5 py-3.5 font-mono text-xs text-ink-900 whitespace-nowrap">
                          {formatScore(
                            model.overall_score,
                            1,
                          )}
                        </td>

                        <td className="px-5 py-3.5 font-mono text-xs text-ink-700 whitespace-nowrap">
                          {formatLatency(
                            model.latency,
                          )}
                        </td>

                        <td className="px-5 py-3.5 font-mono text-xs text-ink-800 whitespace-nowrap">
                          {formatScore(
                            model.readability_score,
                            1,
                          )}
                        </td>

                        <td className="px-5 py-3.5 font-mono text-xs text-ink-800 whitespace-nowrap">
                          {formatScore(
                            model.keyword_score,
                            1,
                          )}
                        </td>

                        <td className="px-5 py-3.5 font-mono text-xs text-ink-800 whitespace-nowrap">
                          {formatScore(
                            model.prompt_adherence,
                            1,
                          )}
                        </td>

                        <td className="px-5 py-3.5 font-mono text-xs text-ink-800 whitespace-nowrap">
                          {formatScore(
                            model.completeness_score,
                            1,
                          )}
                        </td>

                        {hasRagData && (

                          <>

                            <td className="px-5 py-3.5 font-mono text-xs text-ink-800 whitespace-nowrap">
                              {formatScore(
                                model.context_relevance_score,
                                1,
                              )}
                            </td>

                            <td className="px-5 py-3.5 font-mono text-xs text-ink-800 whitespace-nowrap">
                              {formatScore(
                                model.faithfulness_score,
                                1,
                              )}
                            </td>

                            <td className="px-5 py-3.5 font-mono text-xs text-ink-800 whitespace-nowrap">
                              {formatScore(
                                model.answer_relevance_score,
                                1,
                              )}
                            </td>

                            <td className="px-5 py-3.5 font-mono text-xs text-ink-800 whitespace-nowrap">
                              {formatScore(
                                model.citation_coverage_score,
                                1,
                              )}
                            </td>

                            <td
                              className="px-5 py-3.5 font-mono text-xs font-semibold whitespace-nowrap"
                              style={{
                                color:
                                  'var(--chart-purple)',
                              }}
                            >
                              {formatScore(
                                model.rag_score,
                                1,
                              )}
                            </td>

                          </>

                        )}

                      </tr>

                    );
                  },
                )}

              </tbody>

            </table>

          </div>

        </div>

      )}

    </div>
  );
}