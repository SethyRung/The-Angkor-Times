# AGENTS.md

Notes for AI agents working in this repo.

## Project

The Angkor Times — a news website (admin-approval workflow) built on **Nuxt 4** + **Nuxt Hub** + **PostgreSQL**. `@nuxthub/core@0.10.7` provides the DB abstraction (Drizzle ORM under the hood) and a `nuxthub deploy` path to NuxtHub Cloud. Dev runs against a local Postgres container; production deploys to NuxtHub Cloud's managed Postgres.

## Commands

Package manager is **pnpm 11.5.1** (`packageManager` field). Do not use npm or yarn.

```bash
pnpm install          # postinstall runs `nuxt prepare` and generates .nuxt/
pnpm dev              # Nuxt dev server on :3000
pnpm build            # production build
pnpm preview          # serve built output
pnpm generate         # static site generation

pnpm lint             # oxlint (NOT eslint — there is no eslint config)
pnpm lint:fix         # oxlint --fix
pnpm fmt              # oxfmt (NOT prettier)
pnpm fmt:check        # oxfmt --check
pnpm typecheck        # nuxt typecheck — vue-tsc against generated .nuxt/tsconfig.json
```

**Targeted invocations** (both `oxlint` and `oxfmt` accept file paths):

```bash
pnpm lint app/components/StoryTile.vue
pnpm fmt app/pages/login.vue
pnpm typecheck
```

**Validation order**: `lint` -> `fmt` -> `typecheck`. There is no test suite yet — run all three locally before pushing (no CI).

## Setup

Postgres is required for `pnpm dev` (Nuxt Hub connects at startup):

```bash
docker compose up -d                # postgres:17-alpine on :5432
cp .env.example .env                # one-time; required for hub, JWT, and admin bootstrap
```

Env vars (see `.env.example` for all): `DATABASE_URL`, `DATABASE_DRIVER` (`postgres-js` or `neon-http`), `BLOB_STORE_ID`, `BLOB_READ_WRITE_TOKEN`, `NUXT_JWT_ACCESS_SECRET`, `NUXT_JWT_REFRESH_SECRET`, `NUXT_JWT_ACCESS_EXPIRES_IN`, `NUXT_JWT_REFRESH_EXPIRES_IN`, `NUXT_ADMIN_EMAIL`, `NUXT_ADMIN_PASSWORD`. Do not change the names — they are read directly in `nuxt.config.ts` and `server/utils/`.

## Architecture

- **Nuxt 4 layout** (`future.compatibilityVersion: 4`): app source under `app/`, server under `server/`, shared under `shared/`. There are no root-level `pages/`, `components/`, or `composables/`.
- **Auto-imports are on**:
  - `app/composables/*` — `useFetchApi`, `useApi`, `useUser` (just call them, no import)
  - `app/components/*` — component names by path
  - `server/utils/*` — `createResponse`, `verifyToken`, `isEditorOrAdmin`, etc. are global in server routes
  - `shared/types/response.ts` — `isSuccessResponse`, `ApiResponseCode`, etc. are global
  - `dayjs` and `useDayjs` — see dayjs section below
  - Nuxt basics: `definePageMeta`, `defineEventHandler`, `useRoute`, `useRouter`, `useState`, `navigateTo`, `$fetch`, `useFetch`, `useRuntimeConfig`, etc.
- **`shared/` is imported via the `#shared` alias**: `import type { AuthUser } from "#shared/types"`. Never write `shared/types/...` (fails typecheck — that alias is generated into `.nuxt/tsconfig.json`).
- **`app/types/` is NOT auto-imported** — types like `NewsItem` and `TileVariant` require explicit `import type { NewsItem } from "~/types/news"`.
- **Tailwind v4** (not v3) — config lives in `app/assets/css/main.css` via `@import "tailwindcss"` and `@theme`. Do not create a `tailwind.config.js`. Custom color palettes defined there: `ultraviolet` and `canvas`.
- **Color overrides** in `app/app.config.ts`: `primary=teal`, `neutral=canvas`. So `color="primary"` = teal, not default blue.
- **`useSeoMeta` does NOT accept a getter function** — use `useHead(() => ({ title, meta: [...] }))` for reactive SEO meta instead.

## Data layer (Nuxt Hub + Postgres + Drizzle)

The real pattern in `server/api/**` is:

```ts
import { db, schema } from "@nuxthub/db";
import { eq, and, desc, sql, isNotNull } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  const rows = await db
    .select({ ... })
    .from(schema.news)
    .leftJoin(schema.categories, eq(schema.news.categoryId, schema.categories.id))
    .where(...)
    .orderBy(desc(schema.news.publishedAt))
    .limit(20);
});
```

- **Schema lives in `server/db/schema.ts`** — Drizzle table definitions. When adding a table, export it from there so the `@nuxthub/db` `schema` import picks it up. Migrations are in `server/db/migrations/postgresql/`.
- **Every API route returns** `createResponse(status, data, meta?)` from `server/utils/response.ts` — produces the `ApiResponse<T> = ApiResponseSuccess<T> | ApiResponseError` envelope defined in `shared/types/response.ts`.
- **Client side**: use `useFetchApi<ApiResponse<T>>("/api/...")` (defined in `app/composables/useFetchApi.ts` — propagates cookies via `h3` on SSR). For non-SSR calls use `useApi("/api/...", opts)` which goes through the `fetch` plugin. Always check with `isSuccessResponse(res)` before reading `res.data`; otherwise `res.data` is `null` and `res.status.message` has the reason.
- **Local dev cache**: `.data/` is the Nuxt Hub working folder (gitignored). Do not commit it; do not put secrets in it.
- **Production**: `pnpm build` then `nuxthub deploy` — NuxtHub Cloud provisions managed Postgres. No separate `docker compose` for prod.
- **Status field**: `publishedAt: timestamp` column — `NULL` = pending/draft, non-NULL = published. Public news endpoints filter on `isNotNull(schema.news.publishedAt)`. There is no separate `status` enum column.
- **The `news` table has no `slug` column** — routes use UUIDs: `/news/${id}`.

## Server

- **`server/middleware/auth.ts`** gates every non-public `/api/**` route (skips `/api/_` internals). It reads the access token cookie (`CookieName` enum), verifies JWT, attempts a full token rotation via `server/utils/refreshToken.ts` on expiry (issues new access + new refresh, revokes old refresh), and rejects with `ApiResponseCode.Unauthorized` / `ApiResponseCode.Forbidden`. Two-tier role enforcement: `/api/admin/users` = admin-only, `/api/admin/*` = editor+admin. Public-route allowlist is in `server/utils/auth.ts` (`isPublicRoute`).
- **`server/utils/`** is auto-imported — `createResponse`, `verifyToken`, `isEditorOrAdmin`, etc. are global in `server/api/**` and `server/middleware/**`.
- **`server/tasks/db/bootstrap-admin.ts`** is a Nitro task (`nitro.experimental.tasks: true`) that creates the first admin from `NUXT_ADMIN_EMAIL` / `NUXT_ADMIN_PASSWORD`. Run via `nuxthub run db/bootstrap-admin` on a fresh DB. There is no `seed.ts` task.
- **JWT runtime config** lives at `runtimeConfig.jwt.access` and `runtimeConfig.jwt.refresh` in `nuxt.config.ts`. Env: `NUXT_JWT_ACCESS_SECRET`, `NUXT_JWT_ACCESS_EXPIRES_IN`, `NUXT_JWT_REFRESH_SECRET`, `NUXT_JWT_REFRESH_EXPIRES_IN`. Default access TTL is 15m, refresh 7d.

## Client plugins

- **`app/plugins/fetch.ts`** (name: `"fetch"`) — creates a `$fetch` instance with cookie header forwarding and SSR `set-cookie` propagation. Provided as `nuxtApp.$fetch` (used by `useApi`).
- **`app/plugins/auth.ts`** (name: `"auth"`, `dependsOn: ["fetch"]`) — calls `/api/auth/me` on load and populates `useUser()` state. `useApi` resolves to the fetch plugin's `$fetch`.
- **`app/middleware/admin.ts`** — named route middleware (not global); checks `admin` or `editor` role, redirects to `/login` on failure.

## dayjs

A local Nuxt module at `modules/dayjs/` is **auto-loaded by Nuxt** from the `modules/` directory (Nuxt convention — it is not listed in `nuxt.config.ts` `modules`). It generates a typed dayjs build with the plugins listed in `nuxt.config.ts` (`relativeTime`, `utc` by default; add `'timezone'` to the plugins array if you need tz-aware output) and exposes `dayjs` and `useDayjs` as auto-imported globals. **Never write `import dayjs from "dayjs"`** — use the global directly.

## Nuxt UI v4

`@nuxt/ui` is on **v4** (`4.8.2`). Differences from v3 docs online:

- **Pro components are included** — `UHeader`, `UFooter`, `UMain`, `UPage`, `UPageHero`, `UPageSection`, `UBlogPost`, `UAuthForm`, etc. are all available without a separate `@nuxt/ui-pro` package.
- **Nuxt UI MCP** (`opencode.json` -> `nuxt-ui` server) may serve v3 docs for some components. Cross-check with the generated theme files in `.nuxt/ui/<component>.ts` when slot names or default classes matter.
- **`@nuxt/fonts` is NOT installed** — the only custom font is `IoskeleyMono` registered as `font-mono` via `@theme` in `main.css` with `provider: "local"`. Do not add `@nuxt/fonts` or Google Fonts CDN links.
- **Forms**: Zod v4 schemas typed via `import * as z from "zod"` and `z.email()` (Zod 4 syntax, not v3's `z.string().email()`). `FormSubmitEvent<Schema>` is the validated submit payload type. See `app/pages/login.vue` for the canonical pattern.
- **Editor**: tiptap-based rich text editor at `app/components/editor/Editor.vue`. Content is stored as HTML in the `news.content` column and rendered with `v-html` on the detail page.

## Design system

`DESIGN.md` is the full spec. The rules an agent would violate by default:

- **Dark mode only** — `colorMode.preference: "dark"` in `nuxt.config.ts`. Never add light-mode styles or `UColorModeButton`.
- **Custom font**: `font-mono` is `IoskeleyMono` (local). `font-display` is for hero headlines and the wordmark; mono is always UPPERCASE with wide tracking.
- **Mono kicker / timestamp pattern** — `font-mono text-xs uppercase tracking-widest` is the canonical combo for kickers, timestamps, category tags, and button labels. Lowercase mono does not exist on this site.
- **No shadows for elevation** — use 1px borders (`border-muted`, `border-primary-500`) or saturated color-block fills.
- **No gradients** — solid color blocks only. Even the `bg-gradient-to-r` "hairline" pattern is off-brand; use a flat 1px colored bar instead.
- **Deep link blue** (`#3860be`) is the hover color on every link, regardless of base color. On dark backgrounds use the lighter `#7a9de8` for contrast.
- **Radius scale**: 2px (inputs/badges), 20px (cards/tiles), 24px (feature cards, primary buttons), 40px (outlined CTAs), `rounded-full` (circles). No square corners on interactive elements.

## Code style

Enforced by `oxfmt.config.ts` and `oxlint.config.ts`:

- Double quotes, semicolons, trailing commas (`all`), 2-space indent, LF, print width 100.
- Lint explicitly allows `any` and empty object types (turned off in `oxlint.config.ts`) — do not "fix" these to stricter rules without asking.
- Format/lint ignore `node_modules`, `.agents`, `.nuxt`, `.output`, `.data`, `.nitro`, `.cache`, `dist`, `pnpm-lock.yaml`.
- **No comments unless asked** (project rule).
- `pnpm-workspace.yaml` has `allowBuilds` for `@parcel/watcher`, `esbuild`, and `vue-demi` — required for pnpm 11 native build steps.

## Tooling (OpenCode)

`opencode.json` wires two MCP servers: `nuxt` (remote) and `nuxt-ui` (remote). Installed agent skills (see `skills-lock.json`): `agent-browser`, `nuxt-ui`. Use the `nuxt-ui` skill when building or restyling components; it has the recipes for forms, auth, layouts, and data tables.

## Workflow

- Two long-lived branches: `main` (production) and `dev`. PRs merge `dev` -> `main`. No CI — run `lint` -> `fmt` -> `typecheck` locally before pushing.
- `AGENTS.md`, `DESIGN.md`, and `pnpm-lock.yaml` are not scratch space. `.env` is gitignored; only `.env.example` is committed. Do not commit secrets.
- Commit messages follow Conventional Commits (see `git log --oneline`: `chore: ...`, `feat(ui): ...`, etc.).
