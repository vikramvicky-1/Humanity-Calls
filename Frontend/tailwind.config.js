/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./index.jsx",
    "./App.jsx",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Montserrat", "sans-serif"],
        serif: ["Montserrat", "serif"],
        mono: ["Montserrat", "monospace"],
      },
      colors: {
        bg: '#FFFFFF',
        primary: '#020887',
        secondary: '#334195',
        blood: {
          DEFAULT: '#C62828',
          light: '#FDECEC',
          dark: '#8E1B1B'
        },
        text: {
          heading: '#1E1E2F',
          body: '#4A4A68'
        },
        border: '#E6E1DC'
      },
    },
  },
  plugins: [],
}
