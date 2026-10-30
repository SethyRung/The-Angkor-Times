import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  future: {
    compatibilityVersion: 4,
  },
  compatibilityDate: "2026-01-01",
  devtools: { enabled: true },
  css: ["~/assets/css/main.css"],
  modules: [
    "@nuxt/ui",
    "@vueuse/nuxt",
    "@nuxthub/core",
    "@nuxtjs/better-auth",
    "@comark/nuxt",
    "@nuxt/test-utils/module",
    "@nuxtjs/mcp-toolkit",
    "@nuxtjs/seo",
  ],
  auth: {
    schema: {
      usePlural: true,
      casing: "snake_case",
    },
    redirects: {
      login: "/login",
      guest: "/",
      authenticated: "/admin",
      logout: "/",
    },
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
      include: [
        "gsap",
        "gsap/ScrollTrigger",
        "prosemirror-model",
        "prosemirror-state",
        "prosemirror-transform",
        "prosemirror-view",
      ],
    },
  },
  site: {
    name: "The Angkor Times",
    description:
      "A contemporary digital broadsheet publication covering political economy, culture, society, and technology across Cambodia and Southeast Asia.",
    defaultLocale: "en",
    separator: "—",
  },
  robots: {
    disallow: [
      "/admin",
      "/login",
      "/api/admin",
      "/api/auth",
      "/api/news",
      "/api/categories",
      "/api/navigation",
      "/api/tags",
    ],
  },
  routeRules: {
    "/admin/**": { robots: false },
    "/login": { robots: false },
  },
  sitemap: {
    exclude: ["/admin/**", "/login", "/__better-auth-devtools", { regex: "/^\\x2f__/" }],
    sources: ["/api/__sitemap__/urls"],
  },
  schemaOrg: {
    identity: {
      type: "Organization",
      name: "The Angkor Times",
      description:
        "A contemporary digital broadsheet publication covering political economy, culture, society, and technology across Cambodia and Southeast Asia.",
    },
  },
  seo: {
    automaticTwitterTags: false,
  },
  ogImage: false,
  aiReady: {
    apiCatalog: false,
    database: false,
    mcpServerCard: false,
    mcp: {
      resources: false,
      tools: false,
    },
  },
  mcp: {
    name: "the-angkor-times",
    description: "Prepare Pending news for The Angkor Times.",
  },
  runtimeConfig: {
    admin: {
      email: "",
      password: "",
    },
  },
  nitro: {
    experimental: {
      tasks: true,
      asyncContext: true,
    },
  },
});
