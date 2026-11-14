/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          orange: '#E8602C',
          orangeDark: '#D14E1E',
          orangeLight: '#FFF4EE',
          charcoal: '#1A1A1A',
          cream: '#FAF6F0',
          gold: '#C9953C',
        },
      },
      fontFamily: {
        serif: ['Playfair Display', 'serif'],
        sans: ['Plus Jakarta Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
