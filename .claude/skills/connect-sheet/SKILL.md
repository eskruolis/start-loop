---

name: connect-sheet
description: Make a module read and write an existing Google Sheets tab - credentials, sharing, header row, validation report, switching the module's data source to sheets
---

# /connect-sheet <module>

Follow `docs/DATA-SOURCES.md`. Never paste or echo the service account key; the owner puts it in
`.env.local` themselves.

1. **Check credentials:** `/api/health` (with `pnpm dev` running) shows `sheetsConfigured`. If false, walk the owner through "Connecting a Google Sheet" step by step and wait. Remind them to share the sheet with the service account email.
2. **Look at the tab:** `pnpm sheets:check <module>`. Read the report to the owner in plain words: which columns match the module's fields, which are missing, which rows fail and why.
3. **Fix the header row** with the owner: column names must equal the field names (case does not matter). Suggest renaming columns in the sheet, or adjusting the module schema if the sheet is right and the schema is wrong (that is a code change: update schema, table, migration).
4. **Ids:** if rows have no id, explain why they are needed and, with an OK, run `pnpm sheets:check <module> --fix-ids` (it writes into the sheet).
5. **Switch:** set `DATA_SOURCE_<MODULE>=sheets` in `.env.local`, restart `pnpm dev`, open the module's page, confirm the rows appear and the dashboard numbers match the sheet's own totals.
6. **Test a write** only with the owner's OK and on a test row (create, edit, delete it), since this writes to the real sheet.
7. Report what is connected and any rows that were skipped.
