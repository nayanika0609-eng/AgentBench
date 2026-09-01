/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        display: ['"Lexend"', '"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      colors: {
        canvas: '#f6f5f2',
        surface: {
          DEFAULT: '#ffffff',
          soft: '#fbfaf8',
          cool: '#f4f6fa',
        },
        ink: {
          900: '#14161a',
          800: '#1f2229',
          700: '#2c303a',
          600: '#464b57',
          500: '#666c79',
          400: '#8b909c',
          300: '#b3b7c1',
          200: '#dcdee3',
          100: '#eceef1',
        },
        line: {
          DEFAULT: '#e6e4de',
          soft: '#efede7',
          strong: '#d7d4cb',
        },
        accent: {
          50: '#eef4ff',
          100: '#dfe9ff',
          200: '#bfd3ff',
          300: '#93b4ff',
          400: '#6690fa',
          500: '#3f6ce8',
          600: '#3054c9',
          700: '#2743a1',
          800: '#233a80',
          900: '#1f3268',
        },
        teal: {
          50: '#eefbf7',
          100: '#d3f4ea',
          300: '#7fdcc0',
          400: '#45c39e',
          500: '#26a882',
          600: '#1c8a6a',
        },
        amber: {
          50: '#fff8ec',
          100: '#ffedc7',
          300: '#f7c565',
          400: '#eeab2f',
          500: '#d68f18',
        },
        rose: {
          50: '#fdf1f1',
          100: '#fbdede',
          300: '#ef9f9f',
          400: '#e2716f',
          500: '#cf4c4c',
        },
      },
      backgroundImage: {
        'grid-faint':
          'linear-gradient(to right, rgba(20,22,26,0.035) 1px, transparent 1px), linear-gradient(to bottom, rgba(20,22,26,0.035) 1px, transparent 1px)',
        'noise': "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.025'/%3E%3C/svg%3E\")",
        'radial-fade': 'radial-gradient(ellipse at top, rgba(63,108,232,0.08), transparent 60%)',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(20,22,26,0.04), 0 8px 24px -12px rgba(20,22,26,0.10)',
        card: '0 1px 1px rgba(20,22,26,0.03), 0 12px 32px -16px rgba(20,22,26,0.14)',
        lift: '0 4px 8px rgba(20,22,26,0.04), 0 24px 48px -20px rgba(20,22,26,0.22)',
        glow: '0 0 0 1px rgba(63,108,232,0.12), 0 8px 24px -8px rgba(63,108,232,0.28)',
      },
      borderRadius: {
        xl2: '1.15rem',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.55 },
        },
      },
      animation: {
        shimmer: 'shimmer 1.6s linear infinite',
        pulseSoft: 'pulseSoft 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
