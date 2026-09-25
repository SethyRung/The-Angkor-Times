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
  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      include: [],
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
