/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        lane: {
          air: '#06b6d4',      // Cyan 500
          airGlow: '#22d3ee',  // Cyan 400
          ground: '#f59e0b',   // Amber 500
          groundGlow: '#fbbf24'// Amber 400
        },
        daw: {
          bg: '#090a0f',
          surface: '#12141c',
          panel: '#181b26',
          border: '#262a3b',
          input: '#1d2130',
          hover: '#2a2f45',
          accent: '#38bdf8'
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace']
      }
    },
  },
  plugins: [],
}

