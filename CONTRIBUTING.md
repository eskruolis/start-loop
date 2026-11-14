# Contributing

This repo is a template: people copy it and build their own app. Contributions improve the starting
point for everyone.

**Welcome:** a rule in `AGENTS.md` that prevents a real mistake, a lesson for `docs/LESSONS.md` (what
happened, and the rule), a new or better skill in `.claude/skills/`, a fix, a dependency upgrade with
its checks, clearer docs for people who do not code.

**Not here:** features of your own app. Build those in your copy.

How:

1. Fork, then `./setup.sh` (or open it in Claude Code and say "set it up").
2. One change per pull request, on a branch. Commits and the PR title follow
   [Conventional Commits](https://www.conventionalcommits.org) (`feat(skills): …`, `fix(sheets): …`).
3. `pnpm check`, `pnpm build` and, for UI changes, `pnpm test:e2e` pass. With Claude Code, `/ship` does
   all of this and opens the PR.
4. Say in the PR what it improves for someone starting a new project.

By contributing you agree your work is released under the [MIT License](LICENSE).
