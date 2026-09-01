import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Loader2, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getApiErrorMessage } from '../api/client';
import AuthShell from '../components/AuthShell';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err, 'Invalid email or password.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to continue evaluating your models."
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label htmlFor="email" className="label mb-1.5 block">Email</label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            className="input"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="password" className="label mb-1.5 block">Password</label>
          <input
            id="password"
            type="password"
            required
            autoComplete="current-password"
            className="input"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-rose-500 bg-rose-50 border border-rose-100 rounded-lg px-3 py-2"
            role="alert"
          >
            {error}
          </motion.p>
        )}

        <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <p className="text-sm text-ink-500 text-center mt-6">
        Don&apos;t have an account?{' '}
        <Link to="/register" className="text-accent-600 font-medium inline-flex items-center gap-0.5 hover:underline">
          Create one <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </p>
    </AuthShell>
  );
}
