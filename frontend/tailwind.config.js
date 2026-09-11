/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Case-file navy — the base of the investigation dossier concept
        ink: {
          DEFAULT: '#101A2E',
          soft: '#1B2A45',
          line: '#2E3E5C',
        },
        // Cool paper, not cream — deliberately avoids the warm-cream AI default
        paper: {
          DEFAULT: '#EFF2F5',
          card: '#FFFFFF',
          line: '#D7DEE6',
        },
        // Single bold accent: a case-stamp copper, used sparingly
        stamp: {
          DEFAULT: '#B5651D',
          soft: '#F3E4D6',
        },
        risk: {
          critical: '#7A1611',
          criticalSoft: '#F1DAD8',
          high: '#A3311A',
          highSoft: '#F6E2DD',
          medium: '#8A6A17',
          mediumSoft: '#F2ECDA',
          low: '#2E6B47',
          lowSoft: '#DFEEE4',
        },
      },
      fontFamily: {
        mono: ['ui-monospace', 'SF Mono', 'Roboto Mono', 'monospace'],
        serif: ['Iowan Old Style', 'Palatino Linotype', 'Georgia', 'serif'],
      },
      backgroundImage: {
        ledger: `linear-gradient(#D7DEE6 1px, transparent 1px)`,
      },
      backgroundSize: {
        ledger: '100% 2.25rem',
      },
    },
  },
  plugins: [],
}
