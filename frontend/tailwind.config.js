/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkBg: "#0b0f19",
        cardBg: "#151c2c",
        accentViolet: "#8b5cf6",
        accentCyan: "#06b6d4",
        accentGreen: "#10b981",
        borderSoft: "rgba(255, 255, 255, 0.08)",
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', '"Outfit"', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scan': 'scanAnimation 2.5s ease-in-out infinite',
      },
      keyframes: {
        scanAnimation: {
          '0%, 100%': { transform: 'translateY(0%)', opacity: 0.2 },
          '50%': { transform: 'translateY(280px)', opacity: 1 },
        }
      }
    },
  },
  plugins: [],
}
