/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'serif': ['Playfair Display', 'Georgia', 'serif'],
      },
      colors: {
        'primary': '#6B46C1',
        'secondary': '#EC4899',
        'accent': '#F59E0B',
        'cream': '#FDF8F2',
      }
    },
  },
  plugins: [],
}
