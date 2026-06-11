/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          red: "#B1181E",
          redDark: "#8E1318",
          cocoa: "#452129",
          cotton: "#A6A684",
          cottonLight: "#EDEDE3",
          cream: "#FBFAF7",
        },
      },
      fontFamily: {
        sans: ["Futura", "Futura PT", "Trebuchet MS", "Century Gothic", "sans-serif"],
        serif: ["Playfair Display", "Playfair", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
};
