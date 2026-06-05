# AGENTS.md

Notes for AI agents working in this repo.

## Project

The Angkor Times — a news website (admin-approval workflow) built on **Nuxt 4** frontend + **Directus** headless CMS, with **PostgreSQL** and **MinIO** (S3) storage. Backend services run via Docker Compose.

## Commands

Package manager is **pnpm** (pinned to 11.5.1 via `packageManager`). Do not use npm or yarn.

```bash
pnpm install          # postinstall runs `nuxt prepare`, which generates .nuxt/
pnpm dev              # Nuxt dev server on :3000
pnpm build            # production build
pnpm preview          # serve built output

pnpm lint             # oxlint (NOT eslint — no eslint config here)
pnpm lint:fix         # oxlint --fix
pnpm fmt              # oxfmt (NOT prettier)
pnpm fmt:check        # oxfmt --check
pnpm typecheck        # nuxt typecheck — runs vue-tsc against generated .nuxt/tsconfig.json
```

Required order when validating a change: **`lint` -> `fmt:check` -> `typecheck`**. There is no test suite yet.

Backend services (required for `pnpm dev` to talk to Directus):

```bash
docker compose up -d                # postgres:5432, minio:9000 + console:9090, directus:8055
```

Copy `.env.example` to `.env` before first run — both Nuxt and the Docker stack read from it.

## Architecture notes

- **Nuxt 4 directory layout**: source lives under `app/` (not the Nuxt 3 root-level `pages/`, `components/`). `server/` and `shared/` are the Nuxt 4 server and shared dirs. `nuxt.config.ts` sets `future.compatibilityVersion: 4`.
- **Auto-imports are on** — composables, components, utils are auto-imported per Nuxt defaults. Don't add explicit imports for things already available.
- **Modules in use** (`nuxt.config.ts`): `@nuxt/ui` (Tailwind v4 + component lib, root `<UApp>` in `app.vue` is required), `@vueuse/nuxt`, `nuxt-directus`.
- **Directus URL** is wired through `runtimeConfig.public.directus.url` and read from `NUXT_PUBLIC_DIRECTUS_URL`. Use `useDirectus*` composables from `nuxt-directus` rather than rolling your own fetch.
- **Tailwind v4** (not v3) — config lives in `app/assets/css/main.css` via `@import "tailwindcss"` and `@theme`. Do not create a `tailwind.config.js`.

## Code style

Enforced by `oxfmt.config.ts` and `oxlint.config.ts`:

- Double quotes, semicolons, trailing commas (`all`), 2-space indent, LF, print width 100.
- Lint allows `any` and empty object types (turned off in `oxlint.config.ts`) — don't "fix" these to stricter rules without asking.
- Format/lint ignore `.nuxt`, `.output`, `.data`, `.nitro`, `.cache`, `dist`, `.agents`, `pnpm-lock.yaml`.

## Tooling (OpenCode)

`opencode.json` wires three MCP servers: `nuxt` (remote), `nuxt-ui` (remote), and a local `directus` MCP pointed at `http://localhost:8055` with hardcoded dev creds (`admin@example.com` / `supersecret`) — the Directus stack must be up for that MCP to work.

Installed agent skills (see `skills-lock.json`): `agent-browser`, `nuxt-ui`. The `nuxt-ui` skill is the right starting point when building or restyling components.

## Workflow

- Two long-lived branches: `main` (production) and `dev`. PRs merge `dev` -> `main` (see git history). No CI is configured yet — run lint/fmt/typecheck locally before pushing.
- `AGENTS.md`, `.env`, and lockfiles should not be treated as scratch space; `.env` is gitignored (only `.env.example` is committed).
