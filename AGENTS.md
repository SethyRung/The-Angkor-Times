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
docker compose up -d                # postgres:17 on :5432
cp .env.example .env                # one-time; required for hub, JWT, and admin bootstrap
```

Env vars read by Nuxt Hub / Nuxt: `DATABASE_URL`, `DATABASE_DRIVER` (`postgres-js` or `neon-http`), `BLOB_STORE_ID`, `BLOB_READ_WRITE_TOKEN`, plus `NUXT_JWT_*` and `NUXT_ADMIN_*` for the bootstrap-admin task. Do not change the env var names — they are read directly in `nuxt.config.ts` and `server/utils/`.

## Architecture

- **Nuxt 4 layout** (`future.compatibilityVersion: 4`): app source under `app/`, server under `server/`, shared under `shared/`. There are no root-level `pages/`, `components/`, or `composables/`.
- **Auto-imports are on**:
  - `app/composables/*` — e.g. `useFetchApi`, `useApi`, `useUser` (just call them, no import)
  - `app/components/*` — component names by path
  - `server/utils/*` — `createResponse` is available in every server route
  - `shared/types/response.ts` — `isSuccessResponse`, `ApiResponseCode`, etc. are global
  - `dayjs` and `useDayjs` — see below
  - Nuxt basics: `definePageMeta`, `defineEventHandler`, `useRoute`, `useRouter`, `useState`, `navigateTo`, `$fetch`, `useFetch`, `useRuntimeConfig`, etc.
- **`shared/` is imported via the `#shared` alias**: `import type { AuthUser } from "#shared/types"`. Never write `shared/types/...` (fails typecheck — that alias is generated into `.nuxt/tsconfig.json`).
- **Tailwind v4** (not v3) — config lives in `app/assets/css/main.css` via `@import "tailwindcss"` and `@theme`. Do not create a `tailwind.config.js`. Custom palettes `mint`, `ultraviolet`, `canvas` are defined there.

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
- **Client side**: use `useFetchApi<ApiResponse<T>>("/api/...")` (defined in `app/composables/useFetchApi.ts` — propagates cookies via `h3` on SSR). Always check with `isSuccessResponse(res)` before reading `res.data`; otherwise `res.data` is `null` and `res.status.message` has the reason.
- **Local dev cache**: `.data/` is the Nuxt Hub working folder (gitignored). Do not commit it; do not put secrets in it.
- **Production**: `pnpm build` then `nuxthub deploy` — NuxtHub Cloud provisions managed Postgres. No separate `docker compose` for prod.
- **Status field**: under Directus the `news.status` enum was `Pending Approval` | `Published` | `Rejected`. In the Drizzle schema this is now a `publishedAt: timestamp` column — `NULL` = pending/draft, non-NULL = published. Public news endpoints filter on `isNotNull(schema.news.publishedAt)`.

## Server

- **`server/middleware/auth.ts`** gates every non-public `/api/**` route. It reads the `access_token` cookie, verifies JWT, attempts a refresh via `server/utils/refreshToken.ts` on miss, and rejects with `ApiResponseCode.Unauthorized` / `ApiResponseCode.Forbidden`. The public-route allowlist is in `server/utils/auth.ts` (`isPublicRoute`).
- **`server/utils/`** is auto-imported — `createResponse`, `verifyToken`, `isEditorOrAdmin`, etc. are global in `server/api/**` and `server/middleware/**`.
- **`server/tasks/db/`** contains Nitro tasks (`nitro.experimental.tasks: true` in `nuxt.config.ts`): `bootstrap-admin.ts` creates the first admin from `NUXT_ADMIN_EMAIL` / `NUXT_ADMIN_PASSWORD` if no admin exists; `seed.ts` loads demo data. Run via `nuxthub run db/bootstrap-admin` (or whichever) on a fresh DB.
- **JWT runtime config** lives at `runtimeConfig.jwt.access` and `runtimeConfig.jwt.refresh` in `nuxt.config.ts`. Env: `NUXT_JWT_ACCESS_SECRET`, `NUXT_JWT_ACCESS_EXPIRES_IN`, `NUXT_JWT_REFRESH_SECRET`, `NUXT_JWT_REFRESH_EXPIRES_IN`. Default access TTL is 15m, refresh 7d.

## dayjs

A local Nuxt module at `modules/dayjs/` is **auto-loaded by Nuxt** from the `modules/` directory (Nuxt convention — it is not listed in `nuxt.config.ts` `modules`). It generates a typed dayjs build with the plugins listed in `nuxt.config.ts` (`relativeTime`, `utc` by default; `add 'timezone'` if you need tz-aware output) and exposes `dayjs` and `useDayjs` as auto-imported globals. **Never write `import dayjs from "dayjs"`** — use the global directly.

## Nuxt UI v4

`@nuxt/ui` is on **v4** (`^4.8.2`). Differences from v3 docs online:

- **Pro components are included** — `UHeader`, `UFooter`, `UMain`, `UPage`, `UPageHero`, `UPageSection`, `UBlogPost`, `UAuthForm`, etc. are all available without a separate `@nuxt/ui-pro` package.
- **Nuxt UI MCP** (`opencode.json` -> `nuxt-ui` server) may serve v3 docs for some components. Cross-check with the generated theme files in `.nuxt/ui/<component>.ts` when slot names or default classes matter.
- **`@nuxt/fonts` is NOT installed** — fonts load via Google Fonts CDN `<link>` tags in `nuxt.config.ts` `app.head`. `@theme` font declarations are NOT auto-loaded.
- **Forms**: Zod schemas typed via `import * as z from "zod"` and `z.email()` (Zod 4 syntax). `FormSubmitEvent<Schema>` is the validated submit payload type. See `app/pages/login.vue` for the canonical pattern.
- **Color overrides** flow through `app.config.ts` (currently `primary=mint`, `secondary=ultraviolet`, `neutral=canvas`, `success=mint`, `error=ultraviolet`) — which means `color="primary"` already gives you mint and `color="error"` is ultraviolet, not red.

## Design system

`DESIGN.md` is the full spec. The rules an agent would violate by default:

- **Dark mode only** — `colorMode.preference: "dark"` in `nuxt.config.ts`. Never add light-mode styles or `UColorModeButton`.
- **Four font families**: `font-mono` (Space Grotesk), `font-mono` (JetBrains Mono), `font-serif` (Newsreader), `font-display` (Archivo Black). Display is for hero headlines and the wordmark; mono is always UPPERCASE with wide tracking.
- **Mono kicker / timestamp pattern** — `font-mono text-xs uppercase tracking-widest` is the canonical combo for kickers, timestamps, category tags, and button labels. Lowercase mono does not exist on this site.
- **No shadows for elevation** — use 1px borders (`border-white/10`, `border-mint-500`) or saturated color-block fills.
- **No gradients** — solid color blocks only. Even the `bg-gradient-to-r` "hairline" pattern is off-brand; use a flat 1px colored bar instead.
- **Deep link blue** (`#3860be`) is the hover color on every link, regardless of base color. On dark backgrounds use the lighter `#7a9de8` for contrast (see `StoryTile.vue:50`).
- **Radius scale**: 2px (inputs/badges), 20px (cards/tiles), 24px (feature cards, primary buttons), 40px (outlined CTAs), `rounded-full` (circles). No square corners on interactive elements.

## Code style

Enforced by `oxfmt.config.ts` and `oxlint.config.ts`:

- Double quotes, semicolons, trailing commas (`all`), 2-space indent, LF, print width 100.
- Lint explicitly allows `any` and empty object types (turned off in `oxlint.config.ts`) — do not "fix" these to stricter rules without asking.
- Format/lint ignore `node_modules`, `.agents`, `.nuxt`, `.output`, `.data`, `.nitro`, `.cache`, `dist`, `pnpm-lock.yaml`.
- **No comments unless asked** (project rule).
- `pnpm-workspace.yaml` exists with `allowBuilds: esbuild: true` — required for pnpm 11 to allow esbuild's native build step.

## Tooling (OpenCode)

`opencode.json` wires two MCP servers: `nuxt` (remote) and `nuxt-ui` (remote). Installed agent skills (see `skills-lock.json`): `agent-browser`, `nuxt-ui`. Use the `nuxt-ui` skill when building or restyling components; it has the recipes for forms, auth, layouts, and data tables.

## Workflow

- Two long-lived branches: `main` (production) and `dev`. PRs merge `dev` -> `main`. No CI — run `lint` -> `fmt` -> `typecheck` locally before pushing.
- `AGENTS.md`, `DESIGN.md`, and `pnpm-lock.yaml` are not scratch space. `.env` is gitignored; only `.env.example` is committed. Do not commit secrets.
- Commit messages follow Conventional Commits (see `git log --oneline`: `chore: ...`, `feat(ui): ...`, etc.).
