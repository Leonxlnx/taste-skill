import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Geist', 'system-ui', 'sans-serif'],
        mono: ['Geist Mono', 'monospace'],
      },
      colors: {
        surface: '#0d1117',
        reef: {
          teal: '#14b8a6',
          cyan: '#06b6d4',
        },
        posture: {
          healthy: '#10b981',
          watch: '#f59e0b',
          needs_improvement: '#f97316',
          poor: '#ef4444',
        },
      },
      transitionTimingFunction: {
        spring: 'cubic-bezier(0.32, 0.72, 0, 1)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-ring': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.4' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.6s cubic-bezier(0.32,0.72,0,1) forwards',
        'fade-up-delay': 'fade-up 0.6s cubic-bezier(0.32,0.72,0,1) 0.1s forwards',
        'fade-up-delay-2': 'fade-up 0.6s cubic-bezier(0.32,0.72,0,1) 0.2s forwards',
        'fade-up-delay-3': 'fade-up 0.6s cubic-bezier(0.32,0.72,0,1) 0.3s forwards',
        'pulse-ring': 'pulse-ring 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
export default config;
