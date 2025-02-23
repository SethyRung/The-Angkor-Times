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
    "@nuxt/image",
  ],
  runtimeConfig: {
    public: {
      siteName: "",
      copyright: "",
      directus: {
        url: "",
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
      Inter: [100, 200, 300, 400, 500, 600, 700, 800, 900],
    },
  },
  image: {
    directus: {
      baseURL: `${process.env.NUXT_PUBLIC_DIRECTUS_URL}/assets/`,
    },
  },
});
