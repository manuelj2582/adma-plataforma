import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Paleta principal: piedra cálida + acento oliva
        ink: {
          DEFAULT: "#1a1815",
          soft: "#3a352e",
          mute: "#6b6358",
          subtle: "#9a9183",
        },
        paper: {
          DEFAULT: "#fbfaf7",
          card: "#ffffff",
          warm: "#f5f2ec",
          edge: "#ebe7df",
          line: "#e0dbd1",
        },
        // Acento principal: verde oliva profundo
        olive: {
          50: "#f6f7f0",
          100: "#e9ecd8",
          200: "#d4dab3",
          300: "#b8c184",
          400: "#9aa75e",
          500: "#7d8c45",
          600: "#5f6c34",
          700: "#48522a",
          800: "#3a4225",
          900: "#323921",
        },
        // Acento secundario: ámbar/terracota para alertas
        amber: {
          50: "#fdf8ed",
          100: "#faedcb",
          400: "#e8a93c",
          500: "#d68f1f",
          600: "#b8721a",
          700: "#925818",
        },
        // Estados
        success: {
          bg: "#eef2e3",
          fg: "#48522a",
          line: "#c5cfa5",
        },
        warn: {
          bg: "#fdf3df",
          fg: "#925818",
          line: "#f0d896",
        },
        danger: {
          bg: "#fbeae5",
          fg: "#9a3412",
          line: "#f4c2b2",
        },
        info: {
          bg: "#e8eef4",
          fg: "#1e3a5f",
          line: "#bdcde0",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      letterSpacing: {
        tightest: "-0.04em",
        tighter: "-0.025em",
      },
      boxShadow: {
        soft: "0 1px 2px rgba(26, 24, 21, 0.04), 0 0 0 0.5px rgba(26, 24, 21, 0.06)",
        card: "0 1px 2px rgba(26, 24, 21, 0.05), 0 4px 12px -4px rgba(26, 24, 21, 0.08)",
        lift: "0 4px 12px -2px rgba(26, 24, 21, 0.08), 0 12px 32px -8px rgba(26, 24, 21, 0.12)",
        inset: "inset 0 0 0 0.5px rgba(26, 24, 21, 0.08)",
      },
      borderRadius: {
        lg: "10px",
        md: "6px",
        sm: "4px",
      },
    },
  },
  plugins: [],
};

export default config;
