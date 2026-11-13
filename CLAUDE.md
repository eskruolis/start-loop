@AGENTS.md

## Notes for Claude Code

- Read `AGENTS.md` (above) before any change; it is the rulebook. `docs/LESSONS.md` lists mistakes that already happened: check a change against it.
- Skills in `.claude/skills/` cover the common jobs. Use them instead of improvising:
  - `/new-module <name>`: add an ERP module (schema → table → pages → tests)
  - `/connect-sheet <module>`: read a module from an existing Google Sheet
  - `/move-to-postgres <module>`: copy a module's sheet into Postgres and switch it over
  - `/verify-ui`: check a change in the browser like a person, on a phone and a desktop, in light and dark
  - `/ship`: open a pull request with every check and a self-review
  - `/release`: cut a version with a changelog
- Preview the app with the `app` entry in `.claude/launch.json` (it runs `pnpm dev`). Never start servers with plain shell commands that outlive the session.
- When you finish a change, say in two or three plain sentences what changed, how you checked it, and anything left open. The owner is not a developer: no jargon without a word on what it means.
- Ask before anything that cannot be undone: deleting data, writing to a Google Sheet that holds real data, running migrations against production, pushing to `main`, changing env vars in Vercel.
