/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'pulse-glow': 'pulseGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: 1, filter: 'drop-shadow(0 0 15px rgba(168, 85, 247, 0.5))' },
          '50%': { opacity: .7, filter: 'drop-shadow(0 0 5px rgba(168, 85, 247, 0.2))' },
        }
      }
    },
  },
  plugins: [],
}
