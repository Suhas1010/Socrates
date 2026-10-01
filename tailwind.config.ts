import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0b0a08",
        gold: {
          50: "#FFFDF5",
          100: "#FFF8E6",
          200: "#FFF0C4",
          300: "#FFE7A1",
          400: "#FFDC7A",
          500: "#FFD27A",
          600: "#E6BA5C",
          700: "#BF973B",
          800: "#8C6A1B",
          900: "#594008",
          DEFAULT: "#FFD27A",
        },
        cream: {
          DEFAULT: "#F4EFE6",
          50: "#FCFAF7",
          100: "#F8F5EE",
          200: "#F4EFE6",
          300: "#E5DEC9",
        },
        muted: {
          DEFAULT: "#9E988E",
          300: "#C4BEB4",
          400: "#B3ADA2",
          500: "#9E988E",
          600: "#7D776C",
        },
        surface: "#14130F",
        "surface-raised": "#1D1B15",
        "surface-card": "#24221A",
        node: {
          unseen: "#4A463E",
          learning: "#FFD27A",
          shaky: "#E05252",
          mastered: "#2ECC71",
        },
      },
      fontFamily: {
        sans: ["var(--font-outfit)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "Courier New", "monospace"],
      },
      animation: {
        "pulse-subtle": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "shimmer": "shimmer 2s linear infinite",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
