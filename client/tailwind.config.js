/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#060B18',
          900: '#0B132B',
          800: '#131F42',
          700: '#1C2D5A',
          600: '#283E78',
        },
        gold: {
          300: '#F5DE88',
          400: '#E6CA65',
          500: '#D4AF37',
          600: '#C5A059',
          700: '#997B30',
        },
        ivory: {
          50: '#FAF8F5',
          100: '#F4EBD9',
          200: '#E8DBC0',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        cinzel: ['Cinzel', 'Georgia', 'serif'],
        tamil: ['Noto Sans Tamil', 'Mukta Malar', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
