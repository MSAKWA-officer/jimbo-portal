/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Open Sans"', 'Arial', 'Helvetica', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#2563eb',
          600: '#1d4ed8',
          700: '#1e40af',
        },
        // Rangi za muundo mpya (navy admin theme)
        navy: {
          DEFAULT: '#14305c',
          dark: '#0f2547',
          light: '#1b4380',
          line: '#2f6fb5',
        },
      },
    },
  },
  plugins: [],
};
