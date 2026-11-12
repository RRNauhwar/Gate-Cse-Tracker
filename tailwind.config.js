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
        background: '#0a0b0e',
        surface: {
          DEFAULT: '#11141c',
          hover: '#171b26',
          card: '#151923',
          border: '#232936',
          strong: '#2e3547'
        },
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8'
        }
      },
      fontFamily: {
        sans: ['Geist', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['Geist Mono', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'premium-sm': '0 1px 2px rgba(0,0,0,0.4), 0 1px 3px rgba(0,0,0,0.25)',
        'premium': '0 4px 6px -1px rgba(0,0,0,0.3), 0 10px 24px -6px rgba(0,0,0,0.5)',
        'premium-lg': '0 10px 15px -3px rgba(0,0,0,0.4), 0 24px 48px -12px rgba(0,0,0,0.6)',
      }
    },
  },
  plugins: [],
}
