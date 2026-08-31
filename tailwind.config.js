/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './App.tsx', './components/**/*.{ts,tsx}', './contexts/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Google Sans"', '"Aptos"', 'Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'],
      },
      boxShadow: {
        'panel': '0 1px 2px rgba(31, 31, 31, 0.03), 0 12px 32px rgba(31, 31, 31, 0.035)',
      },
    },
  },
  plugins: [],
};
