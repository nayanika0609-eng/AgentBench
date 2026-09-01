import { motion } from 'framer-motion';
import { LogOut, Mail, User as UserIcon, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/PageHeader';

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.username?.slice(0, 2).toUpperCase() ?? 'AB';

  return (
    <div>
      <PageHeader kicker="Account" title="Profile" description="Manage your AgentBench account." />

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="panel p-6 max-w-lg">
        <div className="flex items-center gap-4 mb-6">
          <div className="h-14 w-14 rounded-full bg-accent-500 flex items-center justify-center text-white text-lg font-semibold shrink-0">
            {initials}
          </div>
          <div>
            <p className="font-display font-semibold text-ink-900">{user?.username}</p>
            <p className="text-sm text-ink-500">{user?.email}</p>
          </div>
        </div>

        <div className="divider-tech mb-5" />

        <div className="space-y-4">
          <div className="flex items-center gap-3 text-sm">
            <UserIcon className="h-4 w-4 text-ink-400 shrink-0" />
            <span className="text-ink-500 w-24">Username</span>
            <span className="text-ink-800 font-medium">{user?.username}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Mail className="h-4 w-4 text-ink-400 shrink-0" />
            <span className="text-ink-500 w-24">Email</span>
            <span className="text-ink-800 font-medium">{user?.email}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <ShieldCheck className="h-4 w-4 text-ink-400 shrink-0" />
            <span className="text-ink-500 w-24">User ID</span>
            <span className="text-ink-800 font-mono text-xs">#{user?.id}</span>
          </div>
        </div>

        <div className="divider-tech my-5" />

        <button onClick={handleLogout} className="btn-danger w-full">
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </motion.div>
    </div>
  );
}
