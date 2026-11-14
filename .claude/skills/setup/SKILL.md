---

name: setup
description: Set up a fresh copy of start-loop on this machine - Node, pnpm, packages, git hooks, .env.local with a secret, test browser, local database, checks, and the reflect-mod Claude Code mod. Use when someone opens the repo for the first time, or says "set it up", "install everything", "it doesn't run".
---

# /setup

1. Run `./setup.sh` (add `--no-browsers` only if the person asks to skip the ~150 MB test browser). It is safe to run again; each step skips what is done. Never print `.env.local` or the secret.
2. Assume the person does not code and may never have used a terminal: explain each step in one plain sentence. If a step fails, read its message: it names what is missing (git, nvm, Node 22, corepack). Offer to install it (git: `xcode-select --install` on a Mac; nvm: its official install script from github.com/nvm-sh/nvm), install it only on their yes, then run the script again. Do not work around a missing tool by changing the project (no other Node version, no npm/yarn, no editing `.nvmrc`).
3. **reflect-mod** (turns the person's corrections into `CLAUDE.md` rules, shown in a band above the prompt): this repo's `.claude/settings.json` lists it, so Claude Code offers it when the folder is trusted. If it is not installed, give the person these two commands to run in their terminal (installing a plugin is their decision):

   ```bash
   claude plugin marketplace add bayramannakov/claude-reflect
   claude plugin install reflect-mod@claude-reflect-marketplace
   ```

   It needs a recent Claude Code with mods (update with `claude update`) and replaces the older `claude-reflect` Python plugin: never both. After installing, restart Claude Code.
4. Optional tools the script only checks: GitHub CLI (`brew install gh && gh auth login`) for `/ship` and `/release`.
5. Finish by starting the app (`preview_start` "app" or `pnpm dev`), opening http://localhost:3000, and telling the person: create your account (the first is the admin), then ask "add demo data" (you run `pnpm db:seed`). Then invite them to say what the app should do; if it is not about sales, offer to remove the example Sales module once their first module exists.
