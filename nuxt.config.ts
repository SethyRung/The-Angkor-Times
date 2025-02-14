export default defineNuxtConfig({
  compatibilityDate: "2024-04-03",
  devtools: { enabled: false },
  css: ["~/assets/css/main.css"],
  modules: [
    "@nuxt/ui",
    "@nuxt/eslint",
    "@pinia/nuxt",
    "@vueuse/nuxt",
    "@vueuse/motion/nuxt",
    "dayjs-nuxt",
    "@nuxtjs/google-fonts",
    "nuxt-directus",
  ],
  runtimeConfig: {
    public: {
      directus: {
        url: "https://the-angkor-times-backend.onrender.com",
      },
    },
  },
  colorMode: {
    preference: "light",
  },
  googleFonts: {
    download: true,
    families: {
      "Playfair Display": [400, 500, 600, 700, 800, 900],
      "Red Hat Display": [300, 400, 500, 600, 700, 800, 900],
    },
  },
});
