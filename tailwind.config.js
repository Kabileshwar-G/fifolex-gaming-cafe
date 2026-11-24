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
        background: "#0A0E17", // Deep Midnight Obsidian
        foreground: "#F8FAFC", // Pure Crisp White
        surface: {
          50: "#1A2338",
          100: "#161F32",
          200: "#121826", // Dark Slate Navy Card
          border: "#1F293D",
          card: "#121826",
        },
        cyan: {
          DEFAULT: "#00D2FF", // Electric Cyber Cyan (Primary Accent / CTAs)
          hover: "#00B4D8",
          light: "#66E5FF",
          dark: "#0099CC",
          glow: "rgba(0, 210, 255, 0.35)",
        },
        indigo: {
          DEFAULT: "#6366F1", // Royal Indigo (Secondary Accent)
          hover: "#4F46E5",
          light: "#818CF8",
          dark: "#4338CA",
          glow: "rgba(99, 102, 241, 0.35)",
        },
        brand: {
          DEFAULT: "#00D2FF",
          glow: "#33DDFF",
          dark: "#0088B3",
        },
        status: {
          available: "#10B981", // Emerald Green
          occupied: "#00D2FF", // Electric Cyan
          reserved: "#F59E0B", // Warm Amber
          cleaning: "#8B5CF6", // Amethyst Purple
          maintenance: "#EF4444", // Crimson Red
        },
      },
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
};
