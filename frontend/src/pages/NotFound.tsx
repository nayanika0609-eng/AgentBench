import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-canvas text-center px-6">
      <div className="h-12 w-12 rounded-xl bg-surface border border-line flex items-center justify-center shadow-soft mb-4">
        <Compass className="h-5 w-5 text-ink-400" strokeWidth={1.7} />
      </div>
      <h1 className="text-2xl font-display font-semibold text-ink-900">Page not found</h1>
      <p className="text-sm text-ink-500 mt-1.5 max-w-sm">The page you're looking for doesn't exist or has moved.</p>
      <Link to="/dashboard" className="btn-accent mt-6">Back to dashboard</Link>
    </div>
  );
}
