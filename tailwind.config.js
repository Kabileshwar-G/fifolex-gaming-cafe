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
        background: "#08090d",
        foreground: "#f3f4f6",
        surface: {
          50: "#181b24",
          100: "#13161f",
          200: "#0e1017",
          border: "#232838",
        },
        brand: {
          DEFAULT: "#6366f1",
          glow: "#818cf8",
          dark: "#4338ca",
        },
        status: {
          available: "#10b981", // Emerald
          occupied: "#06b6d4", // Cyan
          reserved: "#f59e0b", // Amber
          cleaning: "#a855f7", // Purple
          maintenance: "#f43f5e", // Rose
        },
      },
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
};
