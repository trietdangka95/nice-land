import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#17211b",
        cream: "#f5f3ed",
        moss: "#315c45",
        leaf: "#47795b",
        sand: "#ded8c9",
        gold: "#c99854",
      },
      fontFamily: {
        sans: ["var(--font-plus-jakarta-sans)", "Arial", "Helvetica Neue", "sans-serif"],
        display: ["var(--font-plus-jakarta-sans)", "Georgia", "Times New Roman", "serif"],
      },
      boxShadow: {
        soft: "0 18px 60px rgba(23, 33, 27, 0.10)",
      },
      keyframes: {
        "fade-in-up": {
          "0%": {
            opacity: "0",
            transform: "translateY(16px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
      },
      animation: {
        "fade-in-up": "fade-in-up 0.5s ease-out forwards",
      },
    },
  },
  plugins: [],
} satisfies Config;
