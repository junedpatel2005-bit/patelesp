import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Red, Black, White palette for public website
        esport: {
          red: {
            DEFAULT: "#EF4444",
            50: "#FEF2F2",
            100: "#FEE2E2",
            200: "#FECACA",
            300: "#FCA5A5",
            400: "#F87171",
            500: "#EF4444",
            600: "#DC2626",
            700: "#B91C1C",
            800: "#991B1B",
            900: "#7F1D1D",
          },
          dark: {
            DEFAULT: "#0A0A0A",
            950: "#050505",
            900: "#0A0A0A",
            850: "#111111",
            800: "#171717",
            700: "#262626",
          },
        },
      },
      boxShadow: {
        "glow-red": "0 0 25px rgba(239, 68, 68, 0.45)",
        "glow-blue": "0 0 25px rgba(37, 99, 235, 0.4)",
      },
    },
  },
  plugins: [],
};

export default config;
