# Lessons: mistakes that already happened, and the rule that prevents each

Collected from three production projects (an e-commerce shop, a scooter retailer's ERP-like admin,
an ATS/CRM) and from building this template. Every item cost real time or money once. Read this
file fully before your first feature; agents check changes against it.

Format: **what went wrong** → the rule.

## Found while building this template (November 2026)

1. **Editing a sale overwrote a different sale.** The table keyed rows by position, so after a search the first row's edit dialog still held the old first row's values, and saving wrote them onto another record. → Table rows are keyed by record id (`getRowId`), and a form dialog resets to the record every time it opens. Any list with per-row state must key by id.
2. **The page reloaded endlessly in development.** The local database kept its files inside the project folder; every request wrote to it, the dev server saw a file change and reloaded the page, which wrote again. → Nothing that writes at runtime (databases, logs, test traces) lives inside the project folder. Local data is in `~/.start-loop/<app>/`.
3. **An in-process database cannot serve Next.js.** Next's dev server runs several processes; an embedded database opened in one of them is invisible (or corrupt) to the others, and PGlite's socket server mixed up overlapping queries (Postgres error 08P01). → Development uses a real Postgres server process (`embedded-postgres`); in-memory PGlite is for unit tests only.
4. **Two dev servers on one `.next` folder reloaded each other.** → The e2e server uses its own build folder (`NEXT_DIST_DIR=.next-e2e`), database and port.
5. **`next build` failed because a module connected to the database when it loaded** (the auth library was created at import time). → Nothing connects at import time: create clients lazily on first use (`db()`, `auth()`).
6. **A page was pre-rendered at build time** because its data query ran before the code that marks it per-user. → Every signed-in page is `force-dynamic` (set once in `(app)/layout.tsx`).
7. **The stock shadcn grey text failed contrast** (4.3:1 on muted backgrounds). → The theme has a contrast test (`theme-contrast.test.ts`); run `pnpm test` after any colour change.

## Data and money

8. **A cast hid the wrong type: refunds were sent as `NaN` for three months** (€1,251 never refunded). → Never cast to make the compiler quiet. Validate with Zod; assert numbers are finite; check the provider's answer, not just "no error".
9. **Money written on one side only:** a payment was recorded but the order ledger was not, so staff charged twice. → One function performs each money change and writes every side of it; guard against impossible states (paid ≥ total).
10. **Stock went negative** (661 negative levels) through `stock - qty` with no check. → Enforce invariants where data is written: checks in code and `CHECK` constraints in the database.
11. **Two code paths counted the same thing differently** (live totals vs. "recalculate"), so numbers changed after a recalculation. → One shared function per business rule; both paths call it.
12. **Daily goals counted by order date instead of the day the sale was booked, in the wrong time zone.** → Store the business date explicitly; compute day boundaries in the business time zone; write down which date each report uses.
13. **Relations stored in free-form JSON** with three different key spellings; a refactor stopped writing one. → Real foreign keys and link tables, one place that writes them.
14. **A create endpoint inserted half a record, then failed.** → Multi-step writes go in a transaction (`db().transaction`) or are idempotent and repairable.
15. **Client-sent prices were trusted.** → Compute prices, totals and discounts on the server from the server's data.
16. **Placeholder data ("temp@temp.com") written into live records** created fake customers. → Never write placeholders into real rows; use a separate draft or estimate path.
17. **A near-zero total fell under the payment provider's minimum** and caused hundreds of errors. → Validate amounts against provider limits; give €0 its own path.
18. **Gap-free document numbers (invoices)** must survive failures. → Take the number and write the document in one transaction (`INSERT … ON CONFLICT DO UPDATE` on a counter); issued documents are never edited, corrections are credit notes.
19. **Import or sync jobs ran twice and duplicated rows.** → Every import is idempotent: upsert by a stable key (the `id` column for Sheets), dry-run by default, report counts.

## Database and migrations

20. **The deploy said "success" but the migration never ran;** the new column was missing. → After a deploy, confirm the change exists (`/api/health`, a query). Migrations run as a deliberate step, not hidden in a build.
21. **Two migrations had the same name; one was silently skipped.** → Let `drizzle-kit generate` name them; never hand-write or rename migration files.
22. **Two backfills ran at once and collided.** A full backfill from a laptop took 40 minutes; scoped and run near the database, 69 seconds. → Scope data fixes by query, never run two at once, run them close to the database, and keep one copy of each rule (don't re-implement it in SQL).
23. **A data-repair script would have emailed customers months late.** → Repair scripts take explicit ids, dry-run first, and switch off side effects (emails, webhooks).
24. **"No output" was read as success** (logs were filtered). → Verify a script by querying the result, not by reading its log.
25. **Previews and production shared one database**, so a preview's migration changed production. → Each environment has its own database (Neon branches make this free). Never migrate production from a preview build.
26. **Seeds created duplicates when run twice.** → Seeds and setup scripts are idempotent or refuse to run on non-empty data.

## Next.js, React and performance

27. **A slow server action blocked every other action on the page** (Next runs a page's actions one at a time). → Actions are for quick writes. Slow work (AI, exports, big imports) goes to a route handler or a background job.
28. **An error thrown in a server action never reached the user** (production hides it). → Actions return `{ ok, error, fieldErrors }` (`runAction`) and the form shows it.
29. **React empties a form after its action runs**; a refused submit lost what the person typed. → Forms keep their own state (react-hook-form) and only close on success.
30. **The session was fetched twice per page** (layout and page each asked). → `currentUser()` is wrapped in React `cache`: once per request.
31. **Clicks felt dead for a second** with no loading feedback. → Every route segment has a `loading.tsx` skeleton; slow sections stream behind `<Suspense>`; independent queries run with `Promise.all`.
32. **A framework upgrade silently changed caching defaults** (58 fetches lost their cache). → Read the upgrade notes' caching section; set caching explicitly; re-measure after upgrades.
33. **A list fetched 500 rows to show 16; the server ran out of memory under load.** → Page at the source (SQL `limit/offset`), select only needed columns, never load big JSON columns in lists.
34. **A query silently stopped returning rows past ~1,000.** → Batch large reads, and compare result counts with what you expect.
35. **A dashboard polled every 20 s with a cache that lived 20 s:** every poll missed. → Cache lifetime longer than the poll interval; polled endpoints must be cheap.
36. **A type-valid change failed the production build** (routing, config, server code). → `pnpm build` locally before every PR.
37. **Route folders named `test`/`coverage` were dropped from the production build** (404 only in production). → Don't name route folders after tooling folders.
38. **Radix `Select` showed an empty, jumping trigger until JavaScript loaded.** → Pass the selected label as the `SelectValue` child (as in the sale form). Dropdowns use `position="popper"`.

## UI and usability

39. **Four button styles, three table styles and z-index 10000 appeared** when screens were built one by one with AI. → One component library, tokens only, the patterns in DESIGN-SYSTEM.md. Review new screens against existing ones.
40. **An unrequested restyle was shipped and rejected.** → Don't change how existing screens look unless asked; show before/after screenshots for any visual change.
41. **iOS zoomed into small inputs.** → Inputs are 16 px on touch screens (in `globals.css`); never disable zoom.
42. **The page was wider than the phone screen** because of one long value. → `min-width: 0` on grid/flex children (global rule), `truncate` long cells, test with a long value.
43. **A toast covered the "Pay" button** and swallowed the retry. → Toasts never cover primary actions (top-right here).
44. **"Tests passed" but the screen was wrong** (a display bug checked only through code). → Verify UI in a real browser as a person: phone and desktop, light and dark, empty and full (`/verify-ui`).
45. **Unclear numbers led to wrong decisions.** → Every KPI says exactly what it counts (ⓘ hint), and every status has one colour meaning across the app.

## Environment variables, secrets, deploys

46. **A public key pasted truncated stopped all payments for two days**, and it looked like "customers aren't buying". → Validate every env var at start (`src/server/env.ts`); after changing a key, verify it with a real call.
47. **`NEXT_PUBLIC_*` values are frozen at build time**: a preview's URL reached production through a shared build cache. → Never put environment-specific or secret values in `NEXT_PUBLIC_*`; rebuild after changing them.
48. **A token was rotated in one place and alerts failed for two days; a password was copied into 20 places.** → One source of truth per secret; reference it, don't copy it.
49. **A cleanup job deleted the template it was meant to protect** (matched by prefix). → Destructive automation uses explicit allowlists and a dry run.
50. **A preview environment created a real shipping label; a local `.env` pointed at the production bucket.** → Non-production environments use test/sandbox keys for every outside service. Treat "send", "charge", "ship" as real actions in tests.
51. **`vercel env pull` returns sensitive variables as empty strings**, which looked like "unset". → Check a variable's presence in the dashboard or with a health check, not from a pulled file.

## Working with Claude Code (or any AI agent)

52. **An analysis ran on a copy 384 commits behind,** producing a confident report about deleted code. → Before analysing, `git fetch` and check how far behind you are; grep before proposing something that may exist; reproduce before reporting.
53. **Five commits were pushed to a branch whose PR was already merged,** so they never shipped. → Check `gh pr view --json state` before pushing follow-ups.
54. **A review "fixed" files the PR didn't touch** (they only showed up because the base was merged in). → Review and fix only the PR's own changes.
55. **Commits and comments came out in Spanish** because nearby text was Spanish. → Developer text is English, always; only user-facing copy follows the product's language.
56. **Decisions written only in a local plan were lost** and later contradicted. → Decisions go in AGENTS.md / docs/DECISIONS.md, committed, dated.
57. **Docs promised checks that were switched off** (e2e "required" but disabled in CI). → What the docs promise, CI runs. If you disable a check, say so in AGENTS.md.
58. **A 900-line component nobody could change safely.** → Small files, one job each, pure logic separated and tested.
59. **The first root-cause analysis blamed the wrong change** and had to be retracted. → Separate "known" from "suspected" in every report; never invent a number.
60. **Paid APIs were bulk-run "to fill the page".** → Anything that costs money per call gets a confirmation with the price and a daily cap.
