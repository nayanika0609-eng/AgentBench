import { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
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
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
} from 'recharts';

import { useAsync } from '../hooks/useAsync';
import { getComparison } from '../api/comparison';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';
import { SkeletonChart } from '../components/Skeleton';

import {
  formatLatency,
  formatScore,
  isScored,
  truncate,
} from '../lib/format';

import type { ModelComparison } from '../types';


const CHART_COLORS = [
  '#3f6ce8',
  '#26a882',
  '#eeab2f',
  '#cf4c4c',
  '#6690fa',
  '#45c39e',
];


// --------------------------------------------------
// RAG metric fields
// --------------------------------------------------

type ComparisonWithRag = ModelComparison & {
  context_relevance_score?: number | null;
  faithfulness_score?: number | null;
  answer_relevance_score?: number | null;
  citation_coverage_score?: number | null;
  rag_score?: number | null;
};


// --------------------------------------------------
// Find ALL best models
// Handles ties correctly.
// --------------------------------------------------

function findBest(
  models: ModelComparison[],
  key: keyof ModelComparison,
  lowerIsBetter = false
): ModelComparison[] {

  const scored = models.filter((m) =>
    isScored(m[key] as number | null)
  );

  if (scored.length === 0) {
    return [];
  }

  const values = scored.map(
    (m) => m[key] as number
  );

  const bestValue = lowerIsBetter
    ? Math.min(...values)
    : Math.max(...values);

  return scored.filter(
    (m) =>
      (m[key] as number) === bestValue
  );
}


// --------------------------------------------------
// Winner Card
// --------------------------------------------------

function WinnerCard({
  icon: Icon,
  label,
  models,
  value,
  tone,
}: {
  icon: typeof Trophy;
  label: string;
  models: ModelComparison[];
  value: string;
  tone: string;
}) {

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="panel p-5"
    >

      <div
        className={`h-9 w-9 rounded-lg flex items-center justify-center mb-3 ${tone}`}
      >
        <Icon
          className="h-[18px] w-[18px]"
          strokeWidth={1.8}
        />
      </div>

      <p className="label mb-1">
        {label}
      </p>

      {models.length > 0 ? (
        <>
          {models.length === 1 ? (
            <p className="font-mono text-sm font-semibold text-ink-900 truncate">
              {models[0].model_name}
            </p>
          ) : (
            <>
              <p className="font-mono text-sm font-semibold text-ink-900">
                Tie
              </p>

              <p className="text-xs text-ink-500 mt-1">
                {models
                  .map((m) => m.model_name)
                  .join(' · ')}
              </p>
            </>
          )}

          <p className="text-xs text-ink-400 mt-0.5">
            {value}
          </p>
        </>
      ) : (
        <p className="text-sm text-ink-300">
          Not available
        </p>
      )}

    </motion.div>
  );
}


// --------------------------------------------------
// Main Component
// --------------------------------------------------

export default function ModelComparison() {

  const { benchmarkId } = useParams();

  const id = Number(benchmarkId);

  const {
    data,
    loading,
    error,
  } = useAsync(
    () => getComparison(id),
    [id]
  );

  const models = data?.models ?? [];

  const ragModels =
    models as ComparisonWithRag[];


  // --------------------------------------------------
  // Winners
  // --------------------------------------------------

  const bestOverall = useMemo(
    () =>
      findBest(
        models,
        'overall_score'
      ),
    [models]
  );

  const fastest = useMemo(
    () =>
      findBest(
        models,
        'latency',
        true
      ),
    [models]
  );

  const mostReadable = useMemo(
    () =>
      findBest(
        models,
        'readability_score'
      ),
    [models]
  );

  const bestAdherence = useMemo(
    () =>
      findBest(
        models,
        'prompt_adherence'
      ),
    [models]
  );


  // --------------------------------------------------
  // Best RAG
  // Uses the overall RAG score.
  // --------------------------------------------------

  const bestRag = useMemo(
    () => {

      const scored = ragModels.filter(
        (m) =>
          isScored(
            m.rag_score ?? null
          )
      );

      if (scored.length === 0) {
        return [];
      }

      const bestValue = Math.max(
        ...scored.map(
          (m) => m.rag_score as number
        )
      );

      return scored.filter(
        (m) =>
          m.rag_score === bestValue
      );
    },
    [ragModels]
  );


  // --------------------------------------------------
  // RAG availability
  // --------------------------------------------------

  const hasRagData = ragModels.some(
    (m) =>
      isScored(
        m.rag_score ?? null
      ) ||
      isScored(
        m.context_relevance_score ?? null
      ) ||
      isScored(
        m.faithfulness_score ?? null
      ) ||
      isScored(
        m.answer_relevance_score ?? null
      ) ||
      isScored(
        m.citation_coverage_score ?? null
      )
  );


  // --------------------------------------------------
  // Radar
  //
  // Metrics where EVERY model is N/A are removed.
  // --------------------------------------------------

  const radarData = useMemo(() => {

    const allMetrics: {
      key:
        | keyof ModelComparison
        | 'context_relevance_score'
        | 'faithfulness_score'
        | 'answer_relevance_score'
        | 'citation_coverage_score'
        | 'rag_score';

      label: string;
    }[] = [

      {
        key: 'readability_score',
        label: 'Readability',
      },

      {
        key: 'keyword_score',
        label: 'Keyword',
      },

      {
        key: 'prompt_adherence',
        label: 'Adherence',
      },

      {
        key: 'completeness_score',
        label: 'Completeness',
      },
    ];


    // Only include metrics that have
    // at least one real score.
    const availableMetrics =
      allMetrics.filter(
        (metric) =>
          models.some(
            (m) =>
              isScored(
                m[metric.key as keyof ModelComparison] as
                  | number
                  | null
              )
          )
      );


    return availableMetrics.map(
      (metric) => {

        const row: Record<
          string,
          string | number
        > = {
          metric: metric.label,
        };

        models.forEach(
          (m) => {

            const value =
              m[
                metric.key as keyof ModelComparison
              ] as number | null;

            if (isScored(value)) {
              row[m.model_name] = value;
            }
          }
        );

        return row;
      }
    );

  }, [models]);


  // --------------------------------------------------
  // Radar subtitle
  // --------------------------------------------------

  const radarLabels =
    radarData
      .map((item) => item.metric)
      .join(' · ');


  // --------------------------------------------------
  // Loading / Error / Empty
  // --------------------------------------------------

  return (
    <div>

      <Link
        to={`/benchmarks/${id}/results`}
        className="inline-flex items-center gap-1.5 text-xs text-ink-500 hover:text-ink-800 mb-4"
      >
        <ArrowLeft className="h-3.5 w-3.5" />

        Back to results
      </Link>


      <PageHeader
        kicker="Model Comparison"
        title={
          data
            ? truncate(
                data.prompt,
                90
              )
            : 'Loading…'
        }
        description={
          models.length > 0
            ? `Comparing ${models.length} models head-to-head`
            : undefined
        }
      />


      {loading ? (

        <SkeletonChart
          height={320}
        />

      ) : error ? (

        <EmptyState
          icon={GitCompare}
          title="Couldn't load comparison"
          description={error}
        />

      ) : models.length === 0 ? (

        <EmptyState
          icon={GitCompare}
          title="Nothing to compare"
          description="This benchmark has no model responses yet."
        />

      ) : (

        <div className="space-y-6">


          {/* ------------------------------------------------
              WINNER CARDS
          ------------------------------------------------ */}

          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >

            <WinnerCard
              icon={Trophy}
              label="Best Overall"
              models={bestOverall}
              value={
                bestOverall.length > 0
                  ? formatScore(
                      bestOverall[0].overall_score,
                      1
                    )
                  : ''
              }
              tone="bg-amber-50 text-amber-500"
            />


            <WinnerCard
              icon={Zap}
              label="Fastest"
              models={fastest}
              value={
                fastest.length > 0
                  ? formatLatency(
                      fastest[0].latency
                    )
                  : ''
              }
              tone="bg-accent-50 text-accent-600"
            />


            <WinnerCard
              icon={BookOpenCheck}
              label="Most Readable"
              models={mostReadable}
              value={
                mostReadable.length > 0
                  ? formatScore(
                      mostReadable[0].readability_score,
                      1
                    )
                  : ''
              }
              tone="bg-teal-50 text-teal-600"
            />


            <WinnerCard
              icon={Target}
              label="Best Adherence"
              models={bestAdherence}
              value={
                bestAdherence.length > 0
                  ? formatScore(
                      bestAdherence[0].prompt_adherence,
                      1
                    )
                  : ''
              }
              tone="bg-ink-100 text-ink-700"
            />

          </div>


          {/* ------------------------------------------------
              BEST RAG
          ------------------------------------------------ */}

          {hasRagData && (

            <WinnerCard
              icon={ListChecks}
              label="Best for RAG"
              models={bestRag}
              value={
                bestRag.length > 0
                  ? formatScore(
                      bestRag[0].rag_score,
                      1
                    )
                  : ''
              }
              tone="bg-teal-50 text-teal-600"
            />

          )}


          {/* ------------------------------------------------
              OVERALL + LATENCY
          ------------------------------------------------ */}

          <div
            className="grid grid-cols-1 xl:grid-cols-2 gap-5"
          >

            {/* Overall */}

            <div className="panel p-5">

              <h3 className="text-sm font-semibold text-ink-800 mb-1">
                Overall Score
              </h3>

              <p className="kicker mb-4">
                Higher is better
              </p>

              <ResponsiveContainer
                width="100%"
                height={280}
              >

                <BarChart
                  data={models}
                  margin={{
                    top: 10,
                    right: 12,
                    left: -12,
                    bottom: 0,
                  }}
                >

                  <CartesianGrid
                    strokeDasharray="3 6"
                    stroke="#eceef1"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="model_name"
                    tick={{
                      fontSize: 11,
                      fill: '#666c79',
                    }}
                    axisLine={{
                      stroke: '#e6e4de',
                    }}
                    tickLine={false}
                    interval={0}
                    angle={-12}
                    textAnchor="end"
                    height={50}
                  />

                  <YAxis
                    domain={[0, 100]}
                    tick={{
                      fontSize: 11,
                      fill: '#666c79',
                    }}
                    axisLine={false}
                    tickLine={false}
                    width={30}
                  />

                  <Tooltip
                    contentStyle={{
                      borderRadius: 10,
                      border: '1px solid #e6e4de',
                      fontSize: 12,
                    }}
                    formatter={(v: unknown) => [
                      formatScore(
                        Number(v),
                        1
                      ),
                      'Score',
                    ]}
                  />

                  <Bar
                    dataKey="overall_score"
                    radius={[
                      6,
                      6,
                      0,
                      0,
                    ]}
                    maxBarSize={46}
                    animationDuration={900}
                  >

                    {models.map(
                      (m, i) => (

                        <Cell
                          key={m.model_name}
                          fill={
                            CHART_COLORS[
                              i %
                                CHART_COLORS.length
                            ]
                          }
                        />

                      )
                    )}

                  </Bar>

                </BarChart>

              </ResponsiveContainer>

            </div>


            {/* Latency */}

            <div className="panel p-5">

              <h3 className="text-sm font-semibold text-ink-800 mb-1">
                Latency
              </h3>

              <p className="kicker mb-4">
                Lower is better · seconds
              </p>

              <ResponsiveContainer
                width="100%"
                height={280}
              >

                <BarChart
                  data={models.map((m) => ({
                    ...m,
                    latency_seconds:
                      m.latency != null
                        ? m.latency / 1000
                        : null,
                  }))}
                  margin={{
                    top: 10,
                    right: 12,
                    left: -12,
                    bottom: 0,
                  }}
                >

                  <CartesianGrid
                    strokeDasharray="3 6"
                    stroke="#eceef1"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="model_name"
                    tick={{
                      fontSize: 11,
                      fill: '#666c79',
                    }}
                    axisLine={{
                      stroke: '#e6e4de',
                    }}
                    tickLine={false}
                    interval={0}
                    angle={-12}
                    textAnchor="end"
                    height={50}
                  />

                  <YAxis
                    tick={{
                      fontSize: 11,
                      fill: '#666c79',
                    }}
                    axisLine={false}
                    tickLine={false}
                    width={40}
                  />

                  <Tooltip
                    contentStyle={{
                      borderRadius: 10,
                      border: '1px solid #e6e4de',
                      fontSize: 12,
                    }}
                    formatter={(v: unknown) => [
                      `${Number(v).toFixed(2)} s`,
                      'Latency',
                    ]}
                  />

                  <Bar
                    dataKey="latency_seconds"
                    radius={[
                      6,
                      6,
                      0,
                      0,
                    ]}
                    maxBarSize={46}
                    fill="#6690fa"
                    animationDuration={900}
                  />

                </BarChart>

              </ResponsiveContainer>

            </div>

          </div>


          {/* ------------------------------------------------
              RADAR
          ------------------------------------------------ */}

          {radarData.length > 0 && (

            <div className="panel p-5">

              <h3 className="text-sm font-semibold text-ink-800 mb-1">
                Metric Radar
              </h3>

              <p className="kicker mb-4">
                {radarLabels}
              </p>

              <ResponsiveContainer
                width="100%"
                height={360}
              >

                <RadarChart
                  data={radarData}
                  outerRadius="72%"
                >

                  <PolarGrid
                    stroke="#e6e4de"
                  />

                  <PolarAngleAxis
                    dataKey="metric"
                    tick={{
                      fontSize: 12,
                      fill: '#464b57',
                    }}
                  />

                  <PolarRadiusAxis
                    domain={[0, 100]}
                    tick={{
                      fontSize: 10,
                      fill: '#8b909c',
                    }}
                    axisLine={false}
                  />

                  {models.map(
                    (m, i) => (

                      <Radar
                        key={m.model_name}
                        name={m.model_name}
                        dataKey={m.model_name}
                        stroke={
                          CHART_COLORS[
                            i %
                              CHART_COLORS.length
                          ]
                        }
                        fill={
                          CHART_COLORS[
                            i %
                              CHART_COLORS.length
                          ]
                        }
                        fillOpacity={0.12}
                        strokeWidth={2}
                        animationDuration={900}
                        connectNulls={false}
                      />

                    )
                  )}

                  <Legend
                    wrapperStyle={{
                      fontSize: 12,
                    }}
                  />

                  <Tooltip
                    contentStyle={{
                      borderRadius: 10,
                      border: '1px solid #e6e4de',
                      fontSize: 12,
                    }}
                  />

                </RadarChart>

              </ResponsiveContainer>

            </div>

          )}


          {/* ------------------------------------------------
              COMPARISON TABLE
          ------------------------------------------------ */}

          <div className="panel overflow-x-auto">

            <table className="w-full text-sm">

              <thead>

                <tr className="border-b border-line-soft text-left">

                  <th className="px-5 py-3 font-medium text-ink-500 text-xs uppercase tracking-wide">
                    Model
                  </th>

                  <th className="px-5 py-3 font-medium text-ink-500 text-xs uppercase tracking-wide">
                    Overall
                  </th>

                  <th className="px-5 py-3 font-medium text-ink-500 text-xs uppercase tracking-wide">
                    Latency
                  </th>

                  <th className="px-5 py-3 font-medium text-ink-500 text-xs uppercase tracking-wide">
                    Readability
                  </th>

                  <th className="px-5 py-3 font-medium text-ink-500 text-xs uppercase tracking-wide">
                    Keyword
                  </th>

                  <th className="px-5 py-3 font-medium text-ink-500 text-xs uppercase tracking-wide">
                    Adherence
                  </th>

                  <th className="px-5 py-3 font-medium text-ink-500 text-xs uppercase tracking-wide">
                    Completeness
                  </th>

                  {hasRagData && (
                    <>
                      <th className="px-5 py-3 font-medium text-ink-500 text-xs uppercase tracking-wide">
                        Context Relevance
                      </th>

                      <th className="px-5 py-3 font-medium text-ink-500 text-xs uppercase tracking-wide">
                        Faithfulness
                      </th>

                      <th className="px-5 py-3 font-medium text-ink-500 text-xs uppercase tracking-wide">
                        Answer Relevance
                      </th>

                      <th className="px-5 py-3 font-medium text-ink-500 text-xs uppercase tracking-wide">
                        Citation Coverage
                      </th>

                      <th className="px-5 py-3 font-medium text-ink-500 text-xs uppercase tracking-wide">
                        RAG Score
                      </th>
                    </>
                  )}

                </tr>

              </thead>


              <tbody>

                {ragModels.map(
                  (m) => (

                    <tr
                      key={m.model_name}
                      className="border-b border-line-soft last:border-0"
                    >

                      <td className="px-5 py-3 font-mono text-xs text-ink-800">
                        {m.model_name}
                      </td>

                      <td className="px-5 py-3 font-mono text-xs text-ink-700">
                        {formatScore(
                          m.overall_score,
                          1
                        )}
                      </td>

                      <td className="px-5 py-3 font-mono text-xs text-ink-700">
                        {formatLatency(
                          m.latency
                        )}
                      </td>

                      <td className="px-5 py-3 font-mono text-xs text-ink-700">
                        {formatScore(
                          m.readability_score,
                          1
                        )}
                      </td>

                      <td className="px-5 py-3 font-mono text-xs text-ink-700">
                        {formatScore(
                          m.keyword_score,
                          1
                        )}
                      </td>

                      <td className="px-5 py-3 font-mono text-xs text-ink-700">
                        {formatScore(
                          m.prompt_adherence,
                          1
                        )}
                      </td>

                      <td className="px-5 py-3 font-mono text-xs text-ink-700">
                        {formatScore(
                          m.completeness_score,
                          1
                        )}
                      </td>


                      {hasRagData && (
                        <>

                          <td className="px-5 py-3 font-mono text-xs text-ink-700">
                            {formatScore(
                              m.context_relevance_score,
                              1
                            )}
                          </td>

                          <td className="px-5 py-3 font-mono text-xs text-ink-700">
                            {formatScore(
                              m.faithfulness_score,
                              1
                            )}
                          </td>

                          <td className="px-5 py-3 font-mono text-xs text-ink-700">
                            {formatScore(
                              m.answer_relevance_score,
                              1
                            )}
                          </td>

                          <td className="px-5 py-3 font-mono text-xs text-ink-700">
                            {formatScore(
                              m.citation_coverage_score,
                              1
                            )}
                          </td>

                          <td className="px-5 py-3 font-mono text-xs text-ink-700">
                            {formatScore(
                              m.rag_score,
                              1
                            )}
                          </td>

                        </>
                      )}

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        </div>
      )}

    </div>
  );
}