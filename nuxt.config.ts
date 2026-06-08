import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  future: {
    compatibilityVersion: 4,
  },
  compatibilityDate: "2026-01-01",
  devtools: { enabled: true },
  css: ["~/assets/css/main.css"],
  modules: ["@nuxt/ui", "@vueuse/nuxt", "@nuxthub/core"],
  fonts: {
    families: [{ name: "IoskeleyMono", provider: "local" }],
  },
  hub: {
    db: {
      dialect: "postgresql",
      driver: process.env.DATABASE_DRIVER as "postgres-js" | "neon-http",
    },
    blob: {
      driver: "vercel-blob",
    },
  },
  dayjs: {
    plugins: ["relativeTime", "utc"],
  },
  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      include: [
        "dayjs",
        "dayjs/plugin/relativeTime",
        "dayjs/plugin/timezone",
        "dayjs/plugin/updateLocale",
        "dayjs/plugin/utc",
        "zod",
        "@nuxt/ui > prosemirror-state",
        "@nuxt/ui > prosemirror-transform",
        "@nuxt/ui > prosemirror-model",
        "@nuxt/ui > prosemirror-view",
        "@nuxt/ui > prosemirror-gapcursor",
      ],
    },
  },
  colorMode: {
    preference: "dark",
  },
  runtimeConfig: {
    admin: {
      email: "",
      password: "",
    },
    jwt: {
      access: {
        secret: "",
        expiresIn: "",
      },
      refresh: {
        secret: "",
        expiresIn: "",
      },
    },
  },
  nitro: {
    experimental: {
      tasks: true,
    },
  },
});
