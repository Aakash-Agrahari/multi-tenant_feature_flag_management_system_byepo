/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#effcf9',
          100: '#c9f6ec',
          200: '#94ecda',
          300: '#5cdac2',
          400: '#2fc1a8',
          500: '#17a58c',
          600: '#0f8471',
          700: '#0f695c',
          800: '#11544a',
          900: '#0f453e',
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
