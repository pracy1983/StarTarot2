/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/modules/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        surface: '#1A1A1A',
        primary: {
          DEFAULT: '#FFD700',
          light: '#FFE44D',
          dark: '#B39700',
        },
        background: {
          DEFAULT: '#000000',
          secondary: '#1A1A1A',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'auth-pattern': "url('/images/background.jpg')",
      },
      fontFamily: {
        montserrat: ['var(--font-montserrat)'],
        raleway: ['var(--font-raleway)'],
      },
      backgroundColor: {
        'chat-bg': '#000000f9',
      }
    },
  },
  plugins: [],
}
