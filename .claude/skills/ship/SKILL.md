---

name: ship
description: Open a pull request for the current branch with every quality check, a self-review of the diff, fixes for critical and warning findings, and a review summary comment
---

# /ship

Run only when the owner asks to ship / open a PR.

1. **Branch check:** never ship from `main`. If on `main`, create a branch named after the change first. If the branch already has a PR, check it is still open: `gh pr view --json state,mergedAt` (merged → new branch and PR).
2. **Sync:** `git fetch origin && git merge origin/main`. Conflicts: stop and show them; resolve only purely additive ones (both sides added lines) and ask about the rest.
3. **Checks on this machine** (they are cheaper than CI): `pnpm check`, `pnpm build`, and `pnpm test:e2e` when anything under `src/app`, `src/components` or `src/modules/*/components` changed. Fix failures before going on.
4. **Docs:** if the change makes AGENTS.md, a doc, `.env.example` or `docs/ENVIRONMENT.md` wrong, update them in this branch.
5. **Push and open:** `git push -u origin HEAD`, then `gh pr create --base main` with a Conventional Commit title (≤ 72 characters) and the filled `.github/pull_request_template.md`.
6. **Self-review** `git diff origin/main...HEAD` against AGENTS.md and docs/LESSONS.md: bugs, missing validation or permission checks, money/date handling, error handling, rows keyed by id, empty/loading/error states, a11y, tests missing. List findings as critical / warning / nit. Review only this PR's own changes.
7. **Fix** every critical and warning in one commit `fix: address review findings`, re-run the checks, push once.
8. **Comment** on the PR: "## Review — found N (x critical, y warning, z nit) · fixed: … · left (nit): …".
9. **Report** the PR link and, in plain words, what it does and how to try it on the preview. Merging is the owner's call.
