import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: ["class"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "var(--color-primary, #2E7D32)",
          dark: "var(--color-primary-dark, #1B5E20)",
          light: "#E8F5E9",
        },
        farm: {
          green: "#2E7D32",
          darkGreen: "#1B5E20",
          lightGreen: "#81C784",
          bg: "#F5F7F5",
          bgDark: "#121412",
          card: "#FFFFFF",
          cardDark: "#1E211E",
          text: "#212121",
          textDark: "#E8EAE8",
          muted: "#5F6368",
          mutedDark: "#A3A8A3",
          border: "#E0E3E0",
          borderDark: "#2E322E",
          pill: "#E8EBE8",
          pillDark: "#2A2F2A",
          warning: "#FFF3E0",
          warningBorder: "#FFCC80",
          warningDark: "#3A2E18",
          badge: "#D32F2F",
        },
      },
      fontFamily: {
        sans: [
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'sans-serif',
        ],
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.14)",
        header: "0 2px 4px rgba(0,0,0,0.25)",
      },
    },
  },
  plugins: [],
};
export default config;
