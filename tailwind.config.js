/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        pitch: "#070d09",
        neon: "#22c55e",
        emerald: "#10b981",
      },
      boxShadow: {
        neon: "0 0 15px rgba(34,197,94,0.5)",
      },
    },
  },
  plugins: [],
};
