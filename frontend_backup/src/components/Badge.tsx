import type { ReactNode } from 'react';

type Tone = 'neutral' | 'good' | 'ok' | 'poor' | 'accent';

const toneMap: Record<Tone, string> = {
  neutral: 'bg-ink-100 text-ink-600',
  good: 'bg-teal-50 text-teal-600',
  ok: 'bg-amber-50 text-amber-500',
  poor: 'bg-rose-50 text-rose-500',
  accent: 'bg-accent-50 text-accent-600',
};

export default function Badge({ tone = 'neutral', children }: { tone?: Tone; children: ReactNode }) {
  return <span className={`badge ${toneMap[tone]}`}>{children}</span>;
}
