# Data sources: Postgres, Google Sheets, or both

Each module reads and writes through one interface, and each module chooses where its data lives:

| Setting (in `.env.local` or Vercel) | Meaning                                                                                  |
| ----------------------------------- | ---------------------------------------------------------------------------------------- |
| `DATA_SOURCE=postgres`              | Default for every module: Postgres (local in development, `DATABASE_URL` in production). |
| `DATA_SOURCE=sheets`                | Default for every module: Google Sheets.                                                 |
| `DATA_SOURCE_SALES=sheets`          | Only the Sales module uses Sheets; the others keep the default (hybrid).                 |
| `DATA_SOURCE=memory`                | Throwaway in-memory data (tests, demos).                                                 |

`/api/health` shows which source each module uses right now.

## The usual path from spreadsheets to a real database

1. **Start on Sheets.** Connect the existing spreadsheet (below), set `DATA_SOURCE_<MODULE>=sheets`. The app shows and edits the real data while the team keeps using the sheet.
2. **Clean the sheet** with `pnpm sheets:check <module>`: it lists missing columns, rows that fail validation (with the reason) and rows without an id (`--fix-ids` adds them).
3. **Copy to Postgres** when the module is stable: `pnpm sheets:copy <module>` (dry run) then `--apply`. Ids are kept, so running it again updates instead of duplicating.
4. **Switch:** set `DATA_SOURCE_<MODULE>=postgres`, restart. From now on edit in the app only; make the sheet read-only (or archive it) so nobody edits the old copy.
5. Repeat per module. Money, stock and anything several people edit at once should move first.

## Connecting a Google Sheet (one time, ~10 minutes)

1. Open https://console.cloud.google.com, create a project (e.g. "ERP").
2. APIs & Services → Library → enable **Google Sheets API**.
3. APIs & Services → Credentials → Create credentials → **Service account** (any name) → Done.
4. Open the service account → Keys → Add key → JSON. A file downloads. Keep it private.
5. In `.env.local`:
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL` = the `client_email` from the file
   - `GOOGLE_PRIVATE_KEY` = the `private_key` from the file, in double quotes, `\n` kept as written
   - `GOOGLE_SHEETS_ID` = the long id in the sheet's URL: `docs.google.com/spreadsheets/d/<THIS>/edit`
6. In Google Sheets, **Share** the spreadsheet with the service account email as **Editor** (Viewer if the app should only read).
7. `pnpm sheets:check sales` should now list the tab.

Never commit the JSON key or paste it in chat. In production put the same three variables in Vercel.

## How a module's tab must look

- One tab per module, named as in the entity (`sheet: { tab: "Sales" }`).
- **Row 1 = field names** from the module's schema (`id`, `date`, `customer`, `amount`…), in any order, case-insensitive. Extra columns are allowed and left untouched.
- An `id` column, unique per row (`pnpm sheets:check <module> --fix-ids` fills empty ones).
- Values are read by field kind:
  - money: `12.50`, `1.234,50 €`, `1,234.50` → stored as cents (1250); written back as 12.5
  - dates: real date cells, `2026-11-13` or `13/11/2026` (day first) → `2026-11-13`
  - numbers: number cells or text with `,`/`.`
  - booleans: checkboxes, `yes`/`no`, `true`/`false`, `x`
- Rows that fail validation are skipped (and logged), never half-read.

## Limits of the Sheets adapter (why modules move to Postgres eventually)

- It reads the whole tab on every list (fine up to a few thousand rows, slower beyond).
- No transactions: two people saving at the same moment can both win.
- Updates and deletes find the row by id each time, but a person inserting or sorting rows by hand at that exact moment can still shift them.
- Google's API quota is about 60 reads per minute per user. A busy app outgrows it.

## Adding another source later

Write `src/server/data/adapters/<name>.ts` implementing `Repository` (list, all, get, create,
update, remove), add it to `repo()` in `src/server/data/index.ts` and to `DATA_SOURCES` in
`src/server/env.ts`, and make it pass `repository-contract.test.ts`. Airtable, Excel on OneDrive
or an existing company database all fit this way.
