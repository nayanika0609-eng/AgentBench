import { motion } from 'framer-motion';
import { formatScore, scoreTone, toneClasses } from '../lib/format';

interface MetricBarProps {
  label: string;
  value: number | null | undefined;
  compact?: boolean;
}

export default function MetricBar({ label, value, compact = false }: MetricBarProps) {
  const tone = scoreTone(value);
  const colors = toneClasses[tone];
  const has = value !== null && value !== undefined;

  return (
    <div className={compact ? 'space-y-1' : 'space-y-1.5'}>
      <div className="flex items-center justify-between">
        <span className={`text-ink-500 ${compact ? 'text-[11px]' : 'text-xs'}`}>{label}</span>
        <span className={`font-mono ${compact ? 'text-[11px]' : 'text-xs'} ${has ? colors.text : 'text-ink-300'}`}>
          {has ? formatScore(value, 1) : 'N/A'}
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-ink-100 overflow-hidden">
        {has && (
          <motion.div
            className={`h-full rounded-full ${colors.dot}`}
            initial={{ width: 0 }}
            animate={{ width: `${Math.max(0, Math.min(100, value))}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        )}
      </div>
    </div>
  );
}
