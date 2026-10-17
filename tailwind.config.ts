import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#0B0C0E",
        gold: {
          300: "#F3DEBA",
          400: "#DEC08F",
          500: "#C5A880",
          600: "#A98A62",
          700: "#806644",
        },
        card: {
          dark: "rgba(18, 19, 24, 0.75)",
          border: "rgba(255, 255, 255, 0.08)",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        anton: ["var(--font-anton)", "Anton", "sans-serif"],
        playfair: ["var(--font-playfair)", "serif"],
        bodoni: ["var(--font-bodoni)", "serif"],
        cormorant: ["var(--font-cormorant)", "serif"],
        syne: ["var(--font-syne)", "sans-serif"],
        outfit: ["var(--font-outfit)", "sans-serif"],
        cinzel: ["var(--font-cinzel)", "serif"],
        serif: ["var(--font-playfair)", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;
