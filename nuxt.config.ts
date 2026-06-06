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
  colorMode: {
    preference: "dark",
    fallback: "dark",
  },
  app: {
    head: {
      link: [
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        { rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: "" },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Archivo+Black&family=JetBrains+Mono:wght@400;500;600;700&family=Newsreader:ital,wght@0,400;1,400&family=Space+Grotesk:wght@300;400;500;700&display=swap",
        },
      ],
    },
  },
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
