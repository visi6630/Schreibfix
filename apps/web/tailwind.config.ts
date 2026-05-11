import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        fox: {
          DEFAULT: "#F97316",
          light: "#FED7AA",
          dark: "#C2410C",
        },
        forest: {
          DEFAULT: "#22C55E",
          light: "#BBF7D0",
          dark: "#15803D",
        },
      },
      fontFamily: {
        nunito: ["Nunito", "sans-serif"],
      },
      fontSize: {
        // Larger defaults for child-friendly readability
        base: ["1.125rem", { lineHeight: "1.75rem" }],
        lg:   ["1.25rem",  { lineHeight: "1.875rem" }],
        xl:   ["1.5rem",   { lineHeight: "2rem" }],
        "2xl": ["1.875rem", { lineHeight: "2.5rem" }],
      },
    },
  },
  plugins: [],
};

export default config;
