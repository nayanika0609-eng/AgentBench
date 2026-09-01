/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',

  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],

  theme: {
    extend: {
      fontFamily: {
        sans: ['"Times New Roman"', 'Times', 'serif'],
        display: ['"Times New Roman"', 'Times', 'serif'],
        mono: ['"JetBrains Mono"', '"Courier New"', 'monospace'],
      },

      colors: {
        canvas: 'rgb(var(--canvas) / <alpha-value>)',

        surface: {
          DEFAULT: 'rgb(var(--surface) / <alpha-value>)',
          soft: 'rgb(var(--surface-soft) / <alpha-value>)',
          cool: 'rgb(var(--surface-cool) / <alpha-value>)',
        },

        ink: {
          900: 'rgb(var(--ink-900) / <alpha-value>)',
          800: 'rgb(var(--ink-800) / <alpha-value>)',
          700: 'rgb(var(--ink-700) / <alpha-value>)',
          600: 'rgb(var(--ink-600) / <alpha-value>)',
          500: 'rgb(var(--ink-500) / <alpha-value>)',
          400: 'rgb(var(--ink-400) / <alpha-value>)',
          300: 'rgb(var(--ink-300) / <alpha-value>)',
          200: 'rgb(var(--ink-200) / <alpha-value>)',
          100: 'rgb(var(--ink-100) / <alpha-value>)',
        },

        line: {
          DEFAULT: 'rgb(var(--line) / <alpha-value>)',
          soft: 'rgb(var(--line-soft) / <alpha-value>)',
          strong: 'rgb(var(--line-strong) / <alpha-value>)',
        },

        accent: {
          50: 'rgb(var(--accent-50) / <alpha-value>)',
          100: 'rgb(var(--accent-100) / <alpha-value>)',
          200: 'rgb(var(--accent-200) / <alpha-value>)',
          300: 'rgb(var(--accent-300) / <alpha-value>)',
          400: 'rgb(var(--accent-400) / <alpha-value>)',
          500: 'rgb(var(--accent-500) / <alpha-value>)',
          600: 'rgb(var(--accent-600) / <alpha-value>)',
          700: 'rgb(var(--accent-700) / <alpha-value>)',
          800: 'rgb(var(--accent-800) / <alpha-value>)',
          900: 'rgb(var(--accent-900) / <alpha-value>)',
        },

        purple: {
          50: '#F5F0FF',
          100: '#EDE4FF',
          200: '#DCCBFF',
          300: '#C4A8FF',
          400: '#9B5CFF',
          500: '#7C3AED',
          600: '#6D28D9',
          700: '#5B21B6',
        },

        blue: {
          50: '#EFF9FF',
          100: '#DDF3FF',
          200: '#BAE7FF',
          300: '#7DD3FC',
          400: '#38BDF8',
          500: '#0EA5E9',
          600: '#0284C7',
        },

        teal: {
          50: 'rgba(0,255,156,0.06)',
          100: 'rgba(0,255,156,0.10)',
          300: '#52E9B0',
          400: '#00FF9C',
          500: '#00FF9C',
          600: '#00D985',
        },

        amber: {
          50: 'rgba(245,158,11,0.06)',
          100: 'rgba(245,158,11,0.10)',
          300: '#FBBF24',
          400: '#F59E0B',
          500: '#D97706',
        },

        rose: {
          50: 'rgba(244,63,94,0.06)',
          100: 'rgba(244,63,94,0.10)',
          300: '#FB7185',
          400: '#F43F5E',
          500: '#E11D48',
        },
      },

      backgroundImage: {
        'grid-faint':
          'linear-gradient(to right, rgba(124,58,237,0.055) 1px, transparent 1px), linear-gradient(to bottom, rgba(124,58,237,0.055) 1px, transparent 1px)',

        noise:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.025'/%3E%3C/svg%3E\")",

        'radial-fade':
          'radial-gradient(ellipse at top left, rgba(124,58,237,0.08), transparent 55%)',
      },

      boxShadow: {
        soft:
          '0 0 0 1px rgba(124,58,237,0.06)',

        card:
          '0 8px 28px rgba(31,24,56,0.08)',

        lift:
          '0 16px 40px rgba(31,24,56,0.12), 0 0 0 1px rgba(124,58,237,0.08)',

        glow:
          '0 0 18px rgba(124,58,237,0.18)',
      },

      borderRadius: {
        xl2: '0.45rem',
      },

      keyframes: {
        shimmer: {
          '0%': {
            backgroundPosition: '-400px 0',
          },
          '100%': {
            backgroundPosition: '400px 0',
          },
        },

        pulseSoft: {
          '0%, 100%': {
            opacity: 1,
          },
          '50%': {
            opacity: 0.55,
          },
        },

        flicker: {
          '0%, 100%': {
            opacity: 1,
          },
          '50%': {
            opacity: 0.82,
          },
        },
      },

      animation: {
        shimmer: 'shimmer 1.6s linear infinite',
        pulseSoft: 'pulseSoft 2s ease-in-out infinite',
        flicker: 'flicker 3s ease-in-out infinite',
      },
    },
  },

  plugins: [],
};