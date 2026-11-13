# Architecture

## How a request flows

```
Browser
  │  page request                         form submit / button
  ▼                                       ▼
src/proxy.ts  (no session cookie → /sign-in)
  │
  ▼
app/(app)/layout.tsx  requireUser()  ← src/server/session.ts (Better Auth, cached per request)
  │
  ├─ page.tsx (Server Component)  ──►  modules/<m>/queries.ts  ──┐
  │                                                              │
  └─ client component (form) ──► modules/<m>/actions.ts ─────────┤  ("use server": check user,
                                                                 │   validate with schema,
                                                                 ▼   revalidatePath)
                                               src/server/data  repo(entity)
                                                    │  picks the source per module
                       ┌────────────────────────────┼─────────────────────────┐
                       ▼                            ▼                         ▼
              adapters/postgres.ts         adapters/sheets.ts         adapters/memory.ts
              Drizzle → Postgres           Sheets REST API            (tests, demos)
              (prod: DATABASE_URL,         (service account,
               dev: embedded Postgres)      one tab per module)
```

## Layers and what each may import

| Layer  | Folder                                    | May import                                       | Never                     |
| ------ | ----------------------------------------- | ------------------------------------------------ | ------------------------- |
| Routes | `src/app`                                 | modules (queries, components), components, lib   | Drizzle, Google, adapters |
| Module | `src/modules/<m>`                         | `server/data`, `server/session`, lib, components | other modules' tables     |
| Data   | `src/server/data`                         | db client, env, lib                              | React, Next               |
| Shared | `src/lib`                                 | nothing server-side (browser-safe)               | `server/*`                |
| UI kit | `src/components/ui`, `src/components/app` | lib                                              | modules, server           |

A module that needs another module's data calls that module's queries, never its table.

## Entities

An entity (`modules/<m>/entity.ts`) ties together:

- `schema` — the Zod record (with `id`), the source of truth for types and validation;
- `input` — what create/update accept (usually `schema.omit({ id: true })`);
- `table` — the Drizzle table (same field names);
- `sheet.tab` — the Google Sheets tab (row 1 = field names);
- `searchable`, `defaultSort` — list behaviour, the same in every adapter.

## Pages and caching

All signed-in pages are dynamic (`force-dynamic` in `(app)/layout.tsx`): data is per user and
live. After a write, actions call `revalidatePath` for the pages that show the data. Nothing is
cached across users.

## Errors

- Server actions return `ActionResult` (`lib/result.ts`): `ok`, or `error` + `fieldErrors`.
- `UserError` messages are shown as written; any other error is logged and shown generically.
- A page that throws renders `(app)/error.tsx` with a retry.
- `/api/health` reports database reachability and each module's data source (no secrets).
