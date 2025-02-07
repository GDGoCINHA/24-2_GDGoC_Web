const { heroui } = require('@heroui/theme');
// tailwind.config.js
const { nextui } = require('@nextui-org/react');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}',
    './node_modules/@heroui/theme/dist/components/scroll-shadow.js',
  ],
  theme: {
    extend: {
      fontFamily: {
        'pretendard': 'var(--font-pretendard)',
        'ocra': 'var(--font-ocra)',
      },
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
      },
      screens: {
        'mobile': { 'max': '1000px' },
        'tablet': { 'min': '1000px', 'max': '1400px' },
        'desktop': { 'min': '1400px' },
      },
    },
  },
  plugins: [nextui(), heroui()],
};
