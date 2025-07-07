/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        noodle: ['"Big Noodle Titling"', 'sans-serif'],
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