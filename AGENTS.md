# start-loop — the rulebook

An internal business app (ERP) built with Next.js, React, Tailwind and shadcn/ui. It starts as a
dashboard and a Sales module that can read from **Postgres, Google Sheets, or both**, and grows one
module at a time (customers, products, invoices, stock…). This file is the single source of truth
for how the code is built. Humans and AI agents follow the same rules. When a rule changes, change
it here in the same pull request, with the date.

Read next, when relevant: `docs/LESSONS.md` (mistakes that already happened — read once, fully),
`docs/ARCHITECTURE.md`, `docs/DATA-SOURCES.md`, `docs/ADDING-A-MODULE.md`, `docs/DESIGN-SYSTEM.md`,
`docs/TESTING.md`, `docs/GIT-WORKFLOW.md`, `docs/DEPLOYMENT.md`, `docs/ENVIRONMENT.md`, `docs/DECISIONS.md`.

---

## 1. Stack (versions are pinned in package.json; upgrade on purpose, never by accident)

| Layer                   | Choice                                                                                                 | Why (details in docs/DECISIONS.md)                                                             |
| ----------------------- | ------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------- |
| App                     | Next.js 16 (App Router, Turbopack), React 19, TypeScript 5.9 strict                                    | One app is frontend and backend. No separate API server until there is a real reason.          |
| UI                      | Tailwind CSS 4, shadcn/ui (Radix, style `radix-nova`), lucide icons, sonner toasts, next-themes        | Copy-in components we own; tokens in one CSS file; light and dark from day one.                |
| Tables / charts / forms | TanStack Table 8, Recharts 3 via shadcn `chart`, react-hook-form 7 + Zod 4                             | Server-side paging and sorting; charts follow the theme; one schema validates form and server. |
| Data                    | Postgres via Drizzle ORM 0.45 (postgres-js driver), Google Sheets via the Sheets REST API              | Behind one `Repository` interface; each module picks its source.                               |
| Local database          | `embedded-postgres` (a real Postgres 18 started by `pnpm dev`, data in `~/.start-loop/<app>/postgres`) | No Docker, no install. PGlite (in-memory Postgres) for unit tests only.                        |
| Auth                    | Better Auth 1.7 (email + password), roles `admin` / `member`                                           | Self-hosted, users in our own Postgres.                                                        |
| Quality                 | Biome 2 (lint + format), lefthook (git hooks), Vitest 5, Playwright 1.65                               | Fast; checks run on your machine before code leaves it.                                        |
| Runtime                 | Node 22 (`.nvmrc`), pnpm 10                                                                            |                                                                                                |
| Hosting                 | Vercel (app) + any Postgres (Neon recommended)                                                         | See docs/DEPLOYMENT.md.                                                                        |

## 2. Commands

```bash
./setup.sh              # once per machine: Node 22, pnpm, packages, hooks, .env.local, test browser, DB, checks (/setup)
pnpm dev                # local Postgres + migrations + app on http://localhost:3000
pnpm db:seed            # demo sales so the dashboard has data
pnpm check              # typecheck + lint + unit tests (run before every commit)
pnpm test:e2e           # browser tests (own server, own throwaway database)
pnpm build              # production build (must pass before a PR)

pnpm db:generate        # after changing a table: write the SQL migration into ./drizzle
pnpm db:migrate         # apply migrations (pnpm dev does it at start)
pnpm db:studio          # browse the database (while pnpm dev or pnpm db:server runs)
pnpm db:server          # only the local database, no app
pnpm sheets:check <module>          # can this module read its Google Sheet tab?
pnpm sheets:copy <module> [--apply] # copy a module from Sheets into Postgres
pnpm lint:fix           # format and fix what Biome can
```

## 3. Where things live

```
src/
  app/                    routes only: thin pages that call module queries and render module components
    (app)/                signed-in area: layout (sidebar, top bar), dashboard, one folder per module
    (auth)/               sign-in, sign-up
    api/                  route handlers: auth, health (no business logic here)
  modules/<name>/         one ERP module, everything about it in one folder:
    schema.ts             Zod schema = the single source of truth for the record (browser-safe)
    table.ts              its Postgres table (Drizzle)
    entity.ts             how it is stored: table + Sheets tab + searchable fields (server)
    queries.ts            reads for pages ("server-only")
    actions.ts            writes ("use server"): check user → validate → repository → revalidate
    stats.ts …            pure business logic, unit-tested
    components/           the module's UI (table columns, form dialog, charts, status labels)
    __tests__/            its unit tests
  components/ui/          shadcn components (generated: add with `pnpm dlx shadcn@4.23.0 add <name>`, edit rarely)
  components/app/         shared app components: data table, page header, KPI card, status badge, money input…
  server/
    env.ts                every environment variable, validated at start
    auth.ts, session.ts   Better Auth; requireUser() / requireActionUser(role)
    db/                   database client, schema index, local Postgres for development
    data/                 the Repository interface and its adapters (postgres, sheets, memory)
  lib/                    pure helpers shared by browser and server: fields, money, format, result, list-params
  config/                 app.ts (name, locale, currency, time zone), modules.ts (navigation)
scripts/                  dev, migrate, seed, sheets tools (run with tsx)
e2e/                      Playwright browser tests
drizzle/                  generated SQL migrations (committed, never edited by hand)
docs/                     the documentation above; docs/plans/ is local scratch (gitignored)
```

## 4. Data rules (the part that must never go wrong)

1. **Every read and write goes through `repo(entity)`** (`src/server/data`). Pages, actions and scripts never import Drizzle tables or call Google directly. This is what lets a module move from Sheets to Postgres with one env var.
2. **One schema per record, in `modules/<name>/schema.ts`.** Types, form validation, server validation, the Postgres row and the Sheets columns all derive from it. Never write the same shape twice.
3. **Build fields with `fields.*`** (`src/lib/fields.ts`), passing limits as options: `fields.number({ int: true, min: 1 })`, not `fields.number().int()` (chaining loses the field kind the Sheets adapter needs).
4. **Money is integer cents** everywhere (`fields.money()`, `integer` column, `MoneyInput` in forms, `formatMoney` to show). Never a float, never a string. Totals are computed from cents and rounded once.
5. **Dates of business events are `YYYY-MM-DD` strings** (`fields.date()`, `date({ mode: "string" })`), formatted with `formatDate`. "Today" is `todayIso()`, in the business time zone from `config/app.ts`, never `new Date()` on the server (the server runs in UTC).
6. **The server validates everything again.** A server action parses its input with the module's schema even though the form already did. Prices, totals and permissions are computed on the server, never trusted from the browser.
7. **Every server action:** `requireActionUser()` (with `"admin"` for destructive actions) → parse → repository → `revalidatePath` → return an `ActionResult` via `runAction`. Actions never throw to the browser (production hides the message). Messages users may see are `UserError`s.
8. **Every page under `(app)` calls the session** (the layout does `requireUser()`); the proxy only checks a cookie exists. Never rely on hiding a button for security.
9. **Schema changes:** edit `table.ts` → `pnpm db:generate` → commit the generated SQL. Migrations only add or widen (new table, new nullable column, new index). Renames and drops go in two releases: add the new thing, move the data, remove the old one later. Never edit a migration that has been applied anywhere.
10. **Scripts that write data dry-run by default** (`--apply` to do it), print what they will change, and refuse to write to Google Sheets unless told (`--force`).
11. **List pages keep their state in the URL** (`?q=&sort=field.dir&page=`), parsed with `parseListParams`, so a view can be bookmarked and shared. Sorting and paging happen on the server.

## 5. Code rules

- TypeScript strict with `noUncheckedIndexedAccess`. No `any` (Biome errors on it). No `as unknown as`. A cast is allowed only where the value was just checked at runtime, with a comment saying so (see `parseRecord`). Use `unknown` and narrow; `catch (e: unknown)`.
- Server Components by default; `"use client"` only for interaction (forms, tables, charts, menus). Data loads in the server component and is passed down as props.
- `import "server-only"` at the top of modules that must never reach the browser (queries, session).
- Read env only through `env` / `dataSourceFor()` from `src/server/env.ts`. A new variable: add it there, to `.env.example` and to `docs/ENVIRONMENT.md` in the same change.
- Small files with one job. Pure logic (calculations, mapping, rules) lives in its own file with a unit test. A component over ~200 lines is a sign to split it.
- Comments say **why**, not what. Every exported function has a one-line doc comment saying what it is for.
- Format money, numbers and dates only with the helpers in `lib/money.ts` and `lib/format.ts` (they use `Intl` and the app's locale).
- Developer-facing text (code, comments, commits, PRs, docs) is English. Text users read is in the business's language (set in `config/app.ts`); keep it in components for now, and move it into message files when a second language is needed (see docs/DECISIONS.md).

## 6. UI rules (full guide: docs/DESIGN-SYSTEM.md)

- Build from `src/components/ui` (shadcn) and `src/components/app`. Missing a primitive? `pnpm dlx shadcn@4.23.0 add <name>`, never a hand-made look-alike.
- Colours only through tokens (`bg-background`, `text-muted-foreground`, `bg-success text-success-foreground`, `var(--chart-1)`). No hex values, no `bg-green-500`. Statuses always through `StatusBadge` with a tone map per module (`components/status.ts`).
- Every page: `PageHeader` (title, one line on what the page is for, main action) → content. Every list: `DataTable`. Every create/edit: a dialog form built like `sale-form-dialog.tsx`. Every destructive action: an `AlertDialog` that says what will be lost.
- Every number someone might misread gets a hint (`KpiCard`'s ⓘ, or a `Tooltip`). Icon-only buttons have an `aria-label`.
- Empty, loading and error states are designed, not left blank: `Empty` for empty lists, `loading.tsx` skeletons per route, `error.tsx` with a retry.
- Phones first: every screen must work at 360 px wide (hide secondary table columns with `meta.hideBelow`, stack form fields). Check light and dark.
- Never ship an unrequested restyle. If a change alters how existing screens look, show before/after screenshots first.

## 7. Testing rules (full guide: docs/TESTING.md)

- Pure logic gets a unit test next to it (`__tests__/*.test.ts`). Every bug fixed gets a test that would have caught it.
- A new data adapter passes `src/server/data/__tests__/repository-contract.test.ts`.
- Every user-facing feature gets a Playwright test in `e2e/` that does what a person does (click, type, read the screen), and runs on the desktop and phone projects.
- After a UI change, look at it in the browser (`/verify-ui`): phone and desktop, light and dark, empty and full, with a long value. Tests passing is not the same as the screen being right.
- `pnpm check` before every commit (the git hooks format on commit and run typecheck + tests on push), `pnpm build` and `pnpm test:e2e` before every PR.

## 8. Git, pull requests and releases (full guide: docs/GIT-WORKFLOW.md)

- `main` is production. Work happens on a branch (`feat/invoices`, `fix/sales-total`), merged by pull request after its checks pass. Never push to `main` directly.
- Commits follow Conventional Commits: `type(scope): what changed` (`feat(sales): add export`, `fix(sheets): read dates in dd/mm/yyyy`), English, a lowercase command, ≤ 72 characters, no full stop; a body only for the why; `!` / `BREAKING CHANGE:` for breaking changes. One logical change per commit. The `commit-msg` hook and the PR-title check enforce it (`scripts/lib/commit-message.ts`); never `--no-verify`. The type decides the version bump. Full rules and examples: docs/GIT-WORKFLOW.md#commits.
- Open PRs with `/ship` (checks, self-review, fixes, summary). Releases with `/release` (changelog, version tag). Before pushing more commits to a PR, check it is still open (`gh pr view --json state`).
- Never commit `.env*` files, secrets, customer data, or `docs/plans/`.

## 9. Security

- Secrets live in `.env.local` (local) and the host's env settings (Vercel), never in the repo, docs or chat. `.env.example` holds names only.
- `NEXT_PUBLIC_*` variables are visible to anyone and fixed at build time: never put a secret in one.
- The app is private: `robots: noindex` and security headers are set (next.config.ts); keep them.
- Roles are checked on the server (`requireActionUser("admin")`). New roles go in `src/server/auth.ts`.

## 10. Definition of done

A change is done when all of these hold:

- `pnpm check` and `pnpm build` pass; `pnpm test:e2e` passes for UI changes.
- New logic has unit tests; new features have an e2e test; fixed bugs have a regression test.
- The screen was looked at on a phone and a desktop, in light and dark (`/verify-ui`).
- Docs that the change makes wrong are updated (this file, `docs/`, `.env.example`), with the date for decisions.
- The PR says what changed, why, how it was tested, and what is left.

## 11. Where decisions live

Decisions that shape the code are written **here** (or in `docs/DECISIONS.md` for the reasoning),
in the section they govern, with the date. A plan in `docs/plans/` (gitignored, local) is a to-do
list: it may propose, but nothing is decided until it is written here. Work handed to another
session or person is specified in `docs/specs/<name>.md` (committed) and that spec is deleted by
the PR that implements it.
