import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        ocean: {
          900: '#0a0f1a',
          800: '#0d1526',
          700: '#111d35',
          600: '#163050',
          500: '#1a4068',
          400: '#1e5080',
          300: '#2563a8',
          200: '#3b82c4',
          100: '#60a5fa',
          50: '#bfdbfe',
        },
        reef: {
          teal: '#14b8a6',
          cyan: '#06b6d4',
          emerald: '#10b981',
        },
        posture: {
          healthy: '#10b981',
          watch: '#f59e0b',
          needs_improvement: '#f97316',
          poor: '#ef4444',
        },
      },
    },
  },
  plugins: [],
};

export default config;
