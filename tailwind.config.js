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
        background: "#F8FAFC", // Clean Light Slate Snow
        foreground: "#0F172A", // Deep Slate 900
        surface: {
          50: "#F8FAFC",
          100: "#F1F5F9",
          200: "#FFFFFF", // Pure White Card
          border: "#E2E8F0",
          card: "#FFFFFF",
        },
        primary: {
          DEFAULT: "#2563EB", // Royal Blue
          hover: "#1D4ED8",
          light: "#60A5FA",
          dark: "#1E40AF",
        },
        cyan: {
          DEFAULT: "#0284C7", // Cyan / Sky
          hover: "#0369A1",
          light: "#38BDF8",
          dark: "#075985",
        },
        indigo: {
          DEFAULT: "#4F46E5",
          hover: "#4338CA",
          light: "#818CF8",
          dark: "#3730A3",
        },
        brand: {
          DEFAULT: "#2563EB",
          glow: "#3B82F6",
          dark: "#1D4ED8",
        },
        status: {
          available: "#10B981", // Emerald Green
          occupied: "#2563EB", // Royal Blue
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
