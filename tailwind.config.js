/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: '#FFF8F0',
        gold: {
          50: '#FFF9E6',
          100: '#FFF0C2',
          200: '#FFE08A',
          300: '#FFD052',
          400: '#FFC01A',
          500: '#D4A04A',
          600: '#B8860B',
          700: '#996515',
          800: '#7A4F12',
          900: '#5C3A0E',
        },
        rose: {
          50: '#FFF5F5',
          100: '#FFE8EA',
          200: '#FFD1D6',
          300: '#FFB3BC',
          400: '#FF8A98',
          500: '#E8647C',
          600: '#C44B63',
          700: '#A3384E',
          800: '#82293C',
          900: '#611C2C',
        },
        emerald: {
          dark: '#1B4332',
          DEFAULT: '#2D6A4F',
          light: '#40916C',
        },
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Cormorant Garamond', 'serif'],
        script: ['Great Vibes', 'cursive'],
      },
    },
  },
  plugins: [],
};
