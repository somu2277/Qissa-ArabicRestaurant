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
          cream: '#FAF6F0',
          sand: '#F2EBE0',
          charcoal: '#1A1A1A',
          gold: '#C9953C',
          muted: '#6B655D',
        },
      },
      fontFamily: {
        serif: ['Playfair Display', 'serif'],
        sans: ['Plus Jakarta Sans', 'sans-serif'],
        arabic: ['Amiri', 'serif'],
      },
      boxShadow: {
        card: '0 4px 20px -2px rgba(26, 26, 26, 0.06), 0 2px 6px -1px rgba(26, 26, 26, 0.04)',
        glow: '0 8px 30px rgba(232, 96, 44, 0.25)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
};
