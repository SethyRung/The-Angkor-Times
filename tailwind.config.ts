import type { Config } from "tailwindcss";

export default <Partial<Config>>{
  theme: {
    extend: {
      fontFamily: {
        "red-hat-display": ["'Red Hat Display'"],
        inter: ["Inter"],
        "kantumruy-pro": ["'Kantumruy Pro'"],
        battambang: ["'Battambang'"],
      },
      colors: {},
      screens: {
        tablet: "440px",
        computer: "1024px",
      },
    },
  },
};
