import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles } from 'lucide-react';

export default function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-canvas">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-ink-900 flex items-center justify-center animate-pulseSoft">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <p className="text-xs text-ink-400 font-mono">Loading AgentBench…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
