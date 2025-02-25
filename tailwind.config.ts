import type { Config } from "tailwindcss";

export default <Partial<Config>>{
  theme: {
    extend: {
      fontFamily: {
        "playfair-display": ["'Playfair Display'"],
        "red-hat-display": ["'Red Hat Display'"],
        inter: ["Inter"],
      },
      colors: {
        primary: {
          50: "#f6f6f6",
          100: "#e7e7e7",
          200: "#d1d1d1",
          300: "#b0b0b0",
          400: "#888888",
          500: "#6d6d6d",
          600: "#5d5d5d",
          700: "#4f4f4f",
          800: "#454545",
          900: "#3d3d3d",
          950: "#1f1f1f",
        },
        secondary: {
          50: "#fef4f2",
          100: "#fde6e3",
          200: "#fdd2cb",
          300: "#fab2a7",
          400: "#f58574",
          500: "#ec5d47",
          600: "#da4933",
          700: "#b6331f",
          800: "#962e1e",
          900: "#7d2b1f",
          950: "#44130b",
        },
      },
      screens: {
        tablet: "440px",
        computer: "1024px",
      },
    },
  },
};
