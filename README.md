<h1 align="center">start-loop</h1>

<p align="center"><strong>An open, agentic-first starter: build your own business app from scratch by talking to Claude Code.</strong><br>
No coding needed to start. Describe what you need in plain words; Claude builds it, tests it and keeps to the rules in this repo.</p>

<p align="center">
<img alt="agentic first" src="https://img.shields.io/badge/agentic-first-D97757?logo=claude&logoColor=white">
<img alt="Claude Code ready" src="https://img.shields.io/badge/Claude_Code-ready-D97757?logo=claude&logoColor=white">
<img alt="AGENTS.md rulebook" src="https://img.shields.io/badge/AGENTS.md-rulebook-555555">
<img alt="skills 7" src="https://img.shields.io/badge/skills-7-555555">
<img alt="lessons 60" src="https://img.shields.io/badge/lessons-60-555555">
<img alt="reflect-mod learns from you" src="https://img.shields.io/badge/reflect--mod-learns_from_you-555555">
</p>

<p align="center">
<img alt="Next.js 16.4.6" src="https://img.shields.io/badge/Next.js-16.4.6-000000?logo=nextdotjs&logoColor=white">
<img alt="React 19.3.1" src="https://img.shields.io/badge/React-19.3.1-149ECA?logo=react&logoColor=white">
<img alt="TypeScript 5.9.3" src="https://img.shields.io/badge/TypeScript-5.9.3-3178C6?logo=typescript&logoColor=white">
<img alt="Tailwind CSS 4.3.5" src="https://img.shields.io/badge/Tailwind_CSS-4.3.5-06B6D4?logo=tailwindcss&logoColor=white">
<img alt="shadcn/ui 4.23.0" src="https://img.shields.io/badge/shadcn%2Fui-4.23.0-000000?logo=shadcnui&logoColor=white">
<img alt="Drizzle ORM 0.45.4" src="https://img.shields.io/badge/Drizzle_ORM-0.45.4-C5F74F?logo=drizzle&logoColor=black">
<img alt="PostgreSQL any" src="https://img.shields.io/badge/PostgreSQL-any-4169E1?logo=postgresql&logoColor=white">
<img alt="Google Sheets API v4" src="https://img.shields.io/badge/Google_Sheets-API_v4-34A853?logo=googlesheets&logoColor=white">
<img alt="Better Auth 1.7.23" src="https://img.shields.io/badge/Better_Auth-1.7.23-000000">
<img alt="Zod 4.6.7" src="https://img.shields.io/badge/Zod-4.6.7-3E67B1?logo=zod&logoColor=white">
</p>

<p align="center">
<img alt="Node.js 22.12 or newer" src="https://img.shields.io/badge/Node.js-%3E%3D22.12-5FA04E?logo=nodedotjs&logoColor=white">
<img alt="pnpm 10.33.4" src="https://img.shields.io/badge/pnpm-10.33.4-F69220?logo=pnpm&logoColor=white">
<img alt="Vitest 5.1.0" src="https://img.shields.io/badge/Vitest-5.1.0-6E9F18?logo=vitest&logoColor=white">
<img alt="Playwright 1.65.0" src="https://img.shields.io/badge/Playwright-1.65.0-2EAD33">
<img alt="Biome 2.6.7" src="https://img.shields.io/badge/Biome-2.6.7-60A5FA?logo=biome&logoColor=white">
<img alt="Conventional Commits 1.0.0" src="https://img.shields.io/badge/Conventional_Commits-1.0.0-FE5196?logo=conventionalcommits&logoColor=white">
<img alt="version" src="https://img.shields.io/badge/version-0.1.0-blue">
<img alt="license MIT" src="https://img.shields.io/badge/license-MIT-green">
</p>

**Free and public.** Anyone can start a project from it: press **Use this template** on GitHub
(or clone it), open it in Claude Code, and say what you want. You need no programming background and
no complex setup. The engineering decisions (stack, structure, security, tests, git) are already
made and written down for Claude, so you only decide _what_ the app should do.

It is made for apps that run a business: lists, forms, sign-in with roles, dashboards and reports.
An internal ERP, a booking system, a stock tracker, a CRM, an order desk, a tool that replaces a
spreadsheet. It starts with a dashboard and an example **Sales** module that shows every pattern;
keep it, change it, or ask Claude to remove it and build your first module instead.

- **Agentic-first:** the repo is set up for an AI agent to do the building. The rules, patterns and lessons from three production projects are written for it (`AGENTS.md`, `docs/`), it has ready-made skills for the common jobs, and every change it makes is checked by types, tests and a real browser before it reaches you.
- **Works with your Google Sheets from day one**, and moves to a real database module by module when you are ready. Each module can live in Postgres, Google Sheets, or both side by side.
- **Built like a professional app:** sign-in with roles, validation on screen and on the server, money handled in cents, tests that click through the app on a phone and a desktop, light and dark themes.

![The dashboard with demo data](docs/screenshot-dashboard.png)

## The loop

The name is the idea: every change goes round the same loop, and the loop gets better each time.

```
  you ask ──▶ Claude reads the rules ──▶ builds with the patterns ──▶ checks prove it works
  ("add a      (AGENTS.md, LESSONS.md,    (entity, repository,         (types, lint, unit tests,
  Customers     the matching skill)        server actions, UI kit)      browser tests on phone
  module")                                                              and desktop, /verify-ui)
     ▲                                                                          │
     │                                                                          ▼
  next loop starts smarter ◀── reflect-mod saves your corrections ◀── /ship opens a reviewed PR
                               as rules in CLAUDE.md                   /release writes the changelog
```

| Layer              | What it gives the agent                                                                                              | Where                               |
| ------------------ | -------------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| Rulebook           | how this app is built: structure, data, money, dates, security, UI, tests, git                                       | `AGENTS.md`, `CLAUDE.md`            |
| Memory of mistakes | 60 real bugs from three production apps, each with the rule that prevents it                                         | `docs/LESSONS.md`                   |
| Decisions          | why each tool was chosen, so it is not swapped on a whim                                                             | `docs/DECISIONS.md`                 |
| Skills             | step-by-step jobs: `/setup`, `/new-module`, `/connect-sheet`, `/move-to-postgres`, `/verify-ui`, `/ship`, `/release` | `.claude/skills/`                   |
| Guardrails         | allowed and forbidden commands (no force-push, no reading secrets)                                                   | `.claude/settings.json`             |
| Feedback           | git hooks, commitlint, unit, contract and browser tests, CI                                                          | `lefthook.yml`, `e2e/`, `.github/`  |
| Learning           | your corrections become rules                                                                                        | reflect-mod (offered on first open) |

Why each piece of the stack: `docs/DECISIONS.md`.

## Start

### With Claude Code only (no terminal knowledge needed)

1. Install **[Claude Code](https://claude.com/claude-code)** (the desktop app is easiest) and sign in.
2. On this page press **Use this template → Create a new repository** (or download the code).
3. Open the project in Claude Code and type: **set it up**.

Claude runs `/setup`: it installs what is missing (it asks before installing anything on your
computer), creates your settings with a fresh secret, prepares a local database, runs every check,
and starts the app at http://localhost:3000. Create your account there (the first one becomes the
admin), then ask Claude: **add demo data**.

From then on, just say what you want ("add a Customers page with name, email and a VIP checkbox").

### In a terminal (about 5 minutes)

You need **git** and **nvm** ([install](https://github.com/nvm-sh/nvm)). In the project folder:

```bash
./setup.sh
```

It installs everything and skips what is already done, so it is safe to run again: Node 22, pnpm,
the packages and git hooks, `.env.local` with a fresh secret, the browser for the UI tests, a local
Postgres with its tables, and a final check. Then:

```bash
pnpm dev
```

Open http://localhost:3000, create your account (the first one becomes the admin), and in a second
terminal add demo data:

```bash
pnpm db:seed
```

### Claude Code mod: reflect

When you open the folder in Claude Code and trust it, Claude Code offers to install **reflect-mod**
(listed in `.claude/settings.json`): when you correct Claude ("no, use cents"), it shows the rule it
found above the prompt, and one click saves it to `CLAUDE.md`, so the next session already knows.
Accept it. If you missed the offer:

```bash
claude plugin marketplace add bayramannakov/claude-reflect
claude plugin install reflect-mod@claude-reflect-marketplace
```

It needs a recent Claude Code (`claude update`); restart Claude Code after installing. Use it
instead of the older `claude-reflect` plugin, not both.

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

| Command                          | What it does                                                              |
| -------------------------------- | ------------------------------------------------------------------------- |
| `pnpm dev`                       | runs the app and its local database                                       |
| `pnpm check`                     | types, lint and tests (run before committing; the git hooks run them too) |
| `pnpm test:e2e`                  | clicks through the app in a real browser, on desktop and phone            |
| `pnpm build`                     | the production build                                                      |
| `pnpm db:generate`               | after changing a table: creates the database migration                    |
| `pnpm sheets:check sales`        | checks a Google Sheets tab before connecting it                           |
| `pnpm sheets:copy sales --apply` | copies a module from Sheets into the database                             |

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

## License and contributing

[MIT](LICENSE): use it for anything, commercial included. Improvements to the template itself
(a better rule, a lesson learned, a new skill) are welcome as pull requests; see
[CONTRIBUTING.md](CONTRIBUTING.md).
