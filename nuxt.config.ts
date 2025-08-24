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
    "nuxt-directus",
    "@nuxt/image",
    "@nuxt/fonts",
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
  image: {
    directus: {
      baseURL: `${process.env.NUXT_PUBLIC_DIRECTUS_URL}/assets/`,
    },
  },
});
