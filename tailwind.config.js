/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
       noodle: ["'BigNoodleTitling'", "sans-serif"],
      },
      letterSpacing: {
    tighter2: "-0.06em", 
    },
      },
    },
  plugins: [
    require('tailwind-scrollbar'),
  ],
}
