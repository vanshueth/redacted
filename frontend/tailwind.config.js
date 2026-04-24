/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Purple/indigo palette for the "crypto" feel
        brand: {
          50:  "#f0edff",
          100: "#e0daff",
          200: "#c2b5ff",
          300: "#a48fff",
          400: "#8b6aff",
          500: "#7c4dff",  // primary
          600: "#6339e0",
          700: "#4a28b8",
          800: "#321990",
          900: "#1e0d68",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
    },
  },
  plugins: [],
};
