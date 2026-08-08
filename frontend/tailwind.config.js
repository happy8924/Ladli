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
        'sans': ['Outfit', 'system-ui', 'sans-serif'],
      },
      colors: {
        'primary': '#800000',         // Deep Royal Maroon
        'primary-hover': '#5C0000',
        'primary-light': '#990000',
        'secondary': '#C9A227',       // Royal Gold
        'secondary-hover': '#B8901F',
        'maroon': '#800000',
        'gold': '#C9A227',
        'cream': '#FAF7F2',           // Pearl White / Cream
        'bg-main': '#FFFFFF',
        'bg-card': '#FFFFFF',
        'text-main': '#1A0A0A',
        'text-muted': '#554444',
        'border-color': '#EADBC8',
      }
    },
  },
  plugins: [],
}
