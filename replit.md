# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   └── api-server/         # Express API server
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts (single workspace package)
│   └── src/                # Individual .ts scripts, run via `pnpm --filter @workspace/scripts run <script>`
├── pnpm-workspace.yaml     # pnpm workspace (artifacts/*, lib/*, lib/integrations/*, scripts)
├── tsconfig.base.json      # Shared TS options (composite, bundler resolution, es2022)
├── tsconfig.json           # Root TS project references
└── package.json            # Root package with hoisted devDeps
```

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references. This means:

- **Always typecheck from the root** — run `pnpm run typecheck` (which runs `tsc --build --emitDeclarationOnly`). This builds the full dependency graph so that cross-package imports resolve correctly. Running `tsc` inside a single package will fail if its dependencies haven't been built yet.
- **`emitDeclarationOnly`** — we only emit `.d.ts` files during typecheck; actual JS bundling is handled by esbuild/tsx/vite...etc, not `tsc`.
- **Project references** — when package A depends on package B, A's `tsconfig.json` must list B in its `references` array. `tsc --build` uses this to determine build order and skip up-to-date packages.

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages that define it
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references

## Packages

### `artifacts/api-server` (`@workspace/api-server`)

Express 5 API server. Routes live in `src/routes/` and use `@workspace/api-zod` for request and response validation and `@workspace/db` for persistence.

- Entry: `src/index.ts` — reads `PORT`, starts Express
- App setup: `src/app.ts` — mounts CORS, JSON/urlencoded parsing, routes at `/api`
- Routes: `src/routes/index.ts` mounts sub-routers; `src/routes/health.ts` exposes `GET /health` (full path: `/api/health`)
- Depends on: `@workspace/db`, `@workspace/api-zod`
- `pnpm --filter @workspace/api-server run dev` — run the dev server
- `pnpm --filter @workspace/api-server run build` — production esbuild bundle (`dist/index.cjs`)
- Build bundles an allowlist of deps (express, cors, pg, drizzle-orm, zod, etc.) and externalizes the rest

### `lib/db` (`@workspace/db`)

Database layer using Drizzle ORM with PostgreSQL. Exports a Drizzle client instance and schema models.

- `src/index.ts` — creates a `Pool` + Drizzle instance, exports schema
- `src/schema/index.ts` — barrel re-export of all models
- `src/schema/<modelname>.ts` — table definitions with `drizzle-zod` insert schemas (no models definitions exist right now)
- `drizzle.config.ts` — Drizzle Kit config (requires `DATABASE_URL`, automatically provided by Replit)
- Exports: `.` (pool, db, schema), `./schema` (schema only)

Production migrations are handled by Replit when publishing. In development, we just use `pnpm --filter @workspace/db run push`, and we fallback to `pnpm --filter @workspace/db run push-force`.

### `lib/api-spec` (`@workspace/api-spec`)

Owns the OpenAPI 3.1 spec (`openapi.yaml`) and the Orval config (`orval.config.ts`). Running codegen produces output into two sibling packages:

1. `lib/api-client-react/src/generated/` — React Query hooks + fetch client
2. `lib/api-zod/src/generated/` — Zod schemas

Run codegen: `pnpm --filter @workspace/api-spec run codegen`

### `lib/api-zod` (`@workspace/api-zod`)

Generated Zod schemas from the OpenAPI spec (e.g. `HealthCheckResponse`). Used by `api-server` for response validation.

### `lib/api-client-react` (`@workspace/api-client-react`)

Generated React Query hooks and fetch client from the OpenAPI spec (e.g. `useHealthCheck`, `healthCheck`).

### `scripts` (`@workspace/scripts`)

Utility scripts package. Each script is a `.ts` file in `src/` with a corresponding npm script in `package.json`. Run scripts via `pnpm --filter @workspace/scripts run <script>`. Scripts can import any workspace package (e.g., `@workspace/db`) by adding it as a dependency in `scripts/package.json`.

---

## RSR Intelligence Network (`artifacts/rsr-intelligence`)

React + Vite + Tailwind v4 intelligence platform. Black/emerald CIA-terminal aesthetic.

### Pages
- `/` — Home (live signal feed)
- `/systems`, `/systems/:slug` — System Architecture
- `/files`, `/files/:id` — File Detail
- `/dossiers`, `/dossiers/:id` — Dossier Detail
- `/world` — Global Posture
- `/signal-room` — Live GDELT news feed (public)
- `/investigation-room` — Realtime chat, SAGE AI, case tracking (authenticated + approved)
- `/command` — Admin console: user/channel/case management (admin only)
- `/access` — Login/registration
- `/briefing` — Public briefing

### Backend API (`artifacts/api-server`)
Express server, port 8080 in dev.
- `GET /api/news` — GDELT geopolitical news, 10-min cache, startup prefetch
- `POST /api/sage` — SAGE AI terminal (OpenAI gpt-5.2, 600 token max, RSR context)
- `GET /api/health` — Health check

### Client-Side Routing (IMPORTANT)
The app uses **hash-based routing** via a custom `useHashLocation` hook (`src/lib/hashLocation.ts`). This eliminates all 404s from server-side SPA fallback issues. All URLs use the `#/path` format (e.g. `https://example.com/#/investigation-room`).

- Internal navigation links use paths like `/investigation-room` (no `#` needed — wouter handles it)
- Notification links stored in DB should use the format: `#/investigation-room?channel=investigations`
- `useSearch()` still works — our navigate function puts `?channel=` in the real URL search, not inside the hash
- `useSearch()` in InvestigationRoom correctly reads `?channel=` and `?message=` for deep-linking

### API Routing
In development, Vite proxies `/api/*` → `http://localhost:8080` (api-server) automatically via the proxy in `vite.config.ts`.

In **production (EdgeOne single deployment)**, all `/api/*` routes are served by EdgeOne Node Functions defined in `node-functions/api/`. No separate api-server is needed. Frontend calls use `` `${import.meta.env.VITE_API_BASE_URL ?? ""}/api/...` `` — when `VITE_API_BASE_URL` is unset (production), it resolves to the relative same-origin `/api/...`.

### EdgeOne Single Deployment Setup

**Repository structure:**
```
node-functions/
  api/
    news.js                      → GET  /api/news
    sage.js                      → POST /api/sage
    status.js                    → GET  /api/status
    investigation-status.js      → GET  /api/investigation-status
    investigation-chat-status.js → GET  /api/investigation-chat-status
    investigation-chat-recent.js → GET  /api/investigation-chat-recent
    investigation-presence.js    → GET  /api/investigation-presence
    investigation-admin.js       → GET  /api/investigation-admin
artifacts/rsr-intelligence/
  src/            → React frontend source
  dist/public/    → Vite build output (EdgeOne serves this)
edgeone.json      → build config (repo root)
```

**EdgeOne directory convention:**
- `node-functions/` — Node.js Cloud Functions (full Node.js, `process.env` available)
- `edge-functions/` — Edge Functions (V8/Worker API, no `process.env`)
- `functions/` — Edge Functions legacy alias
All handlers use named exports (`export { onRequestGet }` / `export { onRequestPost }`).

**EdgeOne project settings (configure in EdgeOne Pages console):**
- **Root Directory**: `/` (repo root — leave blank or set to root)
- **Build Command**: `pnpm --filter @workspace/rsr-intelligence run build`
- **Output Directory**: `artifacts/rsr-intelligence/dist/public`
- **Install Command**: `pnpm install`

**Environment variables to set in EdgeOne Pages console:**
| Variable | Required | Description |
|---|---|---|
| `VITE_SUPABASE_URL` | ✓ | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | ✓ | Your Supabase anon key |
| `AI_INTEGRATIONS_OPENAI_API_KEY` | ✓ | OpenAI (or compatible) API key for SAGE |
| `AI_INTEGRATIONS_OPENAI_BASE_URL` | optional | Custom OpenAI base URL — defaults to `https://api.openai.com/v1` |

**Notes:**
- `VITE_*` vars are embedded at build time into the frontend JS bundle
- `AI_INTEGRATIONS_*` vars are runtime secrets used only by the cloud functions (never sent to the browser)
- No `VITE_API_BASE_URL` is needed in production — cloud functions are same-origin

### vite.config.ts build defaults
PORT and BASE_PATH are optional in production builds — they default to `3000` and `/` respectively when `NODE_ENV=production`. Required in Replit dev (always set by the workflow).

### Supabase
- `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` — frontend auth and realtime
- `SUPABASE_SERVICE_ROLE_KEY` — server-side only (not currently used in api-server routes)
- Schema: `profiles`, `room_channels`, `room_messages`, `investigation_cases`
- Run `supabase-setup.sql` in Supabase SQL editor to create tables, RLS policies, and seed data

### Key design decisions
- `room_channels.id` is TEXT PRIMARY KEY; new channels use `crypto.randomUUID()` for id, separate slug field
- `room_messages` requires `REPLICA IDENTITY FULL` for reliable realtime DELETE events
- Admin message actions (edit/pin/delete) use RLS: `role = 'admin'` in profiles
- Case ref links: `F-\d+` → `/files/:ref`, `D-\d+` → `/dossiers/:ref`, all others display as plain text (no bad route)
