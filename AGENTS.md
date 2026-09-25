# AGENTS.md

Notes for AI agents working in this repo.

## Project

The Angkor Times — a news website (admin-approval workflow) built on **Nuxt 4** + **Nuxt Hub** + **PostgreSQL**. `@nuxthub/core` provides the DB abstraction (Drizzle ORM under the hood) and a `nuxthub deploy` path to NuxtHub Cloud. Dev runs against a local Postgres container; production deploys to NuxtHub Cloud's managed Postgres.

## Commands

Package manager is **bun**.

```bash
bun install           # postinstall runs `nuxt prepare` — Postgres must be up
bun run dev           # dev server on :3000
bun run build         # production build

bun run lint          # oxlint
bun run lint:fix      # oxlint --fix
bun run fmt           # oxfmt
bun run fmt:check     # oxfmt --check
bun run typecheck     # nuxt typecheck (vue-tsc)
```

`oxlint` and `oxfmt` accept file paths for targeted runs.

**Validation order**: `lint` → `fmt` → `typecheck`. No test suite, no CI — run all three locally before pushing.

**After bumping `typescript` or `@nuxthub/core`, run `bun install`** — incompatible pairs break `nuxt prepare` (rolldown-plugin-dts).

## Setup

```bash
docker compose up -d   # postgres:18-alpine on :5432
cp .env.example .env   # one-time; required for hub, JWT, and admin bootstrap
```

Env names live in `.env.example` and are read directly in `nuxt.config.ts` and `server/utils/` — keep the names.

## Architecture

- **Nuxt 4 layout** (`future.compatibilityVersion: 4`): `app/`, `server/`, `shared/` — no root-level pages/components/composables.
- **Auto-imports are on**: `app/composables/*` (`useFetchApi`, `useApi`, `useUser`), `app/components/*` by path, `server/utils/*`, `shared/types` (`isSuccessResponse`, `ApiResponseCode`, `CookieName`), `shared/utils`. Convention: import `shared/` helpers explicitly, as in the Dates section below.
- **`shared/` is imported via the `#shared` alias** (`#shared/types`, `#shared/utils/date`); writing `shared/types/...` fails typecheck.
- **`app/types/` is not auto-imported** — `import type { NewsItem } from "~/types/news"`.
- **`useSeoMeta` takes no getter functions** — reactive SEO meta goes through `useHead(() => ({ ... }))`.
- **Theming lives in two files**: `app/assets/css/main.css` (`@theme` — custom palettes like `ink` and `uv`; never create a `tailwind.config.js`) and `app/app.config.ts` (color aliases and component defaults). Read them for current values.
- **Fonts run through `@nuxt/fonts`** (bundled with `@nuxt/ui`; configured via `fonts` in `nuxt.config.ts`): `font-mono` is `IoskeleyMono`, TTFs in `public/IoskeleyMono/`. New fonts go through this pipeline — never CDN links or extra font packages.

### Data layer (Nuxt Hub + Postgres + Drizzle)

Real pattern from `server/api/**`:

```ts
import { db, schema } from "@nuxthub/db";
import { eq, desc, isNotNull } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  const rows = await db
    .select({ ... })
    .from(schema.news)
    .leftJoin(schema.categories, eq(schema.news.categoryId, schema.categories.id))
    .where(isNotNull(schema.news.publishedAt))
    .orderBy(desc(schema.news.publishedAt))
    .limit(20);
});
```

- Schema lives in `server/db/schema.ts` — new tables export from there so `@nuxthub/db` picks them up. Migrations live in `server/db/migrations/postgresql/`, generated and applied with `bun run db:generate` / `bun run db:migrate`.
- Every API route returns `createResponse(status, data, meta?)` — the `ApiResponse<T>` envelope from `shared/types/response.ts`.
- Client side: `useFetchApi<ApiResponse<T>>()` for SSR, `useApi()` otherwise. Gate every read with `isSuccessResponse(res)`; on failure `res.data` is null and `res.status.message` has the reason.
- **`publishedAt` is the status**: NULL = pending, non-NULL = published. Public endpoints filter `isNotNull(schema.news.publishedAt)`. There is no status enum.
- **`news` has no slug column** — routes use UUIDs: `/news/${id}`.
- `.data/` is the Nuxt Hub working folder — gitignored, no secrets in it.

## Server

- **`server/middleware/auth.ts`** gates every non-public `/api/**` route: it verifies the access-token JWT (`CookieName` enum, `shared/types/response.ts`), rotates both tokens via `server/utils/refreshToken.ts` on expiry, and rejects with `Unauthorized`/`Forbidden`. Two-tier roles: `/api/admin/users` is admin-only; other `/api/admin/*` routes are editor+admin. Public allowlist: `isPublicRoute` in `server/utils/auth.ts`.
- **JWT config** is `runtimeConfig.jwt.access` / `.refresh` in `nuxt.config.ts`, fed by the `NUXT_JWT_*` env vars.
- **First admin**: Nitro task `db/bootstrap-admin` — `nuxthub run db/bootstrap-admin` on a fresh DB (credentials from `NUXT_ADMIN_*`). No seed task.

## Client

- **`app/plugins/fetch.ts`** — `$fetch` with cookie forwarding; `useApi` resolves to it.
- **`app/plugins/auth.ts`** — populates `useUser()` from `/api/auth/me`; depends on `fetch`.
- **`app/middleware/admin.ts`** — named route middleware (not global): requires `admin`/`editor`, else redirects to `/login`.

## Dates

`shared/utils/date.ts` owns all dayjs setup — utc, timezone, customParseFormat, relativeTime — pinned to `Asia/Phnom_Penh`. Import its helpers explicitly:

```ts
import { now, toDayJS } from "#shared/utils/date";
```

- `now()` — current time in Phnom Penh, as a `Dayjs`.
- `toDayJS(value, format?)` — parses ISO strings and `Date`s (nullable DB fields fine) into Phnom Penh time, throwing on bad input so invalid data fails loudly instead of rendering "Invalid Date".

Import `dayjs` itself only inside the util — it owns plugin setup. Chain dayjs methods (`.format`, `.fromNow()`, `.year()`) on the returned `Dayjs`.

## Nuxt UI v4

- **v4, not v3** — online docs and the Nuxt UI MCP may serve v3 content. Cross-check slot names and default classes against `.nuxt/ui/<component>.ts`.
- **Pro components are included** — `UHeader`, `UFooter`, `UPage`, `UPageHero`, `UBlogPost`, `UAuthForm`, etc. No separate pro package.
- **Zod 4 syntax**: `import * as z from "zod"`, `z.email()` — not `z.string().email()`. `app/pages/login.vue` is the canonical form pattern (`FormSubmitEvent<Schema>` for the submit payload).
- **Editor**: tiptap, `app/components/editor/Editor.vue`. Content is HTML in `news.content`, rendered with `v-html` on the detail page.

## Design

`DESIGN.md` is the binding spec — read it before any UI work. It covers typography, color tokens, radius, link colors, and elevation; the theme files in Architecture are its implementation.

## Code style

Enforced by `oxfmt.config.ts` and `oxlint.config.ts`: double quotes, semicolons, trailing commas, 2-space indent, LF, print width 100.

- **No comments unless asked.**
- **`any` and empty-object types are intentional** — lint allows them; keep the allowance.

## Workflow

- Two long-lived branches: `main` (production) and `dev`. PRs merge `dev` → `main`.
- Commit messages follow Conventional Commits: `feat(ui): …`, `fix(api): …`.
- `AGENTS.md`, `DESIGN.md`, and `bun.lock` are not scratch space. `.env` is gitignored — only `.env.example` is committed; no secrets in the repo.
