const { nextui } = require("@nextui-org/react");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@heroui/theme/dist/components/scroll-shadow.js"
  ],
  theme: {
    extend: {
      colors: {
        black: "#1E1E1E",
        white: "#F0F0F0",
        red: {
          DEFAULT: "#EA4335",
          400: "#4F1C17",
        },
        blue: {
          DEFAULT: "#4285F4",
          400: "#1E3252",
        },
        green: {
          DEFAULT: "#34A853",
          400: "#143D1F",
        },
        yellow: {
          DEFAULT: "#F9AB00",
          400: "#493812",
        },
      },
    },
  },
  darkMode: "class",
  plugins: [nextui()],
};


