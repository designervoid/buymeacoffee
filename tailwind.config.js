/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'main-blue': '#0098EA',
        'bg-gray': '#F7F9FB',
        'bg-black': '#232328',
        'gradient-left': '#2D83EC',
        'gradient-right': '#1AC9FF',
      }
    }
  },
  plugins: [],
}