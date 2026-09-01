import { motion } from 'framer-motion';
import { formatScore, scoreTone, toneClasses } from '../lib/format';

interface ScoreRingProps {
  value: number | null | undefined;
  size?: number;
  strokeWidth?: number;
  label?: string;
}

export default function ScoreRing({ value, size = 76, strokeWidth = 7, label }: ScoreRingProps) {
  const tone = scoreTone(value);
  const colors = toneClasses[tone];
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = value ?? 0;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#eceef1"
            strokeWidth={strokeWidth}
            fill="none"
          />
          {value !== null && value !== undefined && (
            <motion.circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={colors.ring}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              fill="none"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1, ease: 'easeOut', delay: 0.1 }}
            />
          )}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`font-display font-semibold ${colors.text}`} style={{ fontSize: size * 0.24 }}>
            {formatScore(value, 0)}
          </span>
        </div>
      </div>
      {label && <span className="kicker">{label}</span>}
    </div>
  );
}
