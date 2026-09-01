import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export default function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center text-center py-16 px-6 rounded-xl2 border border-dashed border-line-strong bg-surface-soft"
    >
      <div className="h-12 w-12 rounded-xl bg-white border border-line flex items-center justify-center shadow-soft mb-4">
        <Icon className="h-5 w-5 text-ink-400" strokeWidth={1.75} />
      </div>
      <h3 className="text-sm font-semibold text-ink-800">{title}</h3>
      {description && <p className="text-sm text-ink-500 mt-1.5 max-w-sm">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </motion.div>
  );
}
