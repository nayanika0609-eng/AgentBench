import { useEffect, useRef, useState } from 'react';

interface CountUpProps {
  value: number;
  decimals?: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
}

export default function CountUp({ value, decimals = 0, duration = 900, suffix = '', prefix = '' }: CountUpProps) {
  const [display, setDisplay] = useState(0);
  const startRef = useRef<number | null>(null);
  const fromRef = useRef(0);

  useEffect(() => {
    fromRef.current = display;
    startRef.current = null;
    let raf: number;

    const step = (ts: number) => {
      if (startRef.current === null) startRef.current = ts;
      const elapsed = ts - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = fromRef.current + (value - fromRef.current) * eased;
      setDisplay(current);
      if (progress < 1) {
        raf = requestAnimationFrame(step);
      }
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <span className="tabular-nums">
      {prefix}
      {display.toFixed(decimals)}
      {suffix}
    </span>
  );
}
