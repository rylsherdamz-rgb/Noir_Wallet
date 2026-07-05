/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        gold: '#C6A15B',
        goldDim: '#A98A43',
        cream: '#EDE4D0',
        silver: '#CECCD0',
        surfaceBg: '#0A0A0A',
        cardBg: '#141414',
        borderGrey: '#3A3A3A',
        midGrey: '#1E1E1E',
        mutedWhite: '#A9A9A9',
      },
      fontFamily: {
        heavy: ['Inter-ExtraBold'], // Assuming we might add fonts later
      }
    },
  },
  plugins: [],
}
