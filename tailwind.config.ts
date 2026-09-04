import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#24211C",
        paper: "#F7F3EA",
        rice: "#FFFDF7",
        clay: "#A45E3C",
        ember: "#D99A46",
        moss: "#6D7A52",
        soot: "#12110F"
      },
      fontFamily: {
        sans: [
          "var(--font-sans)",
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "sans-serif"
        ],
        serif: [
          "var(--font-serif)",
          "Georgia",
          "ui-serif",
          "serif"
        ]
      },
      boxShadow: {
        soft: "0 20px 60px rgba(36, 33, 28, 0.10)"
      }
    }
  },
  plugins: []
};

export default config;
