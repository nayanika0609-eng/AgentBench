import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

export default function PageHeader({
  kicker,
  title,
  description,
  action,
}: {
  kicker?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8"
    >
      <div>
        {kicker && <p className="terminal-label mb-2">{kicker}</p>}
        <h1 className="text-3xl md:text-[34px] font-display font-bold text-accent-400">{title}</h1>
        {description && <p className="text-sm text-ink-500 mt-2 max-w-2xl leading-relaxed">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </motion.div>
  );
}
