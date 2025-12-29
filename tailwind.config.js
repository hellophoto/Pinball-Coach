/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Orbitron', 'sans-serif'],
      },
      screens: {
        'xs': '375px',
      },
    },
  },
  plugins: [],
}
