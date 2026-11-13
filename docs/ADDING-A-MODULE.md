# Adding a module (customers, products, invoices…)

Copy the Sales module's shape. The `/new-module` skill does these steps; this is what it does.

1. **Schema** — `src/modules/<name>/schema.ts`: the record with `fields.*` (id first), the input schema (`omit({ id: true })`), the types, the list of sortable fields, any status enum.
2. **Table** — `src/modules/<name>/table.ts`: a Drizzle table with one column per field (same names, money as `integer`, dates as `date({ mode: "string" })`, text `notNull().default("")`), `createdAt`/`updatedAt`, indexes on what lists filter or sort by. Re-export it from `src/server/db/schema/index.ts`.
3. **Migration** — `pnpm db:generate --name add_<name>`, read the SQL, commit it. (`pnpm dev` applies it.)
4. **Entity** — `src/modules/<name>/entity.ts` with `defineEntity` (key, label, schema, input, searchable, defaultSort, sheet tab, table). Add it to `scripts/registry.ts`.
5. **Logic** — pure functions (totals, stats, rules) in their own file, with unit tests in `__tests__/`.
6. **Reads and writes** — `queries.ts` (`import "server-only"`, uses `repo()` and `parseListParams`) and `actions.ts` (`"use server"`, `runAction`, `requireActionUser`, schema parse, `revalidatePath`).
7. **UI** — `components/`: status labels and tones, table columns (`DataTable`, row keyed by id), a form dialog (react-hook-form + the input schema, `MoneyInput` for money), a delete confirmation, charts if it has numbers worth seeing.
8. **Pages** — `src/app/(app)/<name>/page.tsx` (+ `loading.tsx`), and `[id]/page.tsx` if records need a detail view.
9. **Navigation** — add it to `src/config/modules.ts` (label, href, icon, description).
10. **Tests** — unit tests for the logic, an e2e test in `e2e/<name>.spec.ts` doing the main flow on desktop and phone.
11. **Check** — `pnpm check`, `pnpm build`, `pnpm test:e2e`, then look at it (`/verify-ui`).

Rules that matter most: money in cents, dates as `YYYY-MM-DD`, everything through `repo()`, the
server re-validates, rows keyed by id, every page has a header, an empty state and a loading state.
