# start-loop

A starter for building your company's own business app (an ERP) with Claude Code. It begins as
a dashboard and a **Sales** module, and grows one module at a time: customers, products, stock,
invoices, whatever the business runs on today in spreadsheets.

- **Works with your Google Sheets from day one**, and moves to a real database module by module when you are ready. Each module can live in Postgres, Google Sheets, or both side by side.
- **Built like a professional app:** sign-in with roles, validation on screen and on the server, money handled in cents, tests that click through the app on a phone and a desktop, light and dark themes.
- **Made to be extended with Claude Code:** the rules, patterns and lessons from three production projects are written in `AGENTS.md` and `docs/`, and Claude has ready-made skills for the common jobs.

Stack: Next.js 16 · React 19 · TypeScript · Tailwind CSS 4 · shadcn/ui · Drizzle + Postgres ·
Google Sheets API · Better Auth · Vitest · Playwright. Why each: `docs/DECISIONS.md`.

## Start (about 5 minutes)

You need a Mac, Linux or Windows machine with **Node 22** (`nvm install 22`) and **pnpm** (`corepack enable`).

```bash
nvm use
pnpm install
cp .env.example .env.local
```

Open `.env.local` and set `BETTER_AUTH_SECRET` to a random value (`openssl rand -base64 32` prints one). Then:

```bash
pnpm dev
```

The first start downloads and sets up a local Postgres (once, about a minute). Open
http://localhost:3000, create your account (the first one becomes the admin), and in a second
terminal add demo data so the dashboard has something to show:

```bash
pnpm db:seed
```

## Build it with Claude Code

Open the folder in Claude Code and ask in plain words. Good first requests:

- "Connect the Sales module to my Google Sheet" → runs `/connect-sheet`
- "Add a Customers module with name, email, phone, city and a VIP checkbox" → runs `/new-module`
- "Show the top 5 customers by revenue on the dashboard"
- "Move Sales from the sheet into the database" → runs `/move-to-postgres`
- "Check the new page on a phone" → runs `/verify-ui`
- "Ship it" → runs `/ship` (pull request with all checks)

Claude follows `AGENTS.md`. You don't need to know the rules, but skim `docs/LESSONS.md` once: it is
the list of mistakes this setup exists to prevent.

## Everyday commands

| Command                          | What it does                                                            |
| -------------------------------- | ----------------------------------------------------------------------- |
| `pnpm dev`                       | runs the app and its local database                                     |
| `pnpm check`                     | types, lint and tests (run before committing; the git hook runs it too) |
| `pnpm test:e2e`                  | clicks through the app in a real browser, on desktop and phone          |
| `pnpm build`                     | the production build                                                    |
| `pnpm db:generate`               | after changing a table: creates the database migration                  |
| `pnpm sheets:check sales`        | checks a Google Sheets tab before connecting it                         |
| `pnpm sheets:copy sales --apply` | copies a module from Sheets into the database                           |

## Where to read more

|                           |                                                       |
| ------------------------- | ----------------------------------------------------- |
| `AGENTS.md`               | the rulebook (for Claude and for you)                 |
| `docs/DATA-SOURCES.md`    | Google Sheets setup, hybrid mode, moving to Postgres  |
| `docs/ADDING-A-MODULE.md` | how a module is built                                 |
| `docs/DESIGN-SYSTEM.md`   | colours, components, screen patterns                  |
| `docs/TESTING.md`         | what is tested and how                                |
| `docs/GIT-WORKFLOW.md`    | branches, pull requests, versions                     |
| `docs/DEPLOYMENT.md`      | putting it online (Vercel + Postgres)                 |
| `docs/LESSONS.md`         | 60 mistakes from real projects, and the rule for each |
