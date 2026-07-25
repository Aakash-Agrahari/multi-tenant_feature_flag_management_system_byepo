/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fff8ec',
          100: '#ffedc7',
          200: '#ffd685',
          300: '#ffbb43',
          400: '#fda21c',
          500: '#f78406',
          600: '#db6402',
          700: '#b64705',
          800: '#94380a',
          900: '#7a300c',
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
