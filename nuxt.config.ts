import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  future: {
    compatibilityVersion: 4,
  },
  compatibilityDate: "2026-01-01",
  devtools: { enabled: true },
  css: ["~/assets/css/main.css"],
  modules: ["@nuxt/ui", "@vueuse/nuxt", "nuxt-directus"],
  dayjs: {
    plugins: ["relativeTime", "utc"],
  },
  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      include: [
        "dayjs",
        "dayjs/plugin/timezone",
        "dayjs/plugin/updateLocale",
        "dayjs/plugin/relativeTime",
        "dayjs/plugin/utc",
      ],
    },
  },
  colorMode: {
    preference: "dark",
    fallback: "dark",
  },
  runtimeConfig: {
    public: {
      siteName: "",
      directus: {
        url: "",
      },
    },
  },
});
