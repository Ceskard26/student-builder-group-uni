import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#161D26",
        accent: "#FF9900",
        // Paleta oficial del brand kit de AWS Student Builder Group.
        "brand-amber": "#FF9900",
        "brand-blue": "#42B4FF",
        "brand-purple": "#AD5CFF",
        "brand-magenta": "#FF57E9",
        "brand-mint": "#00E582",
      },
      fontFamily: {
        mono: ["var(--font-ember-mono)", "monospace"],
        sans: ["var(--font-ember-display)", "sans-serif"],
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "50%": { transform: "translateY(-14px) rotate(4deg)" },
        },
        "float-slow": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "spin-slow": {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "0.5", transform: "scale(1)" },
          "50%": { opacity: "0.9", transform: "scale(1.05)" },
        },
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
        "fade-in-up": {
          from: { opacity: "0", transform: "translateY(24px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "drift": {
          "0%": { transform: "translate(0, 0)" },
          "33%": { transform: "translate(3%, -4%)" },
          "66%": { transform: "translate(-3%, 3%)" },
          "100%": { transform: "translate(0, 0)" },
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        "float-slow": "float-slow 8s ease-in-out infinite",
        "float-delay": "float 7s ease-in-out 1.5s infinite",
        "spin-slow": "spin-slow 14s linear infinite",
        "pulse-glow": "pulse-glow 3s ease-in-out infinite",
        marquee: "marquee 28s linear infinite",
        "fade-in-up": "fade-in-up 0.7s ease-out forwards",
        drift: "drift 16s ease-in-out infinite",
        "drift-slow": "drift 22s ease-in-out infinite reverse",
      },
    },
  },
  plugins: [],
};

export default config;
