export default defineNuxtConfig({
  compatibilityDate: "2024-04-03",
  devtools: { enabled: true },
  css: ["~/assets/css/main.css"],
  modules: [
    "@nuxt/ui",
    "@nuxt/eslint",
    "@pinia/nuxt",
    "@vueuse/nuxt",
    "dayjs-nuxt",
    "@nuxtjs/google-fonts",
  ],
  colorMode: {
    preference: "light",
  },
  googleFonts: {
    download: true,
    families: {
      Inter: [100, 200, 300, 400, 500, 600, 700, 800, 900],
      "Red Hat Dispay": [100, 200, 300, 400, 500, 600, 700, 800, 900],
    },
  },
});