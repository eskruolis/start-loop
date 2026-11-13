---

name: move-to-postgres
description: Move one module's data from Google Sheets into Postgres (dry run, copy with ids kept, compare counts and totals, switch the data source, retire the sheet)
---

# /move-to-postgres <module>

1. **Preconditions:** the module reads Sheets today (`/api/health`), `pnpm sheets:check <module>` reports 0 failing rows and 0 rows without ids. If not, fix those first (`/connect-sheet`).
2. **Which database:** local while practising; for production confirm with the owner and use the production `DATABASE_URL` explicitly in the command. Never assume.
3. **Dry run:** `pnpm sheets:copy <module>` — report "N rows: X new, Y existing".
4. **Copy** (owner's OK): `pnpm sheets:copy <module> --apply`.
5. **Compare:** row count and money totals in Postgres vs the sheet (the dashboard with `DATA_SOURCE_<MODULE>=postgres` vs `=sheets`, or a query). They must match exactly; if not, stop and investigate before switching.
6. **Switch:** `DATA_SOURCE_<MODULE>=postgres` (locally in `.env.local`; in production in Vercel → redeploy).
7. **Retire the sheet:** advise making the tab read-only or renaming it "<tab> (archived <date>)", so nobody keeps editing a copy the app no longer reads.
8. Record the switch with its date in `docs/DECISIONS.md` (module, date, row count).
