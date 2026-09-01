import { motion } from 'framer-motion';
import { FolderKanban, Zap, MessageSquareText, Gauge, Crown, Rocket, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAsync } from '../hooks/useAsync';
import { getDashboardStats } from '../api/dashboard';
import { getLeaderboard } from '../api/leaderboard';
import PageHeader from '../components/PageHeader';
import CountUp from '../components/CountUp';
import { SkeletonCardGrid, SkeletonChart } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { formatLatency, formatScore } from '../lib/format';

const CHART_COLORS = ['#3f6ce8', '#26a882', '#eeab2f', '#cf4c4c', '#6690fa', '#45c39e'];

function StatCard({
  icon: Icon,
  label,
  value,
  suffix = '',
  decimals = 0,
  tone = 'accent',
  isText = false,
  textValue,
  index,
}: {
  icon: typeof FolderKanban;
  label: string;
  value?: number;
  suffix?: string;
  decimals?: number;
  tone?: 'accent' | 'teal' | 'amber' | 'ink';
  isText?: boolean;
  textValue?: string | null;
  index: number;
}) {
  const toneClasses: Record<string, string> = {
    accent: 'bg-accent-50 text-accent-600',
    teal: 'bg-teal-50 text-teal-600',
    amber: 'bg-amber-50 text-amber-500',
    ink: 'bg-ink-100 text-ink-700',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06, ease: 'easeOut' }}
      className="panel p-5 hover:shadow-lift transition-shadow duration-300"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${toneClasses[tone]}`}>
          <Icon className="h-[18px] w-[18px]" strokeWidth={1.8} />
        </div>
      </div>
      <p className="label mb-1">{label}</p>
      {isText ? (
        <p className="text-xl font-display font-semibold text-ink-900 truncate" title={textValue ?? undefined}>
          {textValue || <span className="text-ink-300 font-normal text-base">No data yet</span>}
        </p>
      ) : (
        <p className="text-2xl font-display font-semibold text-ink-900">
          <CountUp value={value ?? 0} decimals={decimals} suffix={suffix} />
        </p>
      )}
    </motion.div>
  );
}

export default function Dashboard() {
  const { data: stats, loading: statsLoading, error: statsError } = useAsync(getDashboardStats, []);
  const { data: leaderboard, loading: lbLoading } = useAsync(getLeaderboard, []);

  const hasActivity = (stats?.total_benchmarks ?? 0) > 0;
  const topModels = (leaderboard ?? []).slice(0, 6);

  return (
    <div>
      <PageHeader
        kicker="Overview"
        title="Dashboard"
        description="A live snapshot of every project, benchmark, and model you've evaluated."
        action={
          <Link to="/projects" className="btn-accent">
            <FolderKanban className="h-4 w-4" /> View projects
          </Link>
        }
      />

      {statsLoading ? (
        <SkeletonCardGrid count={6} />
      ) : statsError ? (
        <EmptyState icon={Gauge} title="Couldn't load dashboard stats" description={statsError} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <StatCard icon={FolderKanban} label="Total Projects" value={stats?.total_projects} tone="ink" index={0} />
          <StatCard icon={Zap} label="Total Benchmarks" value={stats?.total_benchmarks} tone="accent" index={1} />
          <StatCard icon={MessageSquareText} label="Total Responses" value={stats?.total_responses} tone="accent" index={2} />
          <StatCard
            icon={Gauge}
            label="Average Score"
            value={stats?.average_score}
            decimals={1}
            tone="teal"
            index={3}
          />
          <StatCard icon={Crown} label="Best Model" isText textValue={stats?.best_model} tone="amber" index={4} />
          <StatCard icon={Rocket} label="Fastest Model" isText textValue={stats?.fastest_model} tone="amber" index={5} />
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-5 mt-6">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="xl:col-span-3 panel p-5"
        >
          <div className="flex items-center justify-between mb-1">
            <div>
              <h3 className="text-sm font-semibold text-ink-800">Model Score Comparison</h3>
              <p className="kicker mt-0.5">Average overall score, 0–100</p>
            </div>
            <Link to="/leaderboard" className="text-xs text-accent-600 hover:underline inline-flex items-center gap-0.5">
              Full leaderboard <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>

          {lbLoading ? (
            <div className="h-64 mt-4"><SkeletonChart height={240} /></div>
          ) : topModels.length === 0 ? (
            <div className="mt-4">
              <EmptyState
                icon={Gauge}
                title="No evaluated benchmarks yet"
                description="Run a benchmark to see model score comparisons here."
              />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={topModels} margin={{ top: 20, right: 12, left: -12, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 6" stroke="#eceef1" vertical={false} />
                <XAxis
                  dataKey="model_name"
                  tick={{ fontSize: 11, fill: '#666c79' }}
                  axisLine={{ stroke: '#e6e4de' }}
                  tickLine={false}
                  interval={0}
                  angle={-12}
                  textAnchor="end"
                  height={50}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 11, fill: '#666c79' }}
                  axisLine={false}
                  tickLine={false}
                  width={30}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(63,108,232,0.05)' }}
                  contentStyle={{
                    borderRadius: 10,
                    border: '1px solid #e6e4de',
                    fontSize: 12,
                    boxShadow: '0 12px 32px -16px rgba(20,22,26,0.2)',
                  }}
                  formatter={(v: unknown) => [formatScore(Number(v), 1), 'Avg. Score']}
                />
                <Bar dataKey="average_score" radius={[6, 6, 0, 0]} maxBarSize={46} animationDuration={900}>
                  {topModels.map((entry, i) => (
                    <Cell key={entry.model_name} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.22 }}
          className="xl:col-span-2 panel p-5"
        >
          <h3 className="text-sm font-semibold text-ink-800">Latency by Model</h3>
          <p className="kicker mt-0.5 mb-4">Average response latency</p>

          {lbLoading ? (
            <SkeletonChart height={240} />
          ) : topModels.length === 0 ? (
            <EmptyState icon={Zap} title="No latency data yet" description="Latency appears after your first benchmark run." />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={topModels} layout="vertical" margin={{ top: 4, right: 20, left: 4, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 6" stroke="#eceef1" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#666c79' }} axisLine={false} tickLine={false} />
                <YAxis
                  type="category"
                  dataKey="model_name"
                  tick={{ fontSize: 11, fill: '#666c79' }}
                  axisLine={false}
                  tickLine={false}
                  width={90}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(63,108,232,0.05)' }}
                  contentStyle={{ borderRadius: 10, border: '1px solid #e6e4de', fontSize: 12 }}
                  formatter={(v: unknown) => [formatLatency(Number(v)), 'Avg. Latency']}
                />
                <Bar dataKey="average_latency" radius={[0, 6, 6, 0]} maxBarSize={20} fill="#6690fa" animationDuration={900} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>
      </div>

      {!hasActivity && !statsLoading && (
        <div className="mt-6">
          <EmptyState
            icon={Rocket}
            title="Run your first benchmark"
            description="Create a project, upload some documents, and run your first benchmark to start populating this dashboard."
            action={
              <Link to="/projects" className="btn-accent">
                <FolderKanban className="h-4 w-4" /> Go to projects
              </Link>
            }
          />
        </div>
      )}
    </div>
  );
}
