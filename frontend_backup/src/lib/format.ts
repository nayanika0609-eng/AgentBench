/** Format a possibly-null 0-100 score. Never coerces null into "0%". */
export function formatScore(value: number | null | undefined, digits = 1): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  return `${value.toFixed(digits)}`;
}

export function isScored(value: number | null | undefined): value is number {
  return value !== null && value !== undefined && !Number.isNaN(value);
}

export function formatLatency(ms: number | null | undefined): string {
  if (ms === null || ms === undefined) return '—';
  if (ms < 1000) return `${Math.round(ms)} ms`;
  return `${(ms / 1000).toFixed(2)} s`;
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

/** Returns a semantic color token (accent/teal/amber/rose) for a 0-100 score. */
export function scoreTone(value: number | null | undefined): 'neutral' | 'good' | 'ok' | 'poor' {
  if (value === null || value === undefined) return 'neutral';
  if (value >= 75) return 'good';
  if (value >= 50) return 'ok';
  return 'poor';
}

export const toneClasses: Record<string, { text: string; bg: string; ring: string; dot: string }> = {
  neutral: { text: 'text-ink-400', bg: 'bg-ink-100', ring: '#d7d4cb', dot: 'bg-ink-300' },
  good: { text: 'text-teal-600', bg: 'bg-teal-50', ring: '#26a882', dot: 'bg-teal-400' },
  ok: { text: 'text-amber-500', bg: 'bg-amber-50', ring: '#eeab2f', dot: 'bg-amber-400' },
  poor: { text: 'text-rose-500', bg: 'bg-rose-50', ring: '#cf4c4c', dot: 'bg-rose-400' },
};

export function truncate(text: string, max = 220): string {
  if (text.length <= max) return text;
  return text.slice(0, max).trimEnd() + '…';
}
