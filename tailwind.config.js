/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef6ff",
          100: "#d9ecff",
          200: "#bcdcff",
          300: "#8ec5ff",
          400: "#59a4ff",
          500: "#2f82f5",
          600: "#1a66db",
          700: "#1651b0",
          800: "#17468e",
          900: "#173d74",
        },
        danger: {
          50: "#fff1f1",
          100: "#ffdfdf",
          200: "#fcc0c0",
          500: "#e02424",
          600: "#c81e1e",
          700: "#a01a1a",
        },
        warn: {
          50: "#fff8eb",
          100: "#ffedc6",
          500: "#f59e0b",
          600: "#d97706",
        },
        ok: {
          50: "#ecfdf5",
          100: "#d1fae5",
          500: "#10b981",
          600: "#059669",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "Segoe UI", "Roboto", "Helvetica", "Arial", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(16,24,40,0.06), 0 1px 3px rgba(16,24,40,0.10)",
        elevated: "0 4px 12px rgba(16,24,40,0.12)",
      },
    },
  },
  plugins: [],
};
