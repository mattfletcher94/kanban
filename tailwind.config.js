/** @type {import('tailwindcss').Config} */
const colors = require('tailwindcss/colors')
const defaultTheme = require('tailwindcss/defaultTheme')

const primaryColor = colors.indigo

module.exports = {
  darkMode: 'class',

  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
  ],
  theme: {
    screens: {
      xs: { min: '359px' },
      ...defaultTheme.screens,
    },
    extend: {
      keyframes: {
        fade: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
      },
      animation: {
        'fade-in-out': 'fade 250ms cubic-bezier(0.16, 1, 0.3, 1)',
      },
      colors: {
        primary: {
          DEFAULT: primaryColor[500],
          50: primaryColor[50],
          100: primaryColor[100],
          200: primaryColor[200],
          300: primaryColor[300],
          400: primaryColor[400],
          500: primaryColor[500],
          600: primaryColor[600],
          700: primaryColor[700],
          800: primaryColor[800],
          900: primaryColor[900],
        },
        slate: {
          50: '#f8fafc',
        },
        surface: {
          400: '#42506B',
          500: colors.gray[900],
        },
        blue: {
          500: '#3e619b',
        },
        light: {
          500: '#e9e9eb',
        },
      },
      // Use system fonts
      fontFamily: {
        sans: ['Nunito Sans', 'sans-serif'],
      },
    },
    container: {
      center: true,
      padding: {
        DEFAULT: '1.5rem',
        sm: '2rem',
        lg: '4rem',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/line-clamp'),
    require('@tailwindcss/aspect-ratio'),
    // require('@tailwindcss/forms'),
  ],
}
