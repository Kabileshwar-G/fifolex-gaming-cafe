/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#111111", // Matte Carbon
        foreground: "#FFFFFF", // White
        surface: {
          50: "#2A2A2A",
          100: "#242424",
          200: "#1E1E1E", // Dark Gunmetal
          border: "#2E2E2E",
          card: "#1E1E1E",
        },
        acid: {
          DEFAULT: "#CCFF00", // Acid Yellow-Green (Primary Accent / CTAs)
          hover: "#B8E600",
          light: "#E5FF66",
          dark: "#99BF00",
          glow: "rgba(204, 255, 0, 0.4)",
        },
        ultra: {
          DEFAULT: "#8A2BE2", // Ultraviolet (Secondary Accent)
          hover: "#7A20CE",
          light: "#A855F7",
          dark: "#6B21A8",
          glow: "rgba(138, 43, 226, 0.4)",
        },
        brand: {
          DEFAULT: "#CCFF00",
          glow: "#D4FF33",
          dark: "#99BF00",
        },
        status: {
          available: "#CCFF00", // Acid Yellow-Green
          occupied: "#8A2BE2", // Ultraviolet
          reserved: "#FF8C00", // Neon Amber/Orange
          cleaning: "#00F0FF", // Electric Cyan
          maintenance: "#FF0055", // Neon Crimson
        },
      },
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
};
