import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserPlus, Loader2, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getApiErrorMessage } from '../api/client';
import AuthShell from '../components/AuthShell';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      await register(username, email, password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not create your account.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Create your account" subtitle="Start benchmarking models in minutes.">
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label htmlFor="username" className="label mb-1.5 block">Username</label>
          <input
            id="username"
            required
            autoComplete="username"
            className="input"
            placeholder="jane_doe"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
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
            autoComplete="new-password"
            className="input"
            placeholder="At least 6 characters"
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
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
          {loading ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className="text-sm text-ink-500 text-center mt-6">
        Already have an account?{' '}
        <Link to="/login" className="text-accent-600 font-medium inline-flex items-center gap-0.5 hover:underline">
          Sign in <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </p>
    </AuthShell>
  );
}
