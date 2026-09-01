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
      className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-7"
    >
      <div>
        {kicker && <p className="kicker mb-1.5">{kicker}</p>}
        <h1 className="text-2xl md:text-[28px] font-display font-semibold text-ink-900">{title}</h1>
        {description && <p className="text-sm text-ink-500 mt-1.5 max-w-xl">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </motion.div>
  );
}
