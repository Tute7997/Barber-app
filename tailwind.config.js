/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6b006c',
          light: '#9b3d9c',
          dark: '#4a004b',
        },
        secondary: {
          DEFAULT: '#d4af37',
          light: '#e6c866',
          dark: '#a8871f',
        },
        accent: '#1a1a1a',
        surface: '#f8f5f6',
      },
    },
  },
  plugins: [],
}
