import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  Trophy,
  User as UserIcon,
  LogOut,
  Sparkles,
  ChevronDown,
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/projects', label: 'Projects', icon: FolderKanban },
  { to: '/leaderboard', label: 'Leaderboard', icon: Trophy },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.username?.slice(0, 2).toUpperCase() ?? 'AB';

  return (
    <div className="min-h-screen flex bg-canvas bg-noise">
      <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-line bg-surface-soft/60">
        <div className="h-16 flex items-center gap-2.5 px-6 border-b border-line-soft">
          <div className="h-8 w-8 rounded-lg bg-ink-900 flex items-center justify-center shrink-0">
            <Sparkles className="h-4 w-4 text-white" strokeWidth={2} />
          </div>
          <div>
            <p className="font-display font-semibold text-sm text-ink-900 leading-none">AgentBench</p>
            <p className="kicker mt-0.5">Evaluation Intelligence</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-5 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-white text-ink-900 shadow-soft border border-line'
                    : 'text-ink-500 hover:text-ink-800 hover:bg-white/70 border border-transparent'
                }`
              }
            >
              <item.icon className="h-[18px] w-[18px]" strokeWidth={1.8} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-line-soft">
          <div className="divider-tech mb-3" />
          <div className="px-3 py-2.5 rounded-lg bg-white border border-line-soft">
            <p className="kicker mb-1">System</p>
            <div className="flex items-center gap-1.5 text-xs text-teal-600 font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-teal-400 animate-pulseSoft" />
              API Connected
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-line bg-canvas/80 backdrop-blur-sm sticky top-0 z-30 flex items-center justify-between px-4 md:px-8">
          <div className="md:hidden flex items-center gap-2">
            <div className="h-7 w-7 rounded-md bg-ink-900 flex items-center justify-center">
              <Sparkles className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-display font-semibold text-sm">AgentBench</span>
          </div>
          <div className="hidden md:block" />

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-full border border-line bg-white hover:border-line-strong transition-colors"
            >
              <div className="h-7 w-7 rounded-full bg-accent-500 flex items-center justify-center text-white text-[11px] font-semibold">
                {initials}
              </div>
              <span className="text-sm font-medium text-ink-700 hidden sm:block">{user?.username}</span>
              <ChevronDown className="h-3.5 w-3.5 text-ink-400" />
            </button>

            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute right-0 mt-2 w-52 panel p-1.5 shadow-lift z-40"
              >
                <NavLink
                  to="/profile"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-ink-600 hover:bg-ink-100/60 hover:text-ink-900"
                >
                  <UserIcon className="h-4 w-4" /> Profile
                </NavLink>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-rose-500 hover:bg-rose-50"
                >
                  <LogOut className="h-4 w-4" /> Sign out
                </button>
              </motion.div>
            )}
          </div>
        </header>

        <main className="flex-1 px-4 md:px-8 py-6 md:py-8 max-w-[1400px] w-full mx-auto">
          <Outlet />
        </main>

        <nav className="md:hidden fixed bottom-0 inset-x-0 border-t border-line bg-white/95 backdrop-blur-sm flex items-center justify-around py-2 z-30">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-3 py-1 text-[11px] ${isActive ? 'text-ink-900' : 'text-ink-400'}`
              }
            >
              <item.icon className="h-5 w-5" strokeWidth={1.8} />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}
