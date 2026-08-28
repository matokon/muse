/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        ink: '#14121A',
        muted: '#5B5B6B',
        surface: '#EFE7FC',
        'header-pink': '#F3D3E3',
        'button-pink': '#F2C8DB',
        lavender: '#DCD4F1',
      },
      fontFamily: {
        mono: ['Menlo', 'monospace'],
      },
    },
  },
  plugins: [],
};
