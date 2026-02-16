import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "#040109",
        foreground: "#f5f3ff",
        primary: {
          DEFAULT: "#a855f7",
          foreground: "#0b0213"
        },
        accent: {
          DEFAULT: "#facc15",
          foreground: "#0b0213"
        },
        card: "#050816",
        border: "#4c1d95"
      },
      boxShadow: {
        "rpg-glow": "0 0 40px rgba(168,85,247,0.5)"
      },
      backgroundImage: {
        "rpg-grid":
          "radial-gradient(circle at 1px 1px, rgba(120,119,198,0.4) 1px, transparent 0)"
      },
      fontFamily: {
        gothic: ["var(--font-dotgothic16)", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;

