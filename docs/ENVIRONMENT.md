# Environment variables

Checked at start by `src/server/env.ts` (the app refuses to start with a clear message when one is
wrong). Local values live in `.env.local` (never committed); production values in Vercel.
An empty value (`FOO=`) counts as not set.

| Name                           | Required    | Where | What it is                                                                                    |
| ------------------------------ | ----------- | ----- | --------------------------------------------------------------------------------------------- |
| `BETTER_AUTH_SECRET`           | yes         | all   | Signs sessions. 32+ random characters (`openssl rand -base64 32`). Different per environment. |
| `BETTER_AUTH_URL`              | production  | all   | The app's address (`http://localhost:3000` locally).                                          |
| `DATABASE_URL`                 | production  | all   | Postgres connection string. Empty locally: `pnpm dev` starts its own Postgres.                |
| `DATA_SOURCE`                  | no          | all   | Default store for modules: `postgres` (default), `sheets`, `memory`.                          |
| `DATA_SOURCE_<MODULE>`         | no          | all   | Per-module override, e.g. `DATA_SOURCE_SALES=sheets`.                                         |
| `GOOGLE_SHEETS_ID`             | with sheets | all   | The spreadsheet id from its URL.                                                              |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | with sheets | all   | The service account's `client_email`.                                                         |
| `GOOGLE_PRIVATE_KEY`           | with sheets | all   | The service account's `private_key` (keep `\n` as written, in quotes).                        |
| `LOCAL_DB_PORT`                | no          | local | Port of the local Postgres (default 54329).                                                   |
| `LOCAL_DB_DIR`                 | no          | local | Folder of the local Postgres (default `~/.start-loop/<app>/postgres`).                        |
| `NEXT_DIST_DIR`                | no          | tests | Next's build folder (the e2e server uses `.next-e2e`).                                        |
| `SKIP_ENV_VALIDATION`          | no          | CI    | `1` skips the checks (only for builds that never run the app).                                |

Adding a variable: add it to `src/server/env.ts`, `.env.example` and this table in the same PR.
Never prefix a secret with `NEXT_PUBLIC_` (those are visible in the browser and fixed at build time).
