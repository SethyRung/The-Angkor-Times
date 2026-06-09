import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  future: {
    compatibilityVersion: 4,
  },
  compatibilityDate: "2026-01-01",
  devtools: { enabled: true },
  css: ["~/assets/css/main.css"],
  modules: ["@nuxt/ui", "@vueuse/nuxt", "@nuxthub/core", "@nuxt/content"],
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
  colorMode: {
    preference: "dark",
  },
  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      include: [
        "@nuxt/ui > prosemirror-gapcursor",
        "@nuxt/ui > prosemirror-model",
        "@nuxt/ui > prosemirror-state",
        "@nuxt/ui > prosemirror-transform",
        "@nuxt/ui > prosemirror-view",
        "dayjs",
        "dayjs/plugin/relativeTime",
        "dayjs/plugin/timezone",
        "dayjs/plugin/updateLocale",
        "dayjs/plugin/utc",
        "tailwind-variants",
        "zod",
      ],
    },
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
