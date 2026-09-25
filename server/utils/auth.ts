const PUBLIC_ROUTES: { pattern: RegExp; methods: string[] }[] = [
  { pattern: /^\/api\/news$/, methods: ["GET"] },
  { pattern: /^\/api\/news\/[a-f0-9-]+$/, methods: ["GET"] },
  { pattern: /^\/api\/categories$/, methods: ["GET"] },
  { pattern: /^\/api\/categories\/[a-z0-9-]+$/, methods: ["GET"] },
  { pattern: /^\/api\/navigation$/, methods: ["GET"] },
  { pattern: /^\/api\/tags$/, methods: ["GET"] },
  { pattern: /^\/api\/_nuxt_icon\/.*$/, methods: ["GET"] },
];

export function isPublicRoute(path: string, method: string | undefined): boolean {
  return PUBLIC_ROUTES.some(
    (route) =>
      route.pattern.test(path) && (!method || route.methods.includes(method.toUpperCase())),
  );
}

export function isAdmin(role: string | undefined): boolean {
  return role === "admin";
}

export function isEditorOrAdmin(role: string | undefined): boolean {
  return role === "admin" || role === "editor";
}
