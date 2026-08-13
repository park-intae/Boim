/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#3730A3', 
          secondary: '#374151',
          tertiary: '#6B7280',
          dark: '#111827',
        }
      }
    },
  },
  plugins: [],
}
