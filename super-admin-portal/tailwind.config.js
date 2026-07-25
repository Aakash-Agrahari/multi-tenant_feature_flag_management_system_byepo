/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f2f0ff',
          100: '#e6e2ff',
          200: '#c4baff',
          300: '#a292ff',
          400: '#7f68ff',
          500: '#5d3fea',
          600: '#4b2fc7',
          700: '#3a239e',
          800: '#2a1975',
          900: '#1b0f4d',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
