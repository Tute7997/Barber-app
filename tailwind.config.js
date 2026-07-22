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
          DEFAULT: '#d4af37',
          light: '#e6c866',
          dark: '#a8871f',
        },
        secondary: {
          DEFAULT: '#4a4a4a',
          light: '#6a6a6a',
          dark: '#333333',
        },
        accent: '#e0e0e0',
        surface: '#0d0d0d',
        card: '#1a1a1a',
        input: '#242424',
      },
    },
  },
  plugins: [],
}
