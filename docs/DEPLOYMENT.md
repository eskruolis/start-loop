# Deployment (Vercel + Postgres)

## One-time setup

1. **Database:** create a Postgres database (Neon is the easiest: free tier, and a separate branch per preview). Copy its connection string (`postgres://…?sslmode=require`).
2. **Vercel:** import the GitHub repo (framework: Next.js, root: the repo). Add the environment variables from `docs/ENVIRONMENT.md` for **Production**:
   - `DATABASE_URL` — the production database
   - `BETTER_AUTH_SECRET` — a new random value (`openssl rand -base64 32`), different from your local one
   - `BETTER_AUTH_URL` — the production address, e.g. `https://erp.example.com`
   - `DATA_SOURCE`, any `DATA_SOURCE_<MODULE>`, and the `GOOGLE_*` values if modules read Sheets
3. **First migration:** from your machine, `DATABASE_URL="<production url>" pnpm db:migrate`.
4. Deploy, open the site, create the first account: it becomes the admin.

## Every release

- **Migrations first, then code.** When a release contains a new migration, apply it to production (`DATABASE_URL=… pnpm db:migrate`, or the GitHub Action below) before or as the new code goes live. Migrations only add things, so old code keeps working with the new schema.
- Then check `/api/health` on production: `ok: true` and the expected sources.

Do not run migrations inside `next build`: preview deployments build too, and a preview would
change the production database. If previews need a database, give them their own (Neon branch per
preview, or a separate "preview" database in Vercel's Preview environment).

## Optional: migrate automatically on release

A GitHub Action on `release: published` can run `pnpm db:migrate` with a `DATABASE_URL` secret
stored in GitHub. Add it once releases are routine; until then the manual step keeps you in control.

## Previews

Every PR gets a Vercel preview URL. Give the Preview environment its own `DATABASE_URL` (never the
production one) and leave `BETTER_AUTH_URL` unset there: the app then uses the preview's own
address (`VERCEL_URL`), so sign-in works on every preview.
