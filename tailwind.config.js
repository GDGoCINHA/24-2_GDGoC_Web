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
        cred: "#EA4335",    // Google Red
        cblue: "#4285F4",   // Google Blue
        cyellow: "#FBBC05", // Google Yellow
        cgreen: "#34A853",  // Google Green
        cblack: "#1A1A1A",
        cwhite: "#FAFAFA",
      },
      screens: {
        mobile: { max: '768px' }, // 768px 이하일 때 적용
        pc: { min: '768px' },
        'tablet': { 'min': '1000px', 'max': '1400px' },
        'desktop': { 'min': '1400px' },
      },
      keyframes: {
        floatY: {
          '0%, 100%': { transform: 'translateX(-50%) translateY(0)' },
          '50%': { transform: 'translateX(-50%) translateY(-10px)' },
        },
      },
      animation: {
        floatY: 'floatY 1.6s ease-in-out infinite',
      },
    },
  },
  plugins: [nextui(), heroui()],
};
