import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        fire: {
          300: "#FFA233",
          400: "#FF7700",
          500: "#FF5500",
          600: "#E64000",
          700: "#B83000",
        },
        cyber: {
          400: "#38F9D7",
          500: "#00F0FF",
          600: "#00B8D9",
        },
        gold: {
          400: "#FCD34D",
          500: "#F59E0B",
          600: "#D97706",
        },
        dark: {
          950: "#06080D",
          900: "#0A0E17",
          850: "#0F1624",
          800: "#161F33",
          750: "#1E2A45",
          700: "#2B3A5E",
        },
      },
      boxShadow: {
        "glow-fire": "0 0 25px rgba(255, 85, 0, 0.45)",
        "glow-cyber": "0 0 25px rgba(0, 240, 255, 0.4)",
        "glow-gold": "0 0 25px rgba(245, 158, 11, 0.45)",
        "glass": "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
      },
      backgroundImage: {
        "fire-gradient": "linear-gradient(135deg, #FF7700 0%, #FF3700 100%)",
        "gold-gradient": "linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%)",
        "cyber-gradient": "linear-gradient(135deg, #00F0FF 0%, #0077FF 100%)",
        "radial-glow": "radial-gradient(circle at 50% 0%, rgba(255, 85, 0, 0.15), transparent 70%)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float": "float 4s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
