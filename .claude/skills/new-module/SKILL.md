---

name: new-module
description: Add an ERP module (e.g. customers, products, invoices) following the Sales module's pattern - schema, table, migration, entity, logic, queries, actions, UI, page, navigation, tests
---

# /new-module <name>

Builds a complete module the same way Sales is built. Read `docs/ADDING-A-MODULE.md` and the files
of `src/modules/sales/` first; copy their structure, not just their look.

## 0. Agree on the fields first

Ask the owner (one message) for: the module's name, its fields (name, kind: text / number / money /
date / yes-no / choice from a list, required or not), what the list should search and sort by, its
statuses if any, and whether the data comes from an existing Google Sheet (ask for a screenshot of
the header row). Propose a schema in plain words and wait for an OK before writing code.

## 1. Build (one commit per step is fine)

1. `src/modules/<name>/schema.ts` — `fields.*` with options (never chained), `id` first, input schema, types, sortable list, status enum.
2. `src/modules/<name>/table.ts` — matching Drizzle table (money `integer`, dates `date({ mode: "string" })`, text `notNull().default("")`, `createdAt`/`updatedAt`, indexes); re-export from `src/server/db/schema/index.ts`.
3. `pnpm db:generate --name add_<name>`; read the SQL; it must only create/add.
4. `entity.ts` with `defineEntity`; add the entity to `scripts/registry.ts`.
5. Pure logic files + unit tests in `__tests__/`.
6. `queries.ts` (`import "server-only"`, `repo()`, `parseListParams`), `actions.ts` (`"use server"`, `runAction`, `requireActionUser`, schema parse, `revalidatePath`; deleting needs `"admin"`).
7. `components/`: `status.ts` (labels + tones), table (`DataTable`, columns with `meta`), form dialog (copy `sale-form-dialog.tsx`: reset on open, `MoneyInput`, `Controller` for selects with `position="popper"`), delete button.
8. `src/app/(app)/<name>/page.tsx` + `loading.tsx`.
9. Add it to `src/config/modules.ts`.
10. `e2e/<name>.spec.ts`: add, find, edit, delete like a person; plus the empty-form errors.

## 2. Check

`pnpm check`, `pnpm build`, `pnpm test:e2e`, then `/verify-ui` on the new pages.

## 3. Report

Plain words: what the module does, which fields, where its data lives, how it was tested, and
what to try ("open Customers, add one, search for it").
