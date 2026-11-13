# Decisions

Why the template is built the way it is, so nobody (human or AI) re-argues them by accident.
Change a decision by adding a dated entry below it, and update AGENTS.md in the same PR.

## D1. One Next.js app, no separate backend (2026-11-13)

**Decision:** the Next.js app is the backend. Reads run in Server Components through module
`queries.ts`; writes are server actions in `actions.ts`; route handlers (`src/app/api`) only for
things that need a URL (auth, health, exports, webhooks, slow jobs).

**Why:** an ERP's "API" is the app's own screens. A separate server (Express, Nest, Hono, Medusa)
doubles deploys, auth, types and hosting for no gain at this size, and a non-expert maintainer pays
for every extra moving part. Server actions give typed calls with no API layer to keep in sync.

**When to revisit:** a mobile app or another system needs to call the ERP. Then add a versioned
REST API in `src/app/api/v1/*` that calls the **same repositories** (the data layer is already
transport-free), or put Hono behind a Next route handler. Business logic never moves into it.

**Not Medusa:** Medusa is a commerce engine (products, carts, checkout, payments, fulfilment). An
ERP built from spreadsheets needs none of that, and Medusa's module system and admin would slow
every change. If online selling is added later, it is a separate project that talks to the ERP.

## D2. Data behind one Repository interface, per-module source (2026-11-13)

**Decision:** every module defines an entity (schema + Postgres table + Sheets tab) and is read and
written only through `repo(entity)`. `DATA_SOURCE` sets the default store; `DATA_SOURCE_<MODULE>`
overrides it per module (hybrid). Adapters: `postgres`, `sheets`, `memory`.

**Why:** the business already runs on Google Sheets. Moving everything at once is risky; this lets
the app read the sheets on day one, move one module at a time to Postgres (`pnpm sheets:copy`),
and keep the rest of the code unchanged. The contract test keeps adapters identical in behaviour.

**Limits of Sheets:** whole-tab reads (fine to a few thousand rows), no transactions, people can
edit rows while the app runs. Anything with money that must add up, or many users writing at once,
belongs in Postgres.

## D3. Postgres + Drizzle (2026-11-13)

Postgres is the long-term home for business data (transactions, constraints, reporting). Drizzle
gives typed SQL without hiding it, plain SQL migrations, and works with every Postgres host
(Neon, Supabase, Railway, RDS). Casing is `snake_case` in SQL, camelCase in TypeScript.

## D4. Local database: embedded-postgres, PGlite for tests only (2026-11-13)

**Decision:** `pnpm dev` starts a real Postgres 18 server from the `embedded-postgres` package
(binaries shipped through npm, ~340 MB once), data in `~/.start-loop/<app>/postgres`. Unit tests
use in-memory PGlite. Docker is not needed.

**Why, learned while building this:** PGlite inside the app cannot be shared by Next's several
dev processes; PGlite's socket server mixed up overlapping queries (error 08P01); and any data
folder inside the project made the dev server reload endlessly. A real server process outside the
project has none of these problems. If someone prefers Docker or a hosted dev database, setting
`DATABASE_URL` skips the local server entirely.

## D5. Better Auth with roles (2026-11-13)

Self-hosted (users stay in our Postgres), email + password now, Google/Microsoft sign-in and
organisations are plugins when needed. Roles `admin` / `member`; the first account is admin.
Permission checks happen on the server in every action (`requireActionUser("admin")`).

## D6. UI: shadcn/ui on Tailwind 4, neutral theme, light/dark/system (2026-11-13)

Components are copied into the repo (we own and can read them), built on Radix for accessibility.
The theme is plain neutral with status and chart tokens; branding is changing a few tokens in
`globals.css`. TanStack Table for lists (server-side paging), Recharts through shadcn `chart` for
charts (the replacement for Google Sheets charts), react-hook-form + Zod for forms.

## D7. Biome instead of ESLint + Prettier (2026-11-13)

One fast tool for lint and format, one config file, recommended rules plus `noExplicitAny` and
exhaustive hook dependencies. Generated shadcn components are excluded from linting.

## D8. One language for now (2026-11-13)

User-facing text sits in components, in the business's language. When a second language is
needed, move strings to `next-intl` message files (one key per sentence, ICU plurals) in one PR;
do not half-translate. Developer text is always English.

## D9. Git: `main` + feature branches + PRs, tags for releases (2026-11-13)

A single production branch keeps things simple for one maintainer. Add a `dev`/staging branch
when there are real users who must not see half-finished work (see GIT-WORKFLOW.md).
