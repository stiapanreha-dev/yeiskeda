/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // Включаем dark mode через класс
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#10b981',
        secondary: '#059669',
        accent: '#34d399',
      }
    },
  },
  plugins: [],
}
