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
        "primary": "var(--primary-color)",
        "secondary": "var(--secondary-color)",
        "blood-red": "var(--primary-color)",
      },
    },
  },
  plugins: [],
}
