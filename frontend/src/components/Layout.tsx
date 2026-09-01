import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  Trophy,
  User as UserIcon,
  LogOut,
  ChevronDown,
  GitCompare,
  Sun,
  Moon,
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import darkLogo from '../assets/agentbench-dark.png';
import lightLogo from '../assets/agentbench-light.png';
const navItems = [
  {
    to: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
  },
  {
    to: '/projects',
    label: 'Projects',
    icon: FolderKanban,
  },
  {
    to: '/comparison',
    label: 'Comparison',
    icon: GitCompare,
  },
  {
    to: '/leaderboard',
    label: 'Leaderboard',
    icon: Trophy,
  },
];

function getInitialTheme(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  const saved = localStorage.getItem('agentbench-theme');

  if (saved === 'dark') {
    return true;
  }

  if (saved === 'light') {
    return false;
  }

  return window.matchMedia(
    '(prefers-color-scheme: dark)',
  ).matches;
}

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [dark, setDark] = useState(getInitialTheme);

  const menuRef = useRef<HTMLDivElement>(null);

  /* ======================================================
     THEME
     ====================================================== */

  useEffect(() => {
    const root = document.documentElement;

    root.classList.toggle('dark', dark);

    localStorage.setItem(
      'agentbench-theme',
      dark ? 'dark' : 'light',
    );

    root.style.colorScheme = dark ? 'dark' : 'light';
  }, [dark]);

  /* ======================================================
     CLOSE USER MENU
     ====================================================== */

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(
          event.target as Node,
        )
      ) {
        setMenuOpen(false);
      }
    };

    document.addEventListener(
      'mousedown',
      handleOutsideClick,
    );

    return () => {
      document.removeEventListener(
        'mousedown',
        handleOutsideClick,
      );
    };
  }, []);

  /* ======================================================
     ACTIONS
     ====================================================== */

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials =
    user?.username
      ?.slice(0, 2)
      .toUpperCase() ?? 'AB';

  /* ======================================================
     UI
     ====================================================== */

  return (
    <div className="min-h-screen flex bg-canvas bg-noise text-ink-800">

      {/* ==================================================
          SIDEBAR
          ================================================== */}

      <aside
        className="
          hidden
          md:flex
          w-64
          shrink-0
          flex-col
          border-r
          border-line
          bg-surface-soft/95
        "
      >

        {/* BRAND */}

       <div className="h-20 flex items-center px-5 border-b border-line">
  <img
    src={dark ? darkLogo : lightLogo}
    alt="AgentBench"
    className="h-16 w-auto max-w-[220px] object-contain object-left"
  />
</div>

        {/* NAVIGATION LABEL */}

        <div className="px-5 pt-6 pb-2 terminal-label">
          Navigation
        </div>

        {/* NAVIGATION */}

        <nav className="flex-1 px-3 py-2 space-y-1">

          {navItems.map((item) => (

            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `
                relative
                flex
                items-center
                gap-3
                px-3
                py-3
                rounded-md
                text-sm
                font-medium
                transition-colors
                duration-150
                ${
                  isActive
                    ? `
                      bg-accent-100
                      text-accent-500
                      border
                      border-accent-400/35
                    `
                    : `
                      text-ink-700
                      hover:text-accent-500
                      hover:bg-accent-50
                      border
                      border-transparent
                    `
                }
                `
              }
            >

              {({ isActive }) => (
                <>

                  {isActive && (
                    <span
                      className="
                        absolute
                        left-0
                        top-2
                        bottom-2
                        w-[2px]
                        bg-accent-400
                      "
                    />
                  )}

                  <item.icon
                    className={`
                      h-[17px]
                      w-[17px]
                      shrink-0
                      ${
                        isActive
                          ? 'text-accent-500'
                          : 'text-ink-600'
                      }
                    `}
                    strokeWidth={1.8}
                  />

                  <span>
                    {item.label}
                  </span>

                </>
              )}

            </NavLink>

          ))}

        </nav>

        {/* ==================================================
            SYSTEM SECTION REMOVED
            ==================================================

            API_CONNECTED
            LOCAL EVALUATION NODE
            SYSTEM

            intentionally removed
        */}

      </aside>

      {/* ==================================================
          MAIN
          ================================================== */}

      <div className="flex-1 flex flex-col min-w-0">

        {/* HEADER */}

        <header
          className="
            h-16
            border-b
            border-line
            bg-canvas/90
            backdrop-blur-sm
            sticky
            top-0
            z-30
            flex
            items-center
            justify-between
            px-4
            md:px-8
          "
        >

          {/* BREADCRUMB */}

          <div
            className="
              hidden
              md:flex
              items-center
              gap-2
              font-mono
              text-[11px]
              text-ink-500
            "
          >

            <span className="text-accent-500">
              AGENTBENCH
            </span>

            <span className="text-ink-400">
              /
            </span>

            <span>
              WORKSPACE
            </span>

          </div>

          {/* RIGHT SIDE */}

          <div className="ml-auto flex items-center gap-2">

            {/* ==================================================
                THEME TOGGLE
                ================================================== */}

            <button
              type="button"
              onClick={() =>
                setDark((current) => !current)
              }
              className="
                h-10
                w-10
                flex
                items-center
                justify-center
                rounded-md
                border
                border-line
                bg-surface
                text-accent-500
                hover:border-accent-400/50
                hover:bg-accent-50
                transition-colors
                duration-150
              "
              title={
                dark
                  ? 'Switch to light mode'
                  : 'Switch to dark mode'
              }
              aria-label={
                dark
                  ? 'Switch to light mode'
                  : 'Switch to dark mode'
              }
            >

              {dark ? (
                <Sun
                  className="h-4 w-4"
                  strokeWidth={1.8}
                />
              ) : (
                <Moon
                  className="h-4 w-4"
                  strokeWidth={1.8}
                />
              )}

            </button>

            {/* ==================================================
                USER MENU
                ================================================== */}

            <div
              className="relative"
              ref={menuRef}
            >

              <button
                type="button"
                onClick={() =>
                  setMenuOpen(
                    (current) => !current,
                  )
                }
                className="
                  flex
                  items-center
                  gap-2.5
                  pl-2
                  pr-3
                  py-1.5
                  border
                  border-line
                  bg-surface
                  text-ink-800
                  hover:border-line-strong
                  hover:bg-accent-50
                  transition-colors
                  duration-150
                "
              >

                <div
                  className="
                    h-7
                    w-7
                    border
                    border-accent-400/40
                    bg-accent-50
                    flex
                    items-center
                    justify-center
                    text-accent-500
                    text-[11px]
                    font-mono
                    font-semibold
                  "
                >
                  {initials}
                </div>

                <span
                  className="
                    text-sm
                    font-medium
                    text-ink-800
                    hidden
                    sm:block
                  "
                >
                  {user?.username}
                </span>

                <ChevronDown
                  className="h-3.5 w-3.5 text-ink-600"
                  strokeWidth={1.8}
                />

              </button>

              {/* USER DROPDOWN */}

              {menuOpen && (

                <motion.div
                  initial={{
                    opacity: 0,
                    y: -6,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    duration: 0.15,
                  }}
                  className="
                    absolute
                    right-0
                    mt-2
                    w-52
                    panel
                    p-1.5
                    z-40
                  "
                >

                  <NavLink
                    to="/profile"
                    onClick={() =>
                      setMenuOpen(false)
                    }
                    className="
                      flex
                      items-center
                      gap-2.5
                      px-3
                      py-2.5
                      rounded-md
                      text-sm
                      text-ink-700
                      hover:bg-accent-50
                      hover:text-accent-500
                      transition-colors
                    "
                  >

                    <UserIcon
                      className="h-4 w-4"
                      strokeWidth={1.8}
                    />

                    Profile

                  </NavLink>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="
                      w-full
                      flex
                      items-center
                      gap-2.5
                      px-3
                      py-2.5
                      rounded-md
                      text-sm
                      text-rose-400
                      hover:bg-rose-50
                      transition-colors
                    "
                  >

                    <LogOut
                      className="h-4 w-4"
                      strokeWidth={1.8}
                    />

                    Sign out

                  </button>

                </motion.div>

              )}

            </div>

          </div>

        </header>

        {/* CONTENT */}

        <main
          className="
            flex-1
            px-5
            md:px-8
            py-7
            md:py-9
            max-w-[1440px]
            w-full
            mx-auto
          "
        >
          <Outlet />
        </main>

      </div>

    </div>
  );
}