import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#86ef86',
        'dark-green': '#166534',
        bg: '#0a0a0a',
        surface: '#111111',
        'text-base': '#f0fdf4',
      },
      fontFamily: {
        sora: ['Sora', 'sans-serif'],
        'dm-sans': ['"DM Sans"', 'sans-serif'],
      },
      borderRadius: {
        card: '8px',
        badge: '4px',
      },
    },
  },
  plugins: [],
}

export default config
