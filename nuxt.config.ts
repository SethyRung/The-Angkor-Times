export default defineNuxtConfig({
  future: {
    compatibilityVersion: 4,
  },
  compatibilityDate: "2026-01-01",
  devtools: { enabled: true },
  css: ["~/assets/css/main.css"],
  modules: ["@nuxt/ui", "@vueuse/nuxt", "dayjs-nuxt", "nuxt-directus"],
  runtimeConfig: {
    public: {
      siteName: "",
      copyright: "",
      directus: {
        url: "",
      },
    },
  },
});
