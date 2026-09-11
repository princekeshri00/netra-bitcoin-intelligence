/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: '#080C15',
          darker: '#05080F',
          card: '#0F172A',
          cardElevated: '#162238',
          cardBorder: 'rgba(56, 189, 248, 0.15)',
          text: '#F1F5F9',
          muted: '#94A3B8',
          line: '#1E293B',
        },
        ink: {
          DEFAULT: '#F8FAFC',
          soft: '#1E293B',
          line: '#334155',
        },
        paper: {
          DEFAULT: '#080C15',
          card: '#0F172A',
          line: 'rgba(56, 189, 248, 0.15)',
        },
        stamp: {
          DEFAULT: '#06B6D4',
          soft: 'rgba(6, 182, 212, 0.15)',
        },
        risk: {
          critical: '#F43F5E',
          criticalSoft: 'rgba(244, 63, 94, 0.15)',
          high: '#F97316',
          highSoft: 'rgba(249, 115, 22, 0.15)',
          medium: '#F59E0B',
          mediumSoft: 'rgba(245, 158, 11, 0.15)',
          low: '#10B981',
          lowSoft: 'rgba(16, 185, 129, 0.15)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'ui-monospace', 'monospace'],
        serif: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'glow-cyan': '0 0 20px -3px rgba(6, 182, 212, 0.35)',
        'glow-rose': '0 0 20px -3px rgba(244, 63, 94, 0.35)',
        'glow-orange': '0 0 20px -3px rgba(249, 115, 22, 0.35)',
        'glow-amber': '0 0 20px -3px rgba(245, 158, 11, 0.3)',
        'glow-emerald': '0 0 20px -3px rgba(16, 185, 129, 0.35)',
        'card-cyber': '0 8px 32px 0 rgba(0, 0, 0, 0.45)',
      },
      backgroundImage: {
        'cyber-grid': 'radial-gradient(circle, rgba(56, 189, 248, 0.08) 1px, transparent 1px)',
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      backgroundSize: {
        'cyber-grid': '24px 24px',
      },
      animation: {
        'pulse-glow': 'pulse-glow 2.5s infinite ease-in-out',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' },
        },
      },
    },
  },
  plugins: [],
};
