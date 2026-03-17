import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        base: '#09090b',
        surface: 'rgba(15, 15, 23, 0.5)',
        card: 'rgba(22, 22, 32, 0.6)',
        elevated: 'rgba(30, 30, 45, 0.9)',
        border: {
          DEFAULT: 'rgba(255, 255, 255, 0.04)',
          hover: 'rgba(255, 255, 255, 0.06)',
          active: 'rgba(255, 255, 255, 0.1)',
        },
        text: {
          primary: '#f4f4f5',
          secondary: '#a1a1aa',
          tertiary: '#52525b',
          muted: '#3f3f46',
        },
        threat: {
          green: '#22c55e',
          'green-dim': 'rgba(34, 197, 94, 0.12)',
          red: '#ef4444',
          'red-dim': 'rgba(239, 68, 68, 0.12)',
          amber: '#f59e0b',
          'amber-dim': 'rgba(245, 158, 11, 0.12)',
          blue: '#3b82f6',
          'blue-dim': 'rgba(59, 130, 246, 0.12)',
          purple: '#8b5cf6',
          'purple-dim': 'rgba(139, 92, 246, 0.12)',
        },
      },
      fontFamily: {
        display: ['Outfit', 'system-ui', 'sans-serif'],
        body: ['Outfit', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
} satisfies Config
