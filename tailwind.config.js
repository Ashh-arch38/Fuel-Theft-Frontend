// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', 
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        signord: ['signord', 'sans-serif'],
      },
    },
  },
  plugins: [],
};



